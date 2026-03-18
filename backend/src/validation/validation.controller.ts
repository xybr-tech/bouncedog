import { Controller, Post, Get, Body, Query, UseGuards, Request, Headers, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValidationService } from './validation.service';
import { ApiKeysService } from '../api-keys/api-keys.service';
import { UsersService } from '../users/users.service';
import { IsEmail, IsArray, IsOptional, IsString } from 'class-validator';

class ValidateOneDto {
  @IsEmail() email: string;
}

class ValidateBatchDto {
  @IsArray() emails: string[];
}

@ApiTags('validation')
@Controller('validate')
export class ValidationController {
  constructor(
    private validationService: ValidationService,
    private apiKeysService: ApiKeysService,
    private usersService: UsersService,
  ) {}

  // Public API endpoint (API key auth)
  @Post('single')
  async validateSingle(
    @Body() dto: ValidateOneDto,
    @Headers('x-api-key') apiKey: string,
  ) {
    const { userId } = await this.resolveApiKey(apiKey);
    await this.checkQuota(userId, 1);
    const result = await this.validationService.validateEmail(dto.email, userId);
    await this.usersService.incrementValidations(userId, 1);
    return this.formatResult(result);
  }

  @Post('batch')
  async validateBatch(
    @Body() dto: ValidateBatchDto,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (dto.emails.length > 1000) throw new ForbiddenException('Max 1000 emails per batch');
    const { userId, keyId } = await this.resolveApiKey(apiKey);
    await this.checkQuota(userId, dto.emails.length);

    const results = [];
    for (const email of dto.emails) {
      const r = await this.validationService.validateEmail(email, userId);
      results.push(this.formatResult(r));
    }
    await this.usersService.incrementValidations(userId, dto.emails.length);
    return { count: results.length, results };
  }

  // Dashboard endpoints (JWT auth)
  @Post('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async validateFromDashboard(@Request() req, @Body() dto: ValidateOneDto) {
    await this.checkQuota(req.user.id, 1);
    const result = await this.validationService.validateEmail(dto.email, req.user.id);
    await this.usersService.incrementValidations(req.user.id, 1);
    return result;
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getHistory(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.validationService.getHistory(req.user.id, limit || 50, offset || 0);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getStats(@Request() req) {
    const [validationStats, dashboardStats] = await Promise.all([
      this.validationService.getStats(req.user.id),
      this.usersService.getDashboardStats(req.user.id),
    ]);
    return { ...validationStats, ...dashboardStats };
  }

  private async resolveApiKey(key: string) {
    if (!key) throw new UnauthorizedException('API key required (x-api-key header)');
    const apiKey = await this.apiKeysService.findByKey(key);
    if (!apiKey) throw new UnauthorizedException('Invalid API key');
    await this.apiKeysService.recordUsage(apiKey.id);
    return { userId: apiKey.userId, keyId: apiKey.id };
  }

  private async checkQuota(userId: string, count: number) {
    const ok = await this.usersService.canValidate(userId, count);
    if (!ok) throw new ForbiddenException('Monthly validation limit exceeded. Upgrade your plan.');
  }

  private formatResult(r: any) {
    return {
      email: r.email,
      status: r.status,
      score: r.score,
      checks: {
        syntax: r.syntaxValid,
        mx: r.mxFound,
        smtp: r.smtpConnectable,
        inbox: r.inboxExists,
        catchAll: r.isCatchAll,
        disposable: r.isDisposable,
        roleAccount: r.isRoleAccount,
        freeProvider: r.isFreeProvider,
      },
      suggestion: r.suggestion,
      reason: r.reason,
      durationMs: r.durationMs,
    };
  }
}
