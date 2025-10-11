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

// Interfaces para tipado seguro
interface CardEventData {
  cardId?: string;
  title?: string;
  description?: string;
  columnId?: string;
  newColumnId?: string;
  position?: number;
}

interface ColumnEventData {
  columnId?: string;
  title?: string;
  position?: number;
}

interface ExportEventData {
  email?: string;
  boardId?: string;
  fields?: string[];
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'completed';
  priority: string;
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
  position: number;
  boardId: string;
  columnId: string;
}

interface WebSocketResponse {
  success: boolean;
  message: string;
}

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
  handleCardCreate(@MessageBody() data: CardEventData, @ConnectedSocket() client: Socket): WebSocketResponse {
    this.logger.log(`Tarjeta creada: ${data.title || 'Sin título'}`);
    client.broadcast.emit('card:created', data);
    return { success: true, message: 'Tarjeta creada' };
  }

  @SubscribeMessage('card:update')
  handleCardUpdate(@MessageBody() data: CardEventData, @ConnectedSocket() client: Socket): WebSocketResponse {
    this.logger.log(`Tarjeta actualizada: ${data.cardId || 'ID desconocido'}`);
    client.broadcast.emit('card:updated', data);
    return { success: true, message: 'Tarjeta actualizada' };
  }

  @SubscribeMessage('card:delete')
  handleCardDelete(@MessageBody() data: CardEventData, @ConnectedSocket() client: Socket): WebSocketResponse {
    this.logger.log(`Tarjeta eliminada: ${data.cardId || 'ID desconocido'}`);
    client.broadcast.emit('card:deleted', data.cardId);
    return { success: true, message: 'Tarjeta eliminada' };
  }

  @SubscribeMessage('card:move')
  handleCardMove(@MessageBody() data: CardEventData, @ConnectedSocket() client: Socket): WebSocketResponse {
    this.logger.log(`Tarjeta movida: ${data.cardId || 'ID desconocido'} -> ${data.newColumnId || 'Columna desconocida'}`);
    client.broadcast.emit('card:moved', data);
    return { success: true, message: 'Tarjeta movida' };
  }

  // ========== EVENTOS DE COLUMNAS ==========

  @SubscribeMessage('column:create')
  handleColumnCreate(@MessageBody() data: ColumnEventData, @ConnectedSocket() client: Socket): WebSocketResponse {
    this.logger.log(`Columna creada: ${data.title || 'Sin título'}`);
    client.broadcast.emit('column:created', data);
    return { success: true, message: 'Columna creada' };
  }

  @SubscribeMessage('column:update')
  handleColumnUpdate(@MessageBody() data: ColumnEventData, @ConnectedSocket() client: Socket): WebSocketResponse {
    this.logger.log(`Columna actualizada: ${data.columnId || 'ID desconocido'}`);
    client.broadcast.emit('column:updated', data);
    return { success: true, message: 'Columna actualizada' };
  }

  // ========== EVENTOS DE EXPORTACIÓN ==========

  @SubscribeMessage('export:request')
  handleExportRequest(@MessageBody() data: ExportEventData, @ConnectedSocket() client: Socket): WebSocketResponse {
    this.logger.log(`Solicitud de exportación: ${data.email || 'Email no especificado'}`);
    client.emit('export:processing', { message: 'Procesando exportación...' });
    return { success: true, message: 'Exportación iniciada' };
  }

  // ========== MÉTODOS PÚBLICOS PARA OTROS SERVICIOS ==========

  emitCardCreated(task: TaskData): void {
    this.server.emit('card:created', { task });
  }

  emitCardUpdated(task: TaskData): void {
    this.server.emit('card:updated', { task });
  }

  emitCardDeleted(taskId: string): void {
    this.server.emit('card:deleted', { taskId });
  }

  emitCardMoved(task: TaskData): void {
    this.server.emit('card:moved', { task });
  }

  emitCardsReordered(columnId: string, tasks: TaskData[]): void {
    this.server.emit('cards:reordered', { columnId, tasks });
  }

  emitExportSuccess(data: ExportEventData): void {
    this.server.emit('export:success', data);
  }

  emitExportError(error: { message: string; code?: string }): void {
    this.server.emit('export:error', error);
  }
}
