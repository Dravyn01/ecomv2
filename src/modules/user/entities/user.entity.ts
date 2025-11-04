import { Review } from 'src/config/entities.config';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { Wishlist } from 'src/modules/wishlist/entities/wishlist.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ length: 30 })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // # relations
  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlists: Wishlist[];
}
