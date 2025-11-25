import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OrderItem } from 'src/modules/order/entities/order.entity';
import { Size } from 'src/modules/size/entities/size.entity';
import { Color } from 'src/modules/color/entities/color.entity';
import { CartItem } from 'src/modules/cart/entities/cart.entity';
import { Product } from 'src/config/entities.config';
import { Stock } from 'src/modules/stock/entities/stock.entity';

export enum ProductVariantStatus {
  ACTIVE,
  INACTIVE,
  OUT_OF_STOCK,
  DELETED,
}

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn({ name: 'product_variant_id' })
  id: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  /* example: PD-BLK-XL-003 */
  @Column({ type: 'varchar', length: 100 }) // should be unique
  sku: string;

  @Column({ type: 'text' })
  image_url: string;

  @Column({
    type: 'enum',
    enum: ProductVariantStatus,
    default: ProductVariantStatus.INACTIVE,
  })
  status: ProductVariantStatus;

  @CreateDateColumn()
  created_at: Date;

  // One Variant Many OrderItem
  @OneToMany(() => OrderItem, (orderItem) => orderItem.variant)
  order_items: OrderItem[];

  // One Variant Many CartItem
  @OneToMany(() => CartItem, (cartItem) => cartItem.variant)
  cart_items: CartItem[];

  // Many Variant One Product
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  product: Product;

  // Many Variant One Color
  @ManyToOne(() => Color, (color) => color.variant)
  @JoinColumn()
  color: Color;

  // Many Variant One Size
  @ManyToOne(() => Size, (size) => size.variant)
  @JoinColumn()
  size: Size;

  // One Variant One Stock
  @OneToOne(() => Stock, (stock) => stock.variant, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  stock: Stock;
}
