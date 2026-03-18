import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ListStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('validation_lists')
export class ValidationList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u.lists)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: ListStatus.PENDING })
  status: ListStatus;

  @Column({ default: 0 })
  totalEmails: number;

  @Column({ default: 0 })
  processed: number;

  @Column({ default: 0 })
  valid: number;

  @Column({ default: 0 })
  invalid: number;

  @Column({ default: 0 })
  risky: number;

  @Column({ default: 0 })
  unknown: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
