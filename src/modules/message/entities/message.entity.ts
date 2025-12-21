import { User } from 'src/config/entities.config';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Conversation } from '../conversation/conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn({ name: 'message_id' })
  id: number;

  @ManyToOne(() => Conversation, (con) => con.messages)
  @JoinColumn()
  conversation: Conversation;

  @ManyToOne(() => User, (usr) => usr.messages)
  @JoinColumn()
  sender: User;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'text' })
  image_urls: string[];

  @Column({ nullable: true })
  edit_at?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
