import { Product } from 'src/modules/product/entities/product.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('wishlist')
export class Wishlist {
  @PrimaryGeneratedColumn({ name: 'wishlist_id' })
  id: number;

  @OneToOne(() => User, (user) => user.wishlists, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToOne(() => Product, (product) => product.wishlists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: Product;

  @CreateDateColumn()
  created_at: Date;
}
