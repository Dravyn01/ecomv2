import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn('uuid', { name: 'login_history_id' })
  id: string;

  @ManyToOne(() => User, (usr) => usr.logined_history)
  @JoinColumn()
  user: User;

  @Column({ default: 0 })
  count: number;

  @Column()
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
