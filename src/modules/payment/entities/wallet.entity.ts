import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid', { name: 'wallet_id' })
  id: string;

  @OneToOne(() => User, (u) => u.wallet, { onDelete: 'CASCADE', cascade: true })
  @JoinColumn()
  user: User;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  balance: number;
}
