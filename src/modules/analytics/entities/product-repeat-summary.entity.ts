import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('product_repeat_summary')
export class ProductRepeatSummary {
  @PrimaryGeneratedColumn()
  id: number;

  //
  @ManyToOne(() => Product, (product) => product.repeat_summaries, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column({ default: 0 })
  repeat_count: number; // จำนวนครั้งที่ถูกซื้อซ้ำทั้งหมด

  @Column({ type: 'float', default: 0 })
  repeat_rate: number; // อัตราการซื้อซ้ำ (%)

  @Column({ default: 0 })
  total_orders: number; // ออเดอร์รวมทั้งหมดที่เกี่ยวกับสินค้านี้

  @Column({ default: 0 })
  unique_buyers: number; // จำนวนผู้ซื้อไม่ซ้ำ (distinct users)

  @Column({ type: 'timestamp', nullable: true })
  last_calculated_at: Date; // เวลาที่คำนวณล่าสุด

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
