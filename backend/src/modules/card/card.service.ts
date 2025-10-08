import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from '../../database/schemas/card.schema';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
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
      const updateData: Record<string, unknown> = { position: newPosition };

      if (newColumnId) {
        updateData.columnId = newColumnId;
      }

      const result = await this.update(cardId, updateData);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.cardModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
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
