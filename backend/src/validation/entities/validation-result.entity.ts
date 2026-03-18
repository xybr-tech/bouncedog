import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ValidationStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  RISKY = 'risky',
  UNKNOWN = 'unknown',
}

@Entity('validation_results')
export class ValidationResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  listId: string;

  @Index()
  @Column()
  email: string;

  @Column({ type: 'varchar' })
  status: ValidationStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  score: number;

  @Column({ default: false })
  syntaxValid: boolean;

  @Column({ default: false })
  mxFound: boolean;

  @Column({ nullable: true })
  mxHost: string;

  @Column({ default: false })
  smtpConnectable: boolean;

  @Column({ default: false })
  inboxExists: boolean;

  @Column({ default: false })
  isCatchAll: boolean;

  @Column({ default: false })
  isDisposable: boolean;

  @Column({ default: false })
  isRoleAccount: boolean;

  @Column({ default: false })
  isFreeProvider: boolean;

  @Column({ nullable: true })
  suggestion: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ type: 'int', default: 0 })
  durationMs: number;

  @CreateDateColumn()
  createdAt: Date;
}
