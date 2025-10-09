import { User } from 'src/config/entities.config';
import { ProductVariant } from 'src/modules/product/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn({ name: 'cart_id' })
  id: number;

  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  cart_items: CartItem[];

  @CreateDateColumn()
  added_at: Date;
}

@Entity('cart_item')
export class CartItem {
  @PrimaryColumn({ name: 'cart_item_id' })
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.cart_items)
  @JoinColumn()
  cart: Cart;

  @OneToOne(() => ProductVariant, (variant) => variant.cart_item)
  variant: ProductVariant;

  @Column()
  quantity: number;

  @CreateDateColumn()
  added_at: number;
}
