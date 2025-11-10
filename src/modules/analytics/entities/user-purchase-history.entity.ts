import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Order } from 'src/modules/order/entities/order.entity';

@Entity('user_purchase_history')
export class UserPurchaseHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
  order: Order;

  @Column({ default: 0 })
  total_purchases: number; // จำนวนครั้งที่ซื้อสินค้านี้ทั้งหมด

  @Column({ default: false })
  is_repeat: boolean; // สินค้านี้ถือว่าซื้อซ้ำแล้วไหม

  @Column({ type: 'timestamp', nullable: true })
  last_purchased_at: Date; // เวลาที่ซื้อครั้งล่าสุด

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
