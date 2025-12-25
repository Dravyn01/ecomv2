import { User } from 'src/config/entities.config';
import { ProductVariant } from 'src/config/entities.config';
import { StockMovement } from 'src/modules/stock/entities/stock.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';
import { Payment } from 'src/modules/payment/entities/payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  id: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus = OrderStatus.PENDING;

  @CreateDateColumn()
  order_date: Date;

  // One User Many Order
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  // One Shipment Many Order
  // @ManyToOne(() => Shipment, (shipment) => shipment.orders)
  // @JoinColumn({ name: 'shipment_id' })
  // shipment: Shipment;

  // One Order Many Movement
  @OneToMany(() => StockMovement, (movement) => movement.order, {
    nullable: true,
  })
  movements: StockMovement[];

  // One Order Many Order Item
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];

  // One Order One Payment
  @OneToOne(() => Payment, (p) => p.order, {
    onDelete: 'CASCADE',
  })
  payment: Payment;
}

@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn({ name: 'order_item_id' })
  id: number;

  @Column()
  quantity: number; // จำนวนสินค้า

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  unit_price: number; // ราคาต่อซิ้น

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_price: number; // ราคาสินค้า * จำนวน

  // Many OrderItem One Order
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;

  // Many OrderItem One ProductVariant
  @ManyToOne(() => ProductVariant, (variant) => variant.order_items, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  variant: ProductVariant;
}
