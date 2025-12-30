import { Conversation } from 'src/modules/conversation/entities/conversation.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Replies } from './reply.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid', { name: 'message_id' })
  id: string;

  @ManyToOne(() => Conversation, (con) => con.messages)
  @JoinColumn()
  conversation: Conversation;

  @ManyToOne(() => User, (usr) => usr.messages)
  @JoinColumn()
  sender: User;

  @Column({ type: 'text' })
  text: string;

  @OneToMany(() => Replies, (r) => r.message, { nullable: true })
  replies: Replies[];

  @Column({ type: 'timestamp', nullable: true })
  read_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
