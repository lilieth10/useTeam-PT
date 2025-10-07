import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  boardId: string;

  @IsString()
  @IsNotEmpty()
  columnId: string;

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
