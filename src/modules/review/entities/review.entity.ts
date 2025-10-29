import { ProductVariant, User } from 'src/config/entities.config';
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
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reviews, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user?: User;

  @ManyToOne(() => ProductVariant, (variant) => variant.reviews, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  variant?: ProductVariant;

  @Column()
  rating: number;

  @Column({ length: 255 })
  comment: string;

  @CreateDateColumn()
  created_at: Date;
}
