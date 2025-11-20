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

/*
 *
 *
 *
 * */

@Entity('user_purchase_history')
export class UserPurchaseHistory {
  @PrimaryGeneratedColumn({ name: 'user_purchase_id' })
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn()
  product: Product;

  @OneToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  order: Order;

  @Column({ default: 0 })
  total_purchases: number; // จำนวนครั้งที่ซื้อสินค้านี้ทั้งหมด

  @Column({ type: 'timestamp', nullable: true })
  last_purchased_at: Date; // เวลาที่ซื้อครั้งล่าสุด

  @CreateDateColumn()
  created_at: Date;
}
