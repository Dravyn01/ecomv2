import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Category, Review } from 'src/config/entities.config';
import { ProductVariant } from 'src/modules/product-variant/entities/product-variant.entity';
import { Wishlist } from 'src/modules/wishlist/entities/wishlist.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ name: 'product_id' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  // # price
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  discount_price?: number | null;

  // # time stamp
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // # rating
  // add type: 'bigint' if large project
  @Column({ default: 0 })
  review_count: number;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0.0 })
  avg_rating: number; // 5.0, 4.80, 3.00

  @Column({ default: 0 })
  sales_count: number; //

  @Column({ default: 0 })
  recent_sales: number; // ยอดขายในช่วงเวลา

  @Column({ default: 0 })
  wishlist_count: number; //จำนวนที่ถูกเพิ่มเข้า wishlist

  @Column({ default: 0 })
  return_count: number; // อัตราการคืนสินค้า

  @Column({ default: 0 })
  view_count: number; // จำนวนการเข้าชม

  // repeat_purchase_rate // อัตราการสั่งซื้อช้ำ

  // # relations
  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    onDelete: 'CASCADE', // Delete Product Delete all Variant
  })
  variants: ProductVariant[];

  @ManyToMany(() => Category, (category) => category.products)
  categories: Category[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlists: Wishlist[];
}
