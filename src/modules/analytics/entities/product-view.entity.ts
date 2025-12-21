import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product, User } from 'src/config/entities.config';

@Entity('product_views')
export class ProductView {
  @PrimaryGeneratedColumn({ name: 'product-view-id' })
  id: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @OneToOne(() => User)
  user: User; // คนกดดู (ถ้ามี)

  @Column({ nullable: true })
  ip_address: string; // ถ้า user ไม่ล็อกอิน

  @Column({ nullable: true })
  user_agent: string;

  @Column({ default: 0 })
  total_view: number;

  @Column({ type: 'timestamp', nullable: false })
  last_view_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
