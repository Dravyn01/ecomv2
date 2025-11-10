import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('daily_repeat_stats')
export class DailyRepeatStats {
  @PrimaryGeneratedColumn()
  id: number;

  //
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'date' })
  date: string; // วันที่เก็บข้อมูล เช่น '2025-11-05'

  //
  @Column({ default: 0 })
  repeat_count: number;

  //
  @Column({ type: 'float', default: 0 })
  repeat_rate: number;

  //
  @Column({ default: 0 })
  new_buyers: number; // ผู้ซื้อใหม่ในวันนั้น

  //
  @Column({ default: 0 })
  returning_buyers: number; // ผู้ซื้อซ้ำในวันนั้น

  @CreateDateColumn()
  created_at: Date;
}
