import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardService.create(createCardDto);
  }

  @Get()
  findAll(@Query('boardId') boardId?: string) {
    return this.cardService.findAll(boardId);
  }

  @Get('column/:columnId')
  findByColumn(@Param('columnId') columnId: string) {
    return this.cardService.findByColumn(columnId);
  }

  @Get('board/:boardId')
  getCardsByBoard(@Param('boardId') boardId: string) {
    return this.cardService.getCardsByBoard(boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardService.update(id, updateCardDto);
  }

  @Patch(':id/position')
  updatePosition(
    @Param('id') id: string,
    @Body() body: { position: number; columnId?: string }
  ) {
    return this.cardService.updatePosition(id, body.position, body.columnId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(id);
  }

  @Delete(':id/permanent')
  delete(@Param('id') id: string) {
    return this.cardService.delete(id);
  }
}
