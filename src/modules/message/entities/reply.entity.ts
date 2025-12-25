import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { Conversation } from 'src/modules/conversation/entities/conversation.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { CreateImageDTO } from 'src/modules/image/dto/create-image.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@Entity('replies')
export class Replies {
  @PrimaryGeneratedColumn({ name: 'reply_id' })
  id: number;

  @ManyToOne(() => Message, (m) => m.replies)
  @JoinColumn()
  message: Message;

  @ManyToOne(() => Conversation)
  conversation: Conversation;

  @ManyToOne(() => User)
  sender: User;

  @Column('text')
  text: string;

  @ValidateNested({ each: true })
  @Type(() => CreateImageDTO)
  images: CreateImageDTO[];

  @Column({ type: 'timestamp', nullable: true })
  read_at?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
