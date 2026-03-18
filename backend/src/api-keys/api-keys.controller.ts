import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiKeysService } from './api-keys.service';
import { IsOptional, IsString } from 'class-validator';

class CreateKeyDto {
  @IsOptional() @IsString() name?: string;
}

@ApiTags('api-keys')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private service: ApiKeysService) {}

  @Get()
  list(@Request() req) {
    return this.service.findByUser(req.user.id);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateKeyDto) {
    return this.service.create(req.user.id, dto.name);
  }

  @Delete(':id')
  revoke(@Request() req, @Param('id') id: string) {
    return this.service.revoke(id, req.user.id);
  }
}
