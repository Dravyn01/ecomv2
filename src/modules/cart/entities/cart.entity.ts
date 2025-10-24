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
  created_at: Date;

  @OneToOne(() => User, (user) => user.cart, { nullable: true })
  @JoinColumn()
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];
}

@Entity('cart_item')
export class CartItem {
  @PrimaryGeneratedColumn({ name: 'cart_item_id' })
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn()
  created_at: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  cart: Cart; // One Cart Many CartItem

  @ManyToOne(() => ProductVariant, (variant) => variant.cart_items)
  @JoinColumn()
  variant: ProductVariant; // One ProductVariant One CartItem
}
