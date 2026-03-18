import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationList } from './entities/validation-list.entity';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { ValidationModule } from '../validation/validation.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ValidationList]),
    ValidationModule,
    UsersModule,
  ],
  providers: [ListsService],
  controllers: [ListsController],
})
export class ListsModule {}
