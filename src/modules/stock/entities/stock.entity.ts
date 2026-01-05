import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StockChangeType } from '../enums/stock-change.enum';
import { ProductVariant } from 'src/modules/product-variant/entities/product-variant.entity';
import { Order } from 'src/modules/order/entities/order.entity';

export enum StockStatus {
  NONE = 'NONE',
  OUT = 'OUT',
  LOW = 'LOW',
}

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn({ name: 'stock_id' })
  id: number;

  @OneToOne(() => ProductVariant, (variant) => variant.stock)
  variant: ProductVariant;

  @Column({ type: 'enum', enum: StockStatus, default: StockStatus.NONE })
  status: StockStatus;

  @Column('int')
  quantity: number;

  @OneToMany(() => StockMovement, (movement) => movement.stock, {
    cascade: true,
  })
  movements: StockMovement[];

  @CreateDateColumn()
  created_at: Date;

  /* มีการเพิ่มจำนวน ลดจำนวน เมื่อไหร่ */
  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn({ name: 'stock_movement_id' })
  id: number;

  @Column({ type: 'enum', enum: StockChangeType })
  change_type: StockChangeType;

  @ManyToOne(() => Stock, (stock) => stock.movements, { onDelete: 'CASCADE' })
  stock: Stock;

  @Column('int')
  quantity: number; // จำนวนสินค้าที่ถูกเพิ่ม/ลบ/คืน

  /* หมายเหตุ (optional) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  note?: string;

  /*
   * เคสที่ movement เกิดจาก order (RETURN, CHECKOUT, CANCEL)
   * */
  @ManyToOne(() => Order, (order) => order.movements, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  order?: Order;

  @CreateDateColumn()
  created_at: Date;
}
