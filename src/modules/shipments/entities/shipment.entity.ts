import { Order } from 'src/config/entities.config';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

// ขนส่ง
export enum Carrier {
  THUNDER_EXPRESS = 'THUNDER_EXPRESS',
  EASY_EXPRESS = 'EASY_EXPRESS',
}

// Order Status
export enum ShippingStatus {
  PENDING = 'PENDING', // ยังไม่ถูกจัดส่ง (รอ warehouse)
  IN_TRANSIT = 'IN_TRANSIT', // สินค้าอยู่ระหว่างการจัดส่ง
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', // สินค้าออกไปให้ delivery แล้ว
  DELIVERED = 'DELIVERED', // สินค้าส่งถึงผู้รับเรียบร้อย
  CANCELLED = 'CANCELLED', // การจัดส่งถูกยกเลิ
  EXCEPTION = 'EXCEPTION', // การจัดส่งล่าช้า / มีปัญหา (Delayed / Exception)
}

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn({ name: 'shipment_id' })
  id: number;

  @Column({ type: 'enum', enum: Carrier, default: Carrier.THUNDER_EXPRESS })
  carrier: Carrier;

  @Column({ type: 'varchar', length: 50 })
  tracking_number: string;

  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.PENDING,
  })
  status: ShippingStatus;

  @CreateDateColumn()
  shipped_at: Date;

  @Column({ type: 'timestamp' })
  delivered_at: Date;

  // One Shipment Many Order
  @OneToMany(() => Order, (order) => order.shipment)
  orders: Order[];
}
