import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';

/**
 * DTO para actualización de tarjetas
 * Extiende CreateCardDto haciendo todos los campos opcionales
 * Sigue el principio DRY (Don't Repeat Yourself)
 */
export class UpdateCardDto extends PartialType(CreateCardDto) {
  // Todos los campos son heredados de CreateCardDto como opcionales
  // No necesitamos redefinir las validaciones
}
