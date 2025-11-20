import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Stock, StockMovement } from './entities/stock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariant } from 'src/config/entities.config';
import { StockChangeType } from './enums/stock-change.enum';
import { CreateMovementDTO } from './dto/create-movement.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
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
    if (!stock) throw new NotFoundException('not found variant');
    return stock;
  }

  async deleteMovement(movement_id: number) {
    await this.stockRepo.delete(movement_id);
  }

  async IsOutOfStock(variant_id: number, qty: number): Promise<void> {
    const stock = await this.stockRepo.findOneBy({
      variant: { id: variant_id },
    });
    if (!stock) throw new NotFoundException('not found variant');
    if (stock.quantity <= 0 || stock.quantity <= qty)
      throw new BadRequestException('สินค้าในสต็อกหมดแล้ว');
  }

  /*
   * function นี้จัดการการเปลี่ยนแปลงจำนวนสินค้าในสต็อกทั้งหมด:
   *   1) โหลดข้อมูล variant พร้อม stock
   *   2) ปรับจำนวนสินค้าใน stock ตาม change_type
   *   3) ป้องกันค่า stock ผิดปกติ เช่น ติดลบ หรือหายไป
   *   4) บันทึกการเปลี่ยนแปลงลงใน stock movement log
   *
   * --- Logic ตามประเภท change_type ---
   *
   *  - IN / RETURN:
   *        เพิ่มจำนวนสินค้าเข้าสต็อกตามจำนวนที่รับมา
   *
   *  - OUT:
   *        ลดจำนวนสินค้าออกจากสต็อก
   *        ต้องตรวจสอบก่อนว่าจำนวนใน stock เพียงพอหรือไม่
   *        ถ้า stock < จำนวนที่ต้องการตัด → หยุดและแจ้ง error ทันที
   *
   *  - ADJUST:
   *        เอาจำนวนในสต็อกปัจจุบัน + quantity
   *        ถ้าค่าที่ได้เป็นค่าติดลบ → ให้บังคับเป็น 0 เพื่อป้องกันค่าสต็อกผิดปกติ
   *
   * หลังประมวลผลทุกเคส:
   *   - อัปเดตจำนวนใหม่ลง stock table
   *   - บันทึก movement log เพื่อเก็บประวัติ
   */
  async createMovement(req: CreateMovementDTO, tx: EntityManager) {
    console.log('createMovement start');
    console.log('req', req);

    // 1) โหลดข้อมูล variant พร้อม stock
    const variant = await tx.findOne(ProductVariant, {
      where: { id: req.variant_id },
      relations: ['stock'],
    });
    if (!variant) throw new NotFoundException('ไม่พบสินค้า');

    const stock = variant.stock;
    if (!stock) {
      // กัน edge case: ไม่พบ stock ของสินค้านี้
      throw new NotFoundException('ไม่พบข้อมูลสต็อกของสินค้านี้');
    }

    let newQuantity = stock.quantity;

    // 2) ปรับจำนวนตามประเภทของ change_type
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

    // 3) สร้าง note เริ่มต้นตามประเภท movement
    const defaultNote = {
      [StockChangeType.IN]: `Import product #${variant.id}, quantity: ${variant.id}`,
      [StockChangeType.OUT]: `Order #${req.order_id}`,
      [StockChangeType.ADJUST]: `Adjust product #${variant.id}, quantity: ${variant.id}`,
      [StockChangeType.RETURN]: `Return product #${variant.id}, quantity: ${variant.id}`,
    };

    // 4) เตรียมข้อมูลสำหรับบันทึก stock + movement
    const saved_stock = { ...stock, quantity: newQuantity };

    const saved_movement = {
      stock: { id: stock.id },
      quantity: req.quantity,
      change_type: req.change_type,
      note: req.note ?? defaultNote[req.change_type],
      ...(req.order_id && { order: { id: req.order_id } }),
    };

    // 5) บันทึกลงฐานข้อมูล
    await tx.save(Stock, saved_stock);
    await tx.save(StockMovement, saved_movement);
  }
}
