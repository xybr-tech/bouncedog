import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationList, ListStatus } from './entities/validation-list.entity';
import { ValidationService } from '../validation/validation.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);

  constructor(
    @InjectRepository(ValidationList) private repo: Repository<ValidationList>,
    private validationService: ValidationService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, name: string, emails: string[]): Promise<ValidationList> {
    const list = this.repo.create({
      userId,
      name,
      totalEmails: emails.length,
      status: ListStatus.PENDING,
    });
    const saved = await this.repo.save(list);

    // Process async
    this.processListAsync(saved.id, userId, emails).catch((err) =>
      this.logger.error(`List processing failed: ${err.message}`),
    );

    return saved;
  }

  private async processListAsync(listId: string, userId: string, emails: string[]) {
    await this.repo.update(listId, { status: ListStatus.PROCESSING });

    let valid = 0, invalid = 0, risky = 0, unknown = 0, processed = 0;

    for (const email of emails) {
      try {
        const result = await this.validationService.validateEmail(email.trim(), userId, listId);
        switch (result.status) {
          case 'valid': valid++; break;
          case 'invalid': invalid++; break;
          case 'risky': risky++; break;
          default: unknown++; break;
        }
      } catch {
        unknown++;
      }
      processed++;
      if (processed % 10 === 0) {
        await this.repo.update(listId, { processed, valid, invalid, risky, unknown });
      }
    }

    await this.repo.update(listId, {
      status: ListStatus.COMPLETED,
      processed,
      valid,
      invalid,
      risky,
      unknown,
      completedAt: new Date(),
    });

    await this.usersService.incrementValidations(userId, emails.length);
  }

  async findByUser(userId: string): Promise<ValidationList[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: string, userId: string): Promise<ValidationList | null> {
    return this.repo.findOne({ where: { id, userId } });
  }
}
