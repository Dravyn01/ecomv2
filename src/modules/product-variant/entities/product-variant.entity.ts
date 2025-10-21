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

  // One ProductVariatn Many OrderItem
  @OneToMany(() => OrderItem, (orderItem) => orderItem.variant)
  order_items: OrderItem[];

  // One ProductVariant Many CartItem
  @OneToMany(() => CartItem, (cartItem) => cartItem.variant)
  cart_items: CartItem[];

  // One Product Many Variant
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  product: Product;

  // One Variant One Color
  @ManyToOne(() => Color, (color) => color.variant)
  @JoinColumn()
  color: Color;

  // One Variant One Size
  @ManyToOne(() => Size, (size) => size.variant)
  @JoinColumn()
  size: Size;

  // One Variant One Size
  @OneToOne(() => Stock, (stock) => stock.variant, { cascade: true })
  @JoinColumn()
  stock: Stock;
}
