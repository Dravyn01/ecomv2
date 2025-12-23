import { User } from 'src/config/entities.config';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Conversation } from 'src/config/entities.config';
import { Reply } from './reply.entity';

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

  @Column({ type: 'text', array: true })
  image_urls: string[];

  @OneToMany(() => Reply, (r) => r.message, { nullable: true })
  @JoinColumn()
  replies: Reply[];

  @Column({ type: 'timestamp', nullable: true })
  read_at?: Date;

  @Column({ nullable: true })
  updated_at?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
