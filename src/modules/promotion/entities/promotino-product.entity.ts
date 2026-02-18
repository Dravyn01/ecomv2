import { Product } from 'src/modules/product/entities/product.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Promotion } from './promotion.entity';

/* โปรโมซั่นสำหรับสินค้า  */
@Entity('promotion_products')
export class PromotionProduct {
  @PrimaryGeneratedColumn('uuid', { name: 'promotion_products_id' })
  id: string;

  /* promotion ที่มีให้เฉพาะสินค้า (MTM) */
  @ManyToOne(() => Promotion)
  promotion: Promotion;

  /* สินค้าที่ได้รับ promotion เฉพาะ (MTM) */
  @ManyToOne(() => Product)
  product: Product;
}
