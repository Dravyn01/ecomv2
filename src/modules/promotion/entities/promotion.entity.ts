import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PromotionType {
  DISCOUNT = 'DISCOUNT', // ลดราคา (ต้องใช้คู่กับ DiscountType)
  FREE_SHIPPING = 'FREE_SHIPPING', // ส่งฟรี
  BUY_X_GET_Y = 'BUY_X_GET_Y', // ซื้อหนึ่งแถมสอง, ซื้อสองแถมหนึ่ง, ซื้อครบสามชิ้นรับ xxx ไปเลย
  BUY_X_DISCOUNT_X = 'BUY_X_DISCOUNT_X', // ซื้อครบ x ลด x (ต้องใช้คู่กับ DiscountType)
}

/* ประเภพการลดราคา */
export enum DiscountType {
  PERCENT = 'PERCENT', // 10%
  FIXED = 'FIXED', // ลดราคาตายตัว
}

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid', { name: 'promotion_id' })
  id: string;

  /* code: NEWYEAR2026 */
  @Column({ unique: true })
  code: string;

  /* FLASH SELL */
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PromotionType,
  })
  type: PromotionType;

  // PERCENT, FIXED
  @Column({
    type: 'enum',
    enum: DiscountType,
    nullable: true,
  })
  discount_type?: DiscountType;

  // 10 (%) หรือ 100 (บาท)
  @Column({ type: 'decimal', nullable: true })
  discount_value?: number;

  // กันลด 99% แล้วตาย
  @Column({ type: 'decimal', nullable: true })
  max_discount?: number;

  /* ยอดขั้นต่ำ */
  @Column({ type: 'decimal', nullable: true })
  min_order_amount?: number;

  // โปรนี้ยังใช้ได้ไหม
  @Column({ default: true })
  is_active: boolean;

  // เริ่มวันที่
  @Column({ type: 'timestamp' })
  start_at: Date;

  // จบวันที่
  @Column({ type: 'timestamp' })
  end_at: Date;

  // ใช้ได้กี่ครั้ง (0 = ไม่จำกัด)
  @Column({ default: 0 })
  usage_limit: number;

  @Column({ default: 0 })
  used_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
