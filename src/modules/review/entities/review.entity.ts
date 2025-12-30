import { Product } from 'src/modules/product/entities/product.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid', { name: 'review_id' })
  id: string;

  /* ผู้รีวิว */
  @ManyToOne(() => User, (user) => user.reviews, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  /* สินค้าที่รีวิว */
  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: Product;

  /* คะแนนรีวิว (1-5) */
  @Column()
  rating: number;

  @Column({ length: 255 })
  comment: string;

  @CreateDateColumn()
  created_at: Date;
}
