import { Product } from 'src/config/entities.config';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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
  products: Product[];

  // เก็บ array ของ Category ที่มาเชื่อม
  // childre ทำหน้าที่บอก sub category ไหนออยู่ใต้เรา or อยู่ใต้หมวดหมู่หลัก = เรา
  @OneToMany(() => Category, (cate) => cate.parent)
  children: Category[];

  // เก็บหมวดหมู่ที่เราไปเชื่อม (nullable ถ้าหมวดหมู่หลักไม่มี sub)
  // parent ทำหน้าที่บอกว่าเราอยู่ใต้หมวดหมู่ไหน  ถ้าสังเกตดีๆ parent จะเก็บ Category = หมวดหมู่หลักที่เราไปเชื่อมเขา
  @ManyToOne(() => Category, (cate) => cate.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
