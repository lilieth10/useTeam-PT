import { Module } from '@nestjs/common';
import { KanbanWebSocketGateway } from './websocket.gateway';

@Module({
  providers: [KanbanWebSocketGateway],
  exports: [KanbanWebSocketGateway],
})
export class WebSocketModule {}
