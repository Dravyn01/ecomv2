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

  /* จากห้องสนทนาไหน */
  @OneToOne(() => Conversation, (con) => con.inbox)
  @JoinColumn()
  conversation: Conversation;

  /* ผู้ส่ง */
  @OneToOne(() => User)
  @JoinColumn()
  sender: User;

  /* เปิดอ่านเมื่อไหร่ */
  @Column({ nullable: true })
  open_at?: Date;

  @Column({ nullable: true })
  last_read_message_at?: Date;

  /* ส่งเมื่อไหร่ */
  @CreateDateColumn()
  send_at: Date;
}
