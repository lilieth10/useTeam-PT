import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class KanbanWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('KanbanWebSocketGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
    client.emit('connection', { message: 'Conectado al servidor Kanban' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // ========== EVENTOS DE TARJETAS ==========
  
  @SubscribeMessage('card:create')
  handleCardCreate(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Tarjeta creada: ${data.title}`);
    // Emitir a todos los clientes excepto al que envió
    client.broadcast.emit('card:created', data);
    return { success: true, message: 'Tarjeta creada' };
  }

  @SubscribeMessage('card:update')
  handleCardUpdate(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Tarjeta actualizada: ${data.cardId}`);
    client.broadcast.emit('card:updated', data);
    return { success: true, message: 'Tarjeta actualizada' };
  }

  @SubscribeMessage('card:delete')
  handleCardDelete(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Tarjeta eliminada: ${data.cardId}`);
    client.broadcast.emit('card:deleted', data.cardId);
    return { success: true, message: 'Tarjeta eliminada' };
  }

  @SubscribeMessage('card:move')
  handleCardMove(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Tarjeta movida: ${data.cardId} -> ${data.newColumnId}`);
    client.broadcast.emit('card:moved', data);
    return { success: true, message: 'Tarjeta movida' };
  }

  // ========== EVENTOS DE COLUMNAS ==========

  @SubscribeMessage('column:create')
  handleColumnCreate(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Columna creada: ${data.title}`);
    client.broadcast.emit('column:created', data);
    return { success: true, message: 'Columna creada' };
  }

  @SubscribeMessage('column:update')
  handleColumnUpdate(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Columna actualizada: ${data.columnId}`);
    client.broadcast.emit('column:updated', data);
    return { success: true, message: 'Columna actualizada' };
  }

  // ========== EVENTOS DE EXPORTACIÓN ==========

  @SubscribeMessage('export:request')
  handleExportRequest(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Solicitud de exportación: ${data.email}`);
    // Aquí se conectará con N8N más adelante
    client.emit('export:processing', { message: 'Procesando exportación...' });
    return { success: true, message: 'Exportación iniciada' };
  }

  // ========== MÉTODOS PÚBLICOS PARA OTROS SERVICIOS ==========

  emitCardCreated(card: any) {
    this.server.emit('card:created', card);
  }

  emitCardUpdated(card: any) {
    this.server.emit('card:updated', card);
  }

  emitCardDeleted(cardId: string) {
    this.server.emit('card:deleted', cardId);
  }

  emitCardMoved(card: any) {
    this.server.emit('card:moved', card);
  }

  emitExportSuccess(data: any) {
    this.server.emit('export:success', data);
  }

  emitExportError(error: any) {
    this.server.emit('export:error', error);
  }
}
