import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Category } from 'src/config/entities.config';
import { ProductVariant } from 'src/modules/product-variant/entities/product-variant.entity';

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
  @Column({ default: 0 })
  review_count: number;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0.0 })
  avg_rating: number; // 5.0, 4.80, 3.00

  // # relations
  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    onDelete: 'CASCADE', // Delete Product Delete all Variant
  })
  variants: ProductVariant[];

  @ManyToMany(() => Category, (category) => category.products)
  categories: Category[];
}
