import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u.apiKeys)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  key: string;

  @Column({ default: 'Default' })
  name: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: 0 })
  totalValidations: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;
}
