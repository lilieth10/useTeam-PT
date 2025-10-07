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
      // Calcular posición si no se proporciona
      if (!createCardDto.position) {
        const lastCard = await this.cardModel
          .findOne({ columnId: createCardDto.columnId })
          .sort({ position: -1 })
          .exec();

        createCardDto.position = lastCard ? lastCard.position + 1 : 0;
      }

      // Establecer valores por defecto
      const cardData = {
        ...createCardDto,
        priority: createCardDto.priority || 'medium',
        tags: createCardDto.tags || [],
        isActive: createCardDto.isActive !== undefined ? createCardDto.isActive : true,
      };

      const createdCard = new this.cardModel(cardData);
      return await createdCard.save();
    } catch (error) {
      throw new BadRequestException(`Error creating card: ${error.message}`);
    }
  }

  async findAll(boardId?: string): Promise<Card[]> {
    const query: any = { isActive: true };

    if (boardId) {
      query.boardId = boardId;
    }

    return this.cardModel
      .find(query)
      .populate('columnId')
      .sort({ position: 1, createdAt: 1 })
      .exec();
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
      const updatedCard = await this.cardModel
        .findByIdAndUpdate(id, updateCardDto, { new: true })
        .populate('columnId')
        .exec();

      if (!updatedCard) {
        throw new NotFoundException(`Card with ID ${id} not found`);
      }

      return updatedCard;
    } catch (error) {
      throw new BadRequestException(`Error updating card: ${error.message}`);
    }
  }

  async updatePosition(cardId: string, newPosition: number, newColumnId?: string): Promise<Card> {
    const updateData: any = { position: newPosition };

    if (newColumnId) {
      updateData.columnId = newColumnId;
    }

    return this.update(cardId, updateData);
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
