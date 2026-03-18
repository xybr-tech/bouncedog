import { Controller, Get, Post, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListsService } from './lists.service';
import { parse } from 'csv-parse/sync';

@ApiTags('lists')
@Controller('lists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ListsController {
  constructor(private service: ListsService) {}

  @Get()
  list(@Request() req) {
    return this.service.findByUser(req.user.id);
  }

  @Get(':id')
  get(@Request() req, @Param('id') id: string) {
    return this.service.findById(id, req.user.id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const content = file.buffer.toString('utf-8');
    let emails: string[];

    if (file.originalname.endsWith('.csv')) {
      const records = parse(content, { skip_empty_lines: true, trim: true });
      emails = records.flat().filter((e: string) => e.includes('@'));
    } else {
      // Plain text, one email per line
      emails = content.split('\n').map((l) => l.trim()).filter((l) => l.includes('@'));
    }

    if (emails.length === 0) throw new BadRequestException('No valid emails found in file');
    if (emails.length > 10000) throw new BadRequestException('Max 10,000 emails per file');

    const name = file.originalname.replace(/\.[^.]+$/, '');
    return this.service.create(req.user.id, name, emails);
  }
}
