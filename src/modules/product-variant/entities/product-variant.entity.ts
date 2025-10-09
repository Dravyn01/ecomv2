import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinTable,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
import { OrderItem } from 'src/modules/order/entities/order.entity';
import { Size } from 'src/modules/size/entities/size.entity';
import { Color } from 'src/modules/color/entities/color.entity';
import { CartItem } from 'src/modules/cart/entities/cart.entity';
import { Product } from 'src/config/entities.config';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn({ name: 'product_variant_id' })
  id: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' }) // fk
  product: Product;

  @ManyToOne(() => Color, (color) => color.variant)
  @JoinColumn({ name: 'color_id' })
  color: Color;

  @ManyToOne(() => Size, (size) => size.variant)
  @JoinColumn({ name: 'size_id' })
  size: Size;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 100 })
  sku: string;

  @Column({ type: 'text' })
  image_url: string;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.variants)
  @JoinTable({ name: 'order_item_id' })
  order_item: OrderItem;

  @OneToOne(() => CartItem, (cartItem) => cartItem.variant)
  @JoinTable({ name: 'cart_item_id' })
  cart_item: CartItem;

  @CreateDateColumn()
  added_at: Date;
}
