import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from '../../database/schemas/card.schema';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { KanbanWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    private readonly webSocketGateway: KanbanWebSocketGateway,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    try {
      if (!createCardDto.title || !createCardDto.boardId || !createCardDto.columnId) {
        throw new BadRequestException('Faltan campos requeridos: title, boardId, columnId');
      }

      if (!createCardDto.position) {
        const lastCard = await this.cardModel
          .findOne({ columnId: createCardDto.columnId })
          .sort({ position: -1 })
          .exec();

        createCardDto.position = lastCard ? lastCard.position + 1 : 0;
      }

      const cardData = {
        ...createCardDto,
        priority: createCardDto.priority || 'medium',
        tags: createCardDto.tags || [],
        isActive: createCardDto.isActive !== undefined ? createCardDto.isActive : true,
      };

      const createdCard = new this.cardModel(cardData);
      const savedCard = await createdCard.save();
      
      // Emitir evento WebSocket con tarea completa transformada
      const transformedTask = this.transformCardToTask(savedCard);
      this.webSocketGateway.emitCardCreated(transformedTask);
      
      return savedCard;
    } catch (error) {
      throw new BadRequestException(`Error creating card: ${error.message}`);
    }
  }

  async findAll(boardId?: string): Promise<Card[]> {
    try {
      const query: Record<string, unknown> = { isActive: true };

      if (boardId) {
        query.boardId = boardId;
      }

      const cards = await this.cardModel
        .find(query)
        .sort({ position: 1, createdAt: 1 })
        .exec();

      return cards;
    } catch (error) {
      throw error;
    }
  }

  async findByColumn(columnId: string): Promise<Card[]> {
    return this.cardModel
      .find({ columnId, isActive: true })
      .sort({ position: 1, createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardModel
      .findById(id)
      .populate('columnId')
      .exec();

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return card;
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    try {
      if (!id || id === 'undefined') {
        throw new BadRequestException('ID de tarjeta inválido');
      }

      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateCardDto).filter(([_, value]) => value !== undefined)
      );

      const updatedCard = await this.cardModel
        .findByIdAndUpdate(id, cleanUpdateData, { new: true, runValidators: true })
        .exec();

      if (!updatedCard) {
        throw new NotFoundException(`Card with ID ${id} not found`);
      }

      // Emitir evento WebSocket con tarea completa transformada
      const transformedTask = this.transformCardToTask(updatedCard);
      this.webSocketGateway.emitCardUpdated(transformedTask);

      return updatedCard;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error updating card: ${error.message}`);
    }
  }

  async updatePosition(cardId: string, newPosition: number, newColumnId?: string): Promise<Card> {
    try {
      // Validaciones específicas
      if (!cardId || cardId === 'undefined') {
        throw new BadRequestException('ID de tarjeta inválido');
      }

      if (typeof newPosition !== 'number' || newPosition < 0) {
        throw new BadRequestException('La posición debe ser un número válido mayor o igual a 0');
      }

      // Verificar que la tarjeta existe
      const existingCard = await this.cardModel.findById(cardId).exec();
      if (!existingCard) {
        throw new NotFoundException(`Tarjeta con ID ${cardId} no encontrada`);
      }

      const targetColumnId = newColumnId || existingCard.columnId.toString();
      
      // Si es movimiento dentro de la misma columna, reordenar todas las tareas
      if (targetColumnId === existingCard.columnId.toString()) {
        await this.reorderTasksInColumn(cardId, newPosition, targetColumnId);
        
        // Obtener todas las tareas reordenadas y enviarlas
        const reorderedTasks = await this.cardModel
          .find({ columnId: targetColumnId, isActive: true })
          .sort({ position: 1, createdAt: 1 })
          .exec();
        
        // Transformar y enviar todas las tareas reordenadas
        const transformedTasks = reorderedTasks.map(task => this.transformCardToTask(task));
        this.webSocketGateway.server.emit('cards:reordered', { 
          columnId: targetColumnId,
          tasks: transformedTasks 
        });
      } else {
        // Movimiento entre columnas
        const updateData: Record<string, unknown> = { 
          position: newPosition,
          columnId: targetColumnId 
        };

        const updatedCard = await this.cardModel
          .findByIdAndUpdate(cardId, updateData, { new: true, runValidators: true })
          .exec();

        if (updatedCard) {
          // Emitir evento WebSocket para movimiento entre columnas
          const transformedTask = this.transformCardToTask(updatedCard);
          this.webSocketGateway.emitCardMoved(transformedTask);
        }
      }

      // Obtener la tarjeta actualizada para retornar
      const finalCard = await this.cardModel.findById(cardId).exec();
      if (!finalCard) {
        throw new NotFoundException(`Error al obtener la tarjeta actualizada con ID ${cardId}`);
      }

      return finalCard;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error actualizando posición de tarjeta: ${error.message}`);
    }
  }

  // Método para reordenar tareas dentro de la misma columna
  private async reorderTasksInColumn(cardId: string, newIndex: number, columnId: string): Promise<void> {
    // Obtener todas las tareas de la columna ordenadas por posición
    const tasksInColumn = await this.cardModel
      .find({ columnId, isActive: true })
      .sort({ position: 1, createdAt: 1 })
      .exec();

    // Encontrar la tarea que se está moviendo
    const movingTaskIndex = tasksInColumn.findIndex(task => task._id.toString() === cardId);
    if (movingTaskIndex === -1) return;

    // Remover la tarea de su posición actual
    const [movingTask] = tasksInColumn.splice(movingTaskIndex, 1);

    // Insertar en la nueva posición
    tasksInColumn.splice(newIndex, 0, movingTask);

    // Actualizar las posiciones de todas las tareas
    const updatePromises = tasksInColumn.map((task, index) => 
      this.cardModel.findByIdAndUpdate(task._id, { position: index }).exec()
    );

    await Promise.all(updatePromises);
  }

  async remove(id: string): Promise<void> {
    // Primero obtenemos la tarjeta para verificar que existe
    const cardToDelete = await this.cardModel.findById(id).exec();
    
    if (!cardToDelete) {
      throw new NotFoundException(`No se encontró la tarjeta con ID ${id}`);
    }

    // Realizamos el borrado físico
    await this.cardModel.findByIdAndDelete(id).exec();

    // Enviamos el evento de WebSocket con el ID de la tarjeta
    this.webSocketGateway.emitCardDeleted(cardToDelete._id.toString());
  }

  async delete(id: string): Promise<void> {
    const result = await this.cardModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
  }

  async getCardsByBoard(boardId: string): Promise<Card[]> {
    return this.cardModel
      .find({ boardId, isActive: true })
      .populate('columnId')
      .sort({ position: 1, createdAt: 1 })
      .exec();
  }

  // Método para transformar Card de MongoDB a Task del frontend
  private transformCardToTask(card: any): any {
    // Mapeo de columnId a status (igual que en el frontend)
    const mapColumnIdToStatus = (columnId: string): 'todo' | 'inProgress' | 'completed' => {
      const columnToStatusMap = {
        'todo': 'todo' as const,
        'inProgress': 'inProgress' as const,
        'completed': 'completed' as const,
      };
      
      // Mapeo para ObjectIds (de tareas más antiguas)
      const objectIdToStatusMap = {
        '507f1f77bcf86cd799439011': 'todo' as const,
        '507f1f77bcf86cd799439012': 'inProgress' as const,
        '507f1f77bcf86cd799439013': 'completed' as const,
      };
      
      return columnToStatusMap[columnId] || objectIdToStatusMap[columnId] || 'todo';
    };

    return {
      id: card._id.toString(),
      title: card.title,
      description: card.description || '',
      status: mapColumnIdToStatus(card.columnId),
      priority: card.priority || 'medium',
      tags: card.tags || [],
      dueDate: card.dueDate,
      createdAt: card.createdAt,
      position: card.position || 0,
      boardId: card.boardId,
      columnId: card.columnId
    };
  }
}
