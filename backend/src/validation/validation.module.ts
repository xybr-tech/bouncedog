import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationResult } from './entities/validation-result.entity';
import { ValidationService } from './validation.service';
import { ValidationController } from './validation.controller';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValidationResult]),
    ApiKeysModule,
    UsersModule,
  ],
  providers: [ValidationService],
  controllers: [ValidationController],
  exports: [ValidationService],
})
export class ValidationModule {}
