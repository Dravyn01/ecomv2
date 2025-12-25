import {
  BadRequestException,
  Injectable,
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

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
    private readonly notifyService: NotificationService,
  ) {}

  // TODO: add logger

  async findAll(): Promise<Stock[]> {
    return await this.stockRepo.find({
      order: { id: 'ASC', movements: { created_at: 'DESC' } },
      relations: ['movements', 'variant'],
    });
  }

  async findByVariant(variant_id: number): Promise<Stock> {
    const stock = await this.stockRepo.findOne({
      where: { variant: { id: variant_id } },
      order: { id: 'ASC' },
      relations: ['movements', 'variant'],
    });
    if (!stock) throw new NotFoundException('ไม่พบรายการสินค้า');
    return stock;
  }

  async IsOutOfStock(variant_id: number, qty: number): Promise<void> {
    const stock = await this.findByVariant(variant_id);
    if (stock.quantity <= 0 || stock.quantity < qty)
      throw new BadRequestException('สินค้าในสต็อกหมดแล้ว');
  }

  async addQuantity(dto: AddQuantityDTO): Promise<void> {
    await this.stockRepo.manager.transaction(async (tx) => {
      const payload = {
        quantity: dto.quantity,
        variant_id: dto.variant_id,
        change_type: StockChangeType.IN,
      };

      await this.createMovement(payload, tx);
    });
  }

  async notifyStock(variant_id: number, qty: number): Promise<void> {
    const stock = await this.findByVariant(variant_id);
    const remaining = stock.quantity - qty;

    console.log('remaining', remaining);

    if (remaining === 0 && stock.status !== StockStatus.OUT) {
      await this.notifyService.createStockAlert(
        stock.variant.id,
        StockStatus.OUT,
      );
      stock.status = StockStatus.OUT;
    }

    if (remaining <= 10 && remaining > 0 && stock.status !== StockStatus.LOW) {
      await this.notifyService.createStockAlert(
        stock.variant.id,
        StockStatus.LOW,
      );
      stock.status = StockStatus.LOW;
    }

    await this.stockRepo.save(stock);
  }

  async createMovement(req: CreateMovementDTO, tx: EntityManager) {
    // โหลดข้อมูล variant พร้อม stock
    const variant = await tx.findOne(ProductVariant, {
      where: { id: req.variant_id },
      relations: ['stock'],
    });
    if (!variant) throw new NotFoundException('ไม่พบสินค้า');

    const stock = variant.stock;
    if (!stock) {
      // กัน edge case: ไม่พบ stock ของสินค้านี้
      throw new NotFoundException('ไม่พบสต็อกของสินค้านี้');
    }

    let newQuantity = stock.quantity;

    // ปรับจำนวนตามประเภทของ change_type
    if (
      req.change_type === StockChangeType.IN ||
      req.change_type === StockChangeType.RETURN
    ) {
      console.log('CASE IN OR RETURN');
      newQuantity += req.quantity;
    } else if (req.change_type === StockChangeType.OUT) {
      console.log('CASE OUT');

      // ตรวจสอบว่าสต็อกพอต่อการตัดหรือไม่
      if (stock.quantity < req.quantity) {
        throw new BadRequestException(
          `จำนวนสินค้าในสต็อกไม่เพียงพอ (มี ${stock.quantity} ชิ้น แต่ต้องการ ${req.quantity} ชิ้น)`,
        );
      }

      newQuantity -= req.quantity;
    } else if (req.change_type === StockChangeType.ADJUST) {
      console.log('CASE ADJUST');

      // ปรับจำนวนแบบเพิ่ม/ลดตรง ๆ
      newQuantity += req.quantity;

      // ถ้าติดลบให้บังคับเป็น 0 เพื่อป้องกันค่าสต็อกผิดปกติ
      if (newQuantity < 0) newQuantity = 0;
    }

    // สร้าง default note ตามประเภท movement
    const defaultNote = {
      [StockChangeType.IN]: `Import product #${variant.id}, quantity: ${req.quantity}`,
      [StockChangeType.OUT]: `Order #${req.order_id}`,
      [StockChangeType.ADJUST]: `Adjust product #${variant.id}, quantity: ${req.quantity}`,
      [StockChangeType.RETURN]: `Return product #${variant.id}, quantity: ${req.quantity}`,
    };

    // เตรียมข้อมูลสำหรับบันทึก stock + movement
    const saved_stock = { ...stock, quantity: newQuantity };

    const saved_movement = {
      stock: { id: stock.id },
      quantity: req.quantity,
      change_type: req.change_type,
      note: req.note ?? defaultNote[req.change_type],
      ...(req.order_id && { order: { id: req.order_id } }),
    };

    // บันทึกลงฐานข้อมูล
    await tx.save(Stock, saved_stock);
    await tx.save(StockMovement, saved_movement);
  }
}
