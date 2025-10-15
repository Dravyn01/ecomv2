import { ProductVariant } from 'src/modules/product-variant/entities/product-variant.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity('colors')
export class Color {
  @PrimaryGeneratedColumn({ name: 'color_id' })
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 7 })
  hex_code: string;

  @OneToOne(() => ProductVariant, (variant) => variant.color)
  variant: ProductVariant;
}
