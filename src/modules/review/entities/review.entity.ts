import { Product, User } from 'src/config/entities.config';
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
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product?: Product;

  @Column({ type: 'text', nullable: true })
  image_url?: string;

  @Column()
  rating: number; //

  @Column({ length: 255 })
  comment: string;

  @CreateDateColumn()
  created_at: Date;
}
