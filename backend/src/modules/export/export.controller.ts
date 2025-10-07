import { Controller, Post, Body, Query } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportBacklogDto } from './dto/export-backlog.dto';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('backlog')
  async exportBacklog(@Body() exportDto: ExportBacklogDto) {
    return this.exportService.exportBacklog(exportDto);
  }

  @Post('backlog/test')
  async testExport(@Query('boardId') boardId?: string) {
    const testDto: ExportBacklogDto = {
      boardId,
      email: 'test@example.com',
      fields: ['id', 'title', 'description', 'column', 'createdAt'],
    };

    return this.exportService.exportBacklog(testDto);
  }
}
