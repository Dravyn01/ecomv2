import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Order } from 'src/modules/order/entities/order.entity';

// entity สำหรับบันทึกว่า user ซื้อสินค้าซิ้นนี้ไปกี่ครั้งแล้ว
@Entity('user_purchase_history')
export class UserPurchaseHistory {
  @PrimaryGeneratedColumn({ name: 'user_purchase_id' })
  id: number;

  /* ผู้สั่งซื้อ */
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  /* สินค้าที่สั่งซื้อ */
  @OneToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn()
  product: Product;

  /* ออลเดอร์ที่สั่งซื้อ */
  @OneToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  order: Order;

  /* จำนวนครั้งที่ซื้อสินค้านี้ทั้งหมด */
  @Column({ default: 0 })
  total_purchases: number;

  /* เวลาที่ซื้อครั้งล่าสุด */
  @Column({ type: 'timestamp', nullable: true })
  last_purchased_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
