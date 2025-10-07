import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('columns')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnService.create(createColumnDto);
  }

  @Get()
  findAll() {
    return this.columnService.findAll();
  }

  @Get('board/:boardId')
  getColumnsByBoard(@Param('boardId') boardId: string) {
    return this.columnService.getColumnsByBoard(boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.columnService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto) {
    return this.columnService.update(id, updateColumnDto);
  }

  @Patch(':id/position')
  updatePosition(
    @Param('id') id: string,
    @Body() body: { position: number }
  ) {
    return this.columnService.updatePosition(id, body.position);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.columnService.remove(id);
  }

  @Delete(':id/permanent')
  delete(@Param('id') id: string) {
    return this.columnService.delete(id);
  }
}
