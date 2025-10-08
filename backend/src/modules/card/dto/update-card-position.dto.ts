import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO específico para actualización de posición de tarjetas
 * Sigue el principio de responsabilidad única (SRP)
 */
export class UpdateCardPositionDto {
  @IsNumber()
  position: number;

  @IsOptional()
  @IsString()
  columnId?: string;
}
