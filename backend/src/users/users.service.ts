import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(email: string, password: string, name?: string): Promise<User> {
    const hash = await bcrypt.hash(password, 10);
    const user = this.repo.create({
      email,
      passwordHash: hash,
      name,
      currentPeriodStart: new Date(),
    });
    return this.repo.save(user);
  }

  async incrementValidations(userId: string, count: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;

    // Reset counter if new month
    const now = new Date();
    if (user.currentPeriodStart) {
      const periodStart = new Date(user.currentPeriodStart);
      if (now.getMonth() !== periodStart.getMonth() || now.getFullYear() !== periodStart.getFullYear()) {
        user.validationsThisMonth = 0;
        user.currentPeriodStart = now;
      }
    }

    user.validationsThisMonth += count;
    await this.repo.save(user);
  }

  async canValidate(userId: string, count: number = 1): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;

    const now = new Date();
    let used = user.validationsThisMonth;
    if (user.currentPeriodStart) {
      const ps = new Date(user.currentPeriodStart);
      if (now.getMonth() !== ps.getMonth() || now.getFullYear() !== ps.getFullYear()) {
        used = 0;
      }
    }
    return used + count <= user.monthlyLimit;
  }

  async getDashboardStats(userId: string) {
    const user = await this.findById(userId);
    if (!user) return null;
    return {
      plan: user.plan,
      used: user.validationsThisMonth,
      limit: user.monthlyLimit,
      periodStart: user.currentPeriodStart,
    };
  }
}
