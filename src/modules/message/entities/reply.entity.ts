import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { Conversation, User } from 'src/config/entities.config';

@Entity('replies')
export class Reply {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Message, (m) => m.replies)
  message: Message;

  @ManyToOne(() => Conversation)
  conversation: Conversation;

  @ManyToOne(() => User)
  sender: User;

  @Column('text')
  text: string;

  @Column({ type: 'text', array: true })
  image_urls: string[];

  @Column({ type: 'timestamp', nullable: true })
  read_at?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
