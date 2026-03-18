import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(@InjectRepository(ApiKey) private repo: Repository<ApiKey>) {}

  generateKey(): string {
    return 'bd_' + randomBytes(24).toString('hex');
  }

  async create(userId: string, name: string = 'Default'): Promise<ApiKey> {
    const key = this.repo.create({ userId, key: this.generateKey(), name });
    return this.repo.save(key);
  }

  async findByUser(userId: string): Promise<ApiKey[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findByKey(key: string): Promise<ApiKey | null> {
    return this.repo.findOne({ where: { key, active: true }, relations: ['user'] });
  }

  async revoke(id: string, userId: string): Promise<void> {
    const key = await this.repo.findOne({ where: { id, userId } });
    if (!key) throw new NotFoundException();
    key.active = false;
    await this.repo.save(key);
  }

  async recordUsage(keyId: string): Promise<void> {
    await this.repo.update(keyId, {
      totalValidations: () => '"totalValidations" + 1',
      lastUsedAt: new Date(),
    });
  }
}
