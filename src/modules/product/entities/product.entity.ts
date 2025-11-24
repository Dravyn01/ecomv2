import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToOne,
  JoinTable,
} from 'typeorm';
import { Category } from 'src/modules/category/entities/category.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { ProductVariant } from 'src/modules/product-variant/entities/product-variant.entity';
import { Wishlist } from 'src/modules/wishlist/entities/wishlist.entity';
import { ProductRepeatSummary } from 'src/modules/analytics/entities/product-repeat-summary.entity';

export enum ProductStatus {
  DRAFT,
  ACTIVE,
  INACTIVE,
  DELETED,
}

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
  discount_price?: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  // # time stamp
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // # rating
  @Column({ default: 0 })
  review_count: number;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0.0 })
  avg_rating: number; // 5.0, 4.80, 3.00

  @Column({ default: 0 })
  sales_count: number; //

  @Column({ default: 0 })
  wishlist_count: number; //จำนวนที่ถูกเพิ่มเข้า wishlist

  @Column({ default: 0 })
  view_count: number; // จำนวนการเข้าชม

  @Column({ default: 0 })
  return_count: number; // อัตราการคืนสินค้า

  @Column({ type: 'float', default: 0.0 })
  return_rate: number;

  @Column({ type: 'float', default: 0.0 })
  repeat_purchase_rate: number; // อัตราการสั่งซื้อช้ำ

  @Column({ default: 0 })
  repeat_count: number; // จำนวนครั้งที่ผู้ใช้กลับมาซื้อซ้ำ

  @Column({ type: 'float', default: 0.0 })
  popularity_score: number;

  // # relations
  // One Product Many Variant
  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    onDelete: 'CASCADE', // Delete Product Delete all Variant
  })
  variants: ProductVariant[];

  // Many Product Many Category
  @ManyToMany(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinTable({
    name: 'product_categories', // ชื่อตารางกลาง
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  // One Product Many Review
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  // One Product Many Wishlist
  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlists: Wishlist[];

  // One Product One ProductRepeatSummary
  @OneToOne(() => ProductRepeatSummary, (summary) => summary.product)
  repeat_summaries: ProductRepeatSummary;
}
