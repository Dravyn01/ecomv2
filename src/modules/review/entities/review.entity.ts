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
  @PrimaryGeneratedColumn({ name: 'review_id' })
  id: number;

  @ManyToOne(() => User, (user) => user.reviews, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user?: User;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: Product;

  @Column({ type: 'text', nullable: true })
  image_url?: string;

  @Column()
  rating: number; //

  @Column({ length: 255 })
  comment: string;

  @CreateDateColumn()
  created_at: Date;
}
