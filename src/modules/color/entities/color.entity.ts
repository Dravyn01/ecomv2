import { ProductVariant } from 'src/modules/product/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('colors')
export class Color {
  @PrimaryGeneratedColumn({ name: 'color_id' })
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 7 })
  hex_code: string;

  @OneToMany(() => ProductVariant, (variant) => variant.color)
  variant: ProductVariant[];
}
