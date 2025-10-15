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

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 100 })
  sku: string;

  @Column({ type: 'text' })
  image_url: string;

  @CreateDateColumn()
  added_at: Date;

  // One OrderItem One ProductVariant
  @OneToOne(() => OrderItem, (orderItem) => orderItem.variants)
  order_item: OrderItem;

  // One CartItem One ProductVariant
  @OneToOne(() => CartItem, (cartItem) => cartItem.variant)
  cart_item: CartItem;

  // One Product Many Variant
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn() // fk
  product: Product;

  // One Variant One Color
  @OneToOne(() => Color, (color) => color.variant)
  @JoinColumn()
  color: Color;

  // One Variant One Size
  @OneToOne(() => Size, (size) => size.variant)
  @JoinColumn()
  size: Size;
}
