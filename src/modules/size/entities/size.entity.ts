import { ProductVariant } from 'src/modules/product-variant/entities/product-variant.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn({ name: 'sizes_id' })
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.size)
  variant: ProductVariant[];
}
