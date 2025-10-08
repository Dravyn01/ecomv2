import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinTable,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { OrderItem } from 'src/modules/order/entities/order.entity';
import { Size } from 'src/modules/size/entities/size.entity';
import { Color } from 'src/modules/color/entities/color.entity';
import { CartItem } from 'src/modules/cart/entities/cart.entity';
import { Category } from 'src/config/entities.config';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ name: 'product_id' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  discount_price?: number | null;

  // one product many variant
  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @ManyToMany(() => Category, (category) => category.products)
  categories: Category[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

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
}
