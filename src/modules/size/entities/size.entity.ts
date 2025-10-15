import { ProductVariant } from 'src/modules/product-variant/entities/product-variant.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn({ name: 'sizes_id' })
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @OneToMany(() => ProductVariant, (variant) => variant.size)
  variant: ProductVariant[];
}
