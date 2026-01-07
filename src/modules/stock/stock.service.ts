import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Stock, StockMovement, StockStatus } from './entities/stock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { StockChangeType } from './enums/stock-change.enum';
import { CreateMovementDTO } from './dto/create-movement.dto';
import { NotificationService } from '../notification/notification.service';
import { AddQuantityDTO } from './dto/add-quantity.dto';
import { ProductVariant } from '../product-variant/entities/product-variant.entity';
import { FindAllStockDTO } from './dto/find-all-stock.dto';

@Injectable()
export class StockService {
  private readonly className = 'stock.service';
  private readonly logger = new Logger(StockService.name);

  constructor(
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
    private readonly notifyService: NotificationService,
  ) {}

  async findAll(query: FindAllStockDTO): Promise<Stock[]> {
    return await this.stockRepo.find({
      where: {
        variant: {
          ...(query.product_id && { product: { id: query.product_id } }),
        },
      },
      order: { created_at: query.order },
      take: query.product_id ? undefined : 15,
      relations: ['movements', 'variant'],
    });
  }

  async findByVariant(variant_id: string): Promise<Stock> {
    const stock = await this.stockRepo.findOne({
      where: { variant: { id: variant_id } },
      relations: ['movements', 'variant'],
    });
    if (!stock) throw new NotFoundException('ไม่พบรายการสินค้า');
    return stock;
  }

  /**
   * เช็คว่าสต็อกเพียงพอสำหรับการตัดไหม
   *
   * business rules:
   * - ถ้าสต็อกคงเหลือ <= 0 หรือ สต็อกคงเหลือ < จำนวนที่ต้องการตัด
   *   @throws BadRequestException
   *
   * @returns Promise<void>
   * */
  async isOutOfStock(variant_id: string, qty: number): Promise<void> {
    const stock = await this.findByVariant(variant_id);
    if (stock.quantity <= 0 || stock.quantity < qty)
      throw new BadRequestException('สินค้าในสต็อกหมดแล้ว');
  }

  /**
   * import สินค้าเข้าคลัง โดยแอดมิน
   *
   * @param dto ข้อมูลสำหรับเพิ่มจำนวนเข้าสต็อก
   *
   * @returns Promise<Stock>
   * */
  async addQuantity(dto: AddQuantityDTO): Promise<Stock> {
    const stock = await this.stockRepo.manager.transaction(async (tx) => {
      const payload = {
        quantity: dto.quantity,
        variant_id: dto.variant_id,
        change_type: StockChangeType.IN,
      };

      const updatedStock = await this.createMovement(payload, tx);

      this.logger.log(`[${this.logger.log}::addQuantity] ADDED QUANTITY`, {
        stock_id: updatedStock.id,
        payload,
      });

      return updatedStock;
    });

    return stock;
  }

  /**
   * ตรวจสอบจำนวนสต็อกคงเหลือหลังการตัดสินค้า
   * และอัปเดตสถานะสต็อก พร้อมแจ้งเตือน admin ตามเงื่อนไข
   *
   * bsuiness rules:
   * - ถ้าสต็อกคงเหลือ = 0 เปลี่ยนสถานะเป็น OUT และแจ้งเตือน
   * - ถ้าสต็อกคงเหลือ <= 15 เปลี่ยนสถานะเป็น LOW และแจ้งเตือน
   * - ถ้าสถานะเดิมตรงกับสถานะใหม่ จะไม่แจ้งเตือนซ้ำ
   *
   * side effects:
   * - UPDATE stock.status
   * - INSERT notification (แจ้ง admin)
   *
   * @param variant_id รหัสสินค้า (variant)
   * @param qty จำนวนสินค้าที่กำลังจะถูกตัดออกจากสต็อก
   */
  async notifyStock(variant_id: string, qty: number): Promise<void> {
    const stock = await this.findByVariant(variant_id);
    const remaining = stock.quantity - qty;

    if (remaining === 0 && stock.status !== StockStatus.OUT) {
      await this.notifyService.createStockAlert(
        stock.variant.id,
        StockStatus.OUT,
      );

      this.logger.warn(`[${this.className}::notifyStock] CASE OUT`, {
        stock_id: stock.id,
        variant: variant_id,
        quantity: qty,
        befor_status: stock.status,
        after_status: StockStatus.OUT,
      });

      stock.status = StockStatus.OUT;
    }

    if (remaining <= 15 && remaining > 0 && stock.status !== StockStatus.LOW) {
      await this.notifyService.createStockAlert(
        stock.variant.id,
        StockStatus.LOW,
      );

      this.logger.warn(`[${this.className}::notifyStock] CASE OUT`, {
        stock_id: stock.id,
        variant: variant_id,
        stock_qty: stock.quantity,
        quantity: qty,
        befor_status: stock.status,
        after_status: StockStatus.LOW,
      });

      stock.status = StockStatus.LOW;
    }

    await this.stockRepo.save(stock);

    this.logger.log(`[${this.className}::notifyStock] CASE OUT`, {
      stock_id: stock.id,
      variant: variant_id,
      status: stock.status,
    });
  }

