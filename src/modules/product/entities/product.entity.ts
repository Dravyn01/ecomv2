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
import { ProductStats } from 'src/modules/analytics/entities/product-stats.entity';

export enum ProductStatus {
  DRAFT,
  ACTIVE,
  INACTIVE,
  DELETED,
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' })
  id: string;

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
  @OneToOne(() => Wishlist, (wishlist) => wishlist.product)
  wishlists: Wishlist[];

  // One Product One ProductRepeatSummary
  @OneToOne(() => ProductStats, (stats) => stats.product)
  stats: ProductStats;
}
