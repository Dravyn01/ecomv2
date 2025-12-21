import { Conversation, User } from 'src/config/entities.config';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

export enum NotificationType {
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  SYSTEM = 'SYSTEM',
  STOCK_ALERT = 'STOCK_ALERT',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid', { name: 'notification_id' })
  id: string;

  /**
   * คนที่ได้รับ notification (optional เฉพาะแจ้งเดือนจาก stock alert)
   */
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  receiver?: User;

  /**
   * คนส่งข้อความ (optional เฉพาะแจ้งเดือนจาก stock alert)
   */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  sender?: User;

  /**
   * ประเภท notification
   */
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  /**
   * ผูกกับ conversation (เฉพาะ chat)
   */
  @ManyToOne(() => Conversation, { nullable: true, onDelete: 'CASCADE' })
  conversation?: Conversation;

  /**
   * ข้อความสั้น ๆ เอาไว้ render
   * เช่น "Support ตอบกลับแล้ว"
   */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /*
   * ข้อความจากผู้ส่ง
   * */
  @Column({ type: 'text' })
  message: string;

  /**
   * สถานะอ่านแล้วหรือยัง
   */
  @Column({ default: false })
  is_read: boolean;

  /**
   * เวลาอ่าน (optional)
   */
  @Column({ type: 'timestamp', nullable: true })
  read_at?: Date;

  @CreateDateColumn()
  created_at: Date;
}
