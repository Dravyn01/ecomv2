import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Promotion } from './promotion.entity';
import { Category } from 'src/modules/category/entities/category.entity';

/* โปรโมซั่นสำหรับหมวดหมู่ */
@Entity('promotion_categories')
export class PromotionCategory {
  @PrimaryGeneratedColumn('uuid', { name: 'promotion_category_id' })
  id: string;

  /* promotion ที่มีให้เฉพาะหมวดหมู่ (MTM) */
  @ManyToOne(() => Promotion)
  promotion: Promotion;

  /* หมวดหมู่ที่ได้รับ promotion เฉพาะ (MTM) */
  @ManyToOne(() => Category)
  category: Category;
}
