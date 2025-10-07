import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { Column, ColumnSchema } from '../../database/schemas/column.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Column.name, schema: ColumnSchema }]),
  ],
  controllers: [ColumnController],
  providers: [ColumnService],
  exports: [ColumnService],
})
export class ColumnModule {}
