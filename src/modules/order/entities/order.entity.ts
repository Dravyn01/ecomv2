import { User } from 'src/config/entities.config';
import { ProductVariant } from 'src/config/entities.config';
import { Shipment } from 'src/modules/shipments/entities/shipment.entity';
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

export enum OrderStatus {
  PENDING = 'PENDING', // ผู้ใช้สร้างคำสั่งซื้อแล้ว แต่ยังไม่ได้จ่ายเงิน
  PAID = 'PAID', // จ่ายเงินแล้ว (อาจรอการตรวจสอบการชำระเงิน)
  PROCESSING = 'PROCESSING', // ร้านค้ากำลังเตรียมสินค้า
  SHIPPED = 'SHIPPED', // ร้านค้าส่งสินค้าแล้ว (มี tracking number)
  DELIVERED = 'DELIVERED', // ผู้ใช้ได้รับสินค้าแล้ว
  CANCELLED = 'CANCELLED', // ออเดอร์ถูกยกเลิก (อาจเพราะลูกค้าหรือระบบ)
  REFUNDED = 'REFUNDED', // มีการคืนเงิน (หลังจาก Cancel หรือ Return)
  RETURN_REQUESTED = 'RETURN_REQUESTED', // ลูกค้าส่งคำขอคืนสินค้า
  RETURNED = 'RETURNED', // คืนสินค้าเสร็จสิ้น
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  id: number;

  // 1 user มีหลาย order
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // หลาย order มี 1 ขนส่ง
  @ManyToOne(() => Shipment, (shipment) => shipment.orders)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  // 1 order มีหลาย order item
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  order_item: OrderItem[];

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn()
  order_date: Date;
}

@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn({ name: 'order_item_id' })
  id: number;

  @ManyToOne(() => Order, (order) => order.order_item)
  @JoinTable({ name: 'order_id' })
  order: Order;

  @OneToMany(() => ProductVariant, (variant) => variant.order_item)
  variants: ProductVariant[];

  @Column()
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_price: number;
}
