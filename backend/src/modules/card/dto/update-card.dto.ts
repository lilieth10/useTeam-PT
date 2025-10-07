import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto, TaskPriority } from './create-card.dto';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  columnId?: string;

  @IsNumber()
  @IsOptional()
  position?: number;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsOptional()
  dueDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