  /**
   * บันทึกการเคลื่อนไหวของสต็อก (StockMovement)
   * และปรับจำนวนในสต็อกในคำสั่งเดียว
   *
   * IMPORTANT:
   * - function นี้ "เปลี่ยน state ของสต็อกจริง"
   * - มีผลกับจำนวน stock ในระบบทันที
   * - ควรถูกเรียกภายใน transaction เท่านั้น
   *
   * Behavior ตาม change_type:
   * - IN      : เพิ่มจำนวนสต็อก
   * - OUT     : ตัดจำนวนสต็อก (ใช้กับ Order / Checkout)
   * - RETURN  : คืนสต็อกกลับเข้า
   * - ADJUST  : ปรับสต็อกตรง (+/-) เพื่อแก้ไขข้อมูล
   *
   * Validation:
   * - ตรวจสอบว่า variant และ stock ต้องมีอยู่
   * - กรณี OUT จะตรวจสอบว่าสต็อกเพียงพอก่อนตัด
   * - ป้องกัน stock ติดลบ
   *
   * Side Effects:
   * - UPDATE Stock.quantity
   * - INSERT StockMovement
   *
   * @param dto  ข้อมูลการเปลี่ยนแปลงสต็อก
   * @param tx    EntityManager จาก transaction
   *
   * @throws NotFoundException  เมื่อไม่พบสินค้า หรือไม่พบสต็อก
   * @throws BadRequestException เมื่อสต็อกไม่เพียงพอในกรณี OUT
   *
   * @returns Promise<Stock> - สต็อกที่อัพเดทจำนวนแล้ว
   */
  async createMovement(
    dto: CreateMovementDTO,
    tx: EntityManager,
  ): Promise<Stock> {
    // โหลดข้อมูล variant พร้อม stock
    const variant = await tx.findOne(ProductVariant, {
      where: { id: dto.variant_id },
      relations: ['stock'],
    });
    if (!variant) throw new NotFoundException('ไม่พบสินค้า');

    const stock = variant.stock;
    if (!stock) {
      // กัน edge case: ไม่พบ stock ของสินค้านี้
      // ถึงแม้ตอนสร้างรายการสินค้าจะมีการสร้างสต็อกควบคู่ด้วยก็เถอะ
      throw new NotFoundException('ไม่พบสต็อกของสินค้านี้');
    }

    let newQuantity = stock.quantity;

    // ปรับจำนวนตามประเภทของ change_type
    if (
      dto.change_type === StockChangeType.IN ||
      dto.change_type === StockChangeType.RETURN
    ) {
      newQuantity += dto.quantity;

      this.logger.log(
        `[${this.className}::createMovement] CASE=${dto.change_type}`,
        { variant: dto.variant_id, order: dto.order_id, qty: newQuantity },
      );
    } else if (dto.change_type === StockChangeType.OUT) {
      // เช็คว่าสต็อกพอต่อการตัดหรือไม่
      // จำนวนในสต็อก น้อยกว่า จำนวนที่ต้องการตัดไหม
      if (stock.quantity < dto.quantity) {
        this.logger.warn(
          `[${this.className}::createMovement] IN CASE=OUT คำสั่งซื้อ=${dto.order_id} ต้องการตัดสต็อกแต่จำนวนที่ในสต็อกเหลือน้อยกว่า`,
        );

        throw new BadRequestException(
          `จำนวนสินค้าในสต็อกไม่เพียงพอ (มี ${stock.quantity} ชิ้น แต่ต้องการ ${dto.quantity} ชิ้น)`,
        );
      }

      // decrement quantity
      newQuantity -= dto.quantity;

      this.logger.log(
        `[${this.className}::createMovement] IN CASE=OUT ลดจำนวนในสต็อกไป=${newQuantity} ค่าก่อนลบ=${stock.quantity}`,
      );
    } else if (dto.change_type === StockChangeType.ADJUST) {
      // ปรับจำนวนแบบเพิ่ม/ลดตรง ๆ
      newQuantity += dto.quantity;

      this.logger.warn(`[${this.className}::createMovement] CASE=ADJUST`, {
        variant: dto.variant_id,
        adjust_type: dto.quantity >= 0 ? 'POSATIVE' : 'NEGATIVE',
        raw_value: dto.quantity,
      });

      // ถ้าติดลบให้บังคับเป็น 0 เพื่อป้องกันค่าสต็อกผิดปกติ
      if (newQuantity < 0) newQuantity = 0;
    }

    // สร้าง default note ตามประเภท movement
    const defaultNote = {
      [StockChangeType.IN]: `Import variant #${variant.id}, quantity: ${dto.quantity}`,
      [StockChangeType.OUT]: `Order #${dto.order_id}`,
      [StockChangeType.ADJUST]: `Adjust variant #${variant.id}, quantity: ${dto.quantity}`,
      [StockChangeType.RETURN]: `Return variant #${variant.id}, quantity: ${dto.quantity}`,
    };

    // อัพเดทจำนวนในสต็อก
    const updatedStock = await tx.save(Stock, {
      stock: { id: stock.id },
      quantity: newQuantity,
    });

    // updated stock log
    this.logger.log(`[${this.className}::createMovement] STOCK UPDATED`, {
      stock_id: stock.id,
      variant_id: dto.variant_id,
      quantity_before: stock.quantity,
      quantity_after: newQuantity,
      change_type: dto.change_type,
    });

    // insert new movement
    const movement = await tx.save(StockMovement, {
      stock: { id: stock.id },
      quantity: dto.quantity,
      change_type: dto.change_type,
      note: dto.note ?? defaultNote[dto.change_type],
      ...(dto.order_id && { order: { id: dto.order_id } }),
    });

    // movement log
    this.logger.log(`[${this.className}::createMovement] INSERT NEW MOVEMENT`, {
      movement_id: movement.id,
      stock_id: stock.id,
      quantity: dto.quantity,
      change_type: dto.change_type,
      order: dto.order_id,
    });

    return updatedStock;
  }
}
