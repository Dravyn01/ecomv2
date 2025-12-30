import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ImageOwnerType {
  PRODUCT = 'PRODUCT',
  PROFILE = 'PROFILE',
  REVIEW = 'REVIEW',
  VARIANT = 'VARIANT',
  MESSAGE = 'MESSAGE',
}

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid', { name: 'image_id' })
  id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  public_id?: string;

  @Column({
    type: 'enum',
    enum: ImageOwnerType,
  })
  owner_type: ImageOwnerType;

  @Column({ type: 'uuid' })
  owner_id: string;

  @Column({ default: 1 })
  order: number;

  @Column({ default: false })
  is_primary: boolean;

  @Column({ length: 50, nullable: true })
  alt?: string;

  @Column('int')
  width: number;

  @Column('int')
  height: number;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
