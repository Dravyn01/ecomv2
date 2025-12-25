import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from 'src/modules/conversation/entities/conversation.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('inboxs')
export class Inbox {
  @PrimaryGeneratedColumn('uuid', { name: 'inbox_id' })
  id: string;

  @OneToOne(() => Conversation, (con) => con.inbox)
  @JoinColumn()
  conversation: Conversation;

  @OneToOne(() => User)
  @JoinColumn()
  sender: User;

  @Column({ type: 'boolean', default: false })
  is_open: boolean;

  @Column({ nullable: true })
  open_at?: Date;

  @Column({ nullable: true })
  last_read_message_at?: Date;

  @CreateDateColumn()
  send_at: Date;
}
