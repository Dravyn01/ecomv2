import { Conversation, Review } from 'src/config/entities.config';
import { LoginHistory } from 'src/modules/auth/entities/login-history.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { Message } from 'src/modules/message/entities/message.entity';
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

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SUPPORT = 'SUPPORT',
}

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

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

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

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToOne(() => Conversation, (con) => con.user)
  conversation: Conversation;

  @OneToMany(() => LoginHistory, (hi) => hi.user)
  logined_history: LoginHistory;
}
