import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { Card, CardSchema } from '../../database/schemas/card.schema';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
    WebSocketModule,
  ],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
