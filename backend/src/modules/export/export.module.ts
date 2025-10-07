import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { CardModule } from '../card/card.module';
import { ColumnModule } from '../column/column.module';

@Module({
  imports: [CardModule, ColumnModule],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
