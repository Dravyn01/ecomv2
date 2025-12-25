import { Order } from 'src/modules/order/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Entity,
} from 'typeorm';

export enum PaymentStatus {
  INIT = 'INIT',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum PaymentProviders {
  STRIPE = 'STRIPE',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_id' })
  id: string;

  @OneToOne(() => Order, (o) => o.payment, { nullable: true })
  order: Order;

  @Column({
    type: 'enum',
    enum: PaymentProviders,
    default: PaymentProviders.STRIPE,
  })
  provider: PaymentProviders;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column('text')
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.INIT })
  status: PaymentStatus;

  @CreateDateColumn()
  created_at: Date;
}
