import { PartialType } from '@nestjs/mapped-types';
import { CreateColumnDto } from './create-column.dto';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateColumnDto extends PartialType(CreateColumnDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  position?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
