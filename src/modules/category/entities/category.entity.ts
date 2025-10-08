import { Product } from 'src/config/entities.config';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ManyToMany(() => Product, (product) => product.categories)
  @JoinTable({
    name: 'product_categories', // ชื่อตารางกลาง
    joinColumn: { name: 'category_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: Product[];

  // ฝั่งหลักของ category เก็บ array ของ parent
  @OneToMany(() => Category, (cate) => cate.parent)
  children: Category[];

  // ฝั่งตัวแทนของ table parent ถ้าไม่ทำ self ref จะเก็บบ object ของงฝัางหลักของ category
  @ManyToOne(() => Category, (cate) => cate.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
