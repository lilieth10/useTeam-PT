import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { CardModule } from '../card/card.module';
import { ColumnModule } from '../column/column.module';
import { N8nModule } from '../n8n/n8n.module';

@Module({
  imports: [CardModule, ColumnModule, N8nModule],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
