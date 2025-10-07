import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column, ColumnDocument } from '../../database/schemas/column.schema';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<Column> {
    try {
      // Calcular posición si no se proporciona
      if (!createColumnDto.position) {
        const lastColumn = await this.columnModel
          .findOne({ boardId: createColumnDto.boardId })
          .sort({ position: -1 })
          .exec();

        createColumnDto.position = lastColumn ? lastColumn.position + 1 : 0;
      }

      // Establecer valores por defecto
      const columnData = {
        ...createColumnDto,
        color: createColumnDto.color || '#e5e7eb',
        isActive: createColumnDto.isActive !== undefined ? createColumnDto.isActive : true,
      };

      const createdColumn = new this.columnModel(columnData);
      return await createdColumn.save();
    } catch (error) {
      throw new BadRequestException(`Error creating column: ${error.message}`);
    }
  }

  async findAll(boardId?: string): Promise<Column[]> {
    const query: any = { isActive: true };

    if (boardId) {
      query.boardId = boardId;
    }

    return this.columnModel
      .find(query)
      .sort({ position: 1, createdAt: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Column> {
    const column = await this.columnModel.findById(id).exec();

    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    return column;
  }

  async update(id: string, updateColumnDto: UpdateColumnDto): Promise<Column> {
    try {
      const updatedColumn = await this.columnModel
        .findByIdAndUpdate(id, updateColumnDto, { new: true })
        .exec();

      if (!updatedColumn) {
        throw new NotFoundException(`Column with ID ${id} not found`);
      }

      return updatedColumn;
    } catch (error) {
      throw new BadRequestException(`Error updating column: ${error.message}`);
    }
  }

  async updatePosition(columnId: string, newPosition: number): Promise<Column> {
    return this.update(columnId, { position: newPosition });
  }

  async remove(id: string): Promise<void> {
    const result = await this.columnModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    const result = await this.columnModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }
  }

  async getColumnsByBoard(boardId: string): Promise<Column[]> {
    return this.columnModel
      .find({ boardId, isActive: true })
      .sort({ position: 1, createdAt: 1 })
      .exec();
  }
}
