import { Product } from 'src/config/entities.config';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product_stats')
export class ProductStats {
  @PrimaryGeneratedColumn({ name: 'product_stats_id' })
  id: number;

  @ManyToOne(() => Product, (product) => product.stats, {
    onDelete: 'CASCADE',
  })
  product: Product;

  // # SALES — สถิติยอดขายรวม
  @Column({ default: 0 })
  total_orders: number; // จำนวนออเดอร์ทั้งหมดที่มีสินค้านี้อยู่ในรายการ (count orders)

  @Column({ default: 0 })
  total_quantity_sold: number; // จำนวนชิ้นสินค้าทั้งหมดที่ขายออกไป (sum quantity)

  @Column({ type: 'float', default: 0 })
  total_revenue: number; // รายได้รวมจากสินค้านี้ (sum price × quantity)

  // # BUYERS — ลูกค้าใหม่/ลูกค้าซ้ำ
  @Column({ default: 0 })
  unique_buyers: number; // จำนวนลูกค้าที่ซื้อแบบไม่ซ้ำคน (distinct user count)

  @Column({ default: 0 })
  repeat_buyers: number; // จำนวนลูกค้าที่เคยซื้อสินค้านี้มากกว่า 1 ครั้ง

  @Column({ type: 'float', default: 0 })
  repeat_rate: number; // อัตราการซื้อซ้ำ (%) = repeat_buyers / unique_buyers * 100

  // # REVIEWS & RATINGS — คะแนนรีวิว
  @Column({ default: 0 })
  review_count: number; // จำนวนรีวิวทั้งหมดที่ถูกเขียนเกี่ยวกับสินค้านี้

  @Column({ type: 'float', scale: 2, default: 0 })
  avg_rating: number; // คะแนนเฉลี่ยรีวิว เช่น 4.8, 3.5 (0–5)

  // # POPULARITY — ความนิยม
  @Column({ default: 0 })
  wishlist_count: number; // จำนวนครั้งที่สินค้าถูกเพิ่มลง Wishlists (วัดความสนใจ)

  @Column({ default: 0 })
  view_count: number; // จำนวนครั้งที่ผู้ใช้เปิดดูหน้า Product (page views)

  @Column({ type: 'float', default: 0 })
  popularity_score: number; // คะแนนความนิยมรวม (custom formula เช่น views + wishlist × 3 + rating × 10)

  // # RETURNS — การคืนสินค้า
  @Column({ default: 0 })
  total_returns: number; // จำนวนครั้งที่มีการคืนสินค้า (count return events)

  @Column({ default: 0 })
  quantity_returned: number; // จำนวนชิ้นสินค้าที่ถูกคืนรวมทั้งหมด

  @Column({ type: 'float', default: 0 })
  refund_amount: number; // มูลค่าที่ต้องคืนเงินให้ลูกค้ารวมทั้งหมด

  @Column({ type: 'float', scale: 2, default: 0 })
  return_rate: number;

  // # TIME — timestamps
  @CreateDateColumn()
  created_at: Date; // เวลาที่สร้างสถิตินี้ครั้งแรก

  @UpdateDateColumn()
  updated_at: Date; // เวลาอัปเดตล่าสุด (ทุกครั้งที่ค่า stats เปลี่ยน)
}
