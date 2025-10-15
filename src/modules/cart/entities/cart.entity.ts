import { User } from 'src/config/entities.config';
import { ProductVariant } from 'src/config/entities.config';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn({ name: 'cart_id' })
  id: number;

  @CreateDateColumn()
  added_at: Date;

  @OneToOne(() => User, (user) => user.cart, { nullable: true })
  @JoinColumn()
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  cart_items: CartItem[];
}

@Entity('cart_item')
export class CartItem {
  @PrimaryGeneratedColumn({ name: 'cart_item_id' })
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn()
  added_at: number;

  @ManyToOne(() => Cart, (cart) => cart.cart_items)
  @JoinColumn()
  cart: Cart; // One Cart Many CartItem

  @OneToOne(() => ProductVariant, (variant) => variant.cart_item)
  @JoinColumn()
  variant: ProductVariant; // One Product One CartItem
}
