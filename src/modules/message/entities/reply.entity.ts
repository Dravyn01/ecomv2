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

@Entity('replies')
export class Replies {
  @PrimaryGeneratedColumn('uuid', { name: 'reply_id' })
  id: string;

  @ManyToOne(() => Message, (m) => m.replies)
  @JoinColumn()
  message: Message;

  @ManyToOne(() => Conversation)
  conversation: Conversation;

  @ManyToOne(() => User)
  sender: User;

  @Column('text')
  text: string;

  @Column({ type: 'timestamp', nullable: true })
  read_at?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
