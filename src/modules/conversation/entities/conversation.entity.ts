import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Inbox, User } from 'src/config/entities.config';
import { Message } from 'src/modules/message/entities/message.entity';
import { Replies } from 'src/modules/message/entities/reply.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid', { name: 'conversation_id' })
  id: string;

  // user ฝั่งลูกค้า (คนที่ทักแชทหา admin)
  @OneToOne(() => User, (usr) => usr.conversation)
  @JoinColumn()
  user: User;

  @OneToMany(() => Message, (msg) => msg.conversation)
  @JoinColumn()
  messages: Message[];

  @OneToMany(() => Message, (msg) => msg.conversation)
  @JoinColumn()
  replies: Replies[];

  // ถ้าต้องการระบบปิดเคส (เช่น ปิดการสนทนา)
  @Column({ default: false })
  isClosed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Inbox, (inbox) => inbox.conversation)
  inbox: Inbox;
}
