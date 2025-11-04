import { Product, User } from 'src/config/entities.config';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('wishlist')
@Unique(['user', 'product'])
export class Wishlist {
  @PrimaryGeneratedColumn({ name: 'wishlist_id' })
  id: number;

  @ManyToOne(() => User, (user) => user.wishlists, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, (product) => product.wishlists, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @CreateDateColumn()
  created_at: Date;
}
