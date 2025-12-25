import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ImageOwnerType {
  PRODUCT = 'PRODUCT',
  PROFILE = 'PROFILE',
  REVIEW = 'REVIEW',
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

  @Column()
  owner_id: string | number;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;
}
