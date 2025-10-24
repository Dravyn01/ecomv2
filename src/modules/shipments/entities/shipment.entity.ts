import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Carrier, ShippingStatus } from '../enums/shipment.enum';

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
  // @OneToMany(() => Order, (order) => order.shipment)
  // orders: Order[];
}
