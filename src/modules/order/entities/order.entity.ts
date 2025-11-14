import { User } from 'src/config/entities.config';
import { ProductVariant } from 'src/config/entities.config';
import { StockMovement } from 'src/modules/stock/entities/stock.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';

// TODO: add comment

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
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // One Shipment Many Order
  // @ManyToOne(() => Shipment, (shipment) => shipment.orders)
  // @JoinColumn({ name: 'shipment_id' })
  // shipment: Shipment;

  @OneToMany(() => StockMovement, (movement) => movement.order, {
    nullable: true,
  })
  movements: StockMovement[];

  // One Order Many Order Item
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];
}

@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn({ name: 'order_item_id' })
  id: number;

  @Column()
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  unit_price: number; //

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_price: number; //

  // Many CartItem One Order
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinTable()
  order: Order;

  // Many CartItem One ProductVariant
  @ManyToOne(() => ProductVariant, (variant) => variant.order_items, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  variant: ProductVariant;
}
