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
      
      // Emitir evento WebSocket
      this.webSocketGateway.emitCardCreated({
        cardId: savedCard._id.toString(),
        title: savedCard.title,
        description: savedCard.description,
        columnId: savedCard.columnId.toString(),
      });
      
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

      // Emitir evento WebSocket
      this.webSocketGateway.emitCardUpdated({
        cardId: updatedCard._id.toString(),
        title: updatedCard.title,
        description: updatedCard.description,
        columnId: updatedCard.columnId.toString(),
      });

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

      const updateData: Record<string, unknown> = { position: newPosition };

      if (newColumnId && newColumnId !== existingCard.columnId.toString()) {
        updateData.columnId = newColumnId;
      }

      const updatedCard = await this.cardModel
        .findByIdAndUpdate(cardId, updateData, { new: true, runValidators: true })
        .exec();

      if (!updatedCard) {
        throw new NotFoundException(`Error al actualizar la tarjeta con ID ${cardId}`);
      }

      // Emitir evento WebSocket para drag & drop
      this.webSocketGateway.emitCardMoved({
        cardId: updatedCard._id.toString(),
        title: updatedCard.title,
        description: updatedCard.description,
        position: newPosition,
        columnId: existingCard.columnId.toString(), // Columna original
        newColumnId: newColumnId || updatedCard.columnId.toString(), // Columna destino
      });

      return updatedCard;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error actualizando posición de tarjeta: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.cardModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    // Emitir evento WebSocket para soft delete
    this.webSocketGateway.emitCardDeleted(id);
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
}
