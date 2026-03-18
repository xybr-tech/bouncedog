import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiKey } from '../../api-keys/entities/api-key.entity';
import { ValidationList } from '../../lists/entities/validation-list.entity';

export enum Plan {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  BUSINESS = 'business',
}

const planLimits: Record<Plan, number> = {
  [Plan.FREE]: 100,
  [Plan.STARTER]: 5000,
  [Plan.PRO]: 25000,
  [Plan.BUSINESS]: 100000,
};

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'varchar', default: Plan.FREE })
  plan: Plan;

  @Column({ default: 0 })
  validationsThisMonth: number;

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodStart: Date;

  @OneToMany(() => ApiKey, (k) => k.user)
  apiKeys: ApiKey[];

  @OneToMany(() => ValidationList, (l) => l.user)
  lists: ValidationList[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get monthlyLimit(): number {
    return planLimits[this.plan] || 100;
  }
}
