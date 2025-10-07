import { IsString, IsOptional, IsEmail, IsArray } from 'class-validator';

export class ExportBacklogDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString({ each: true })
  @IsOptional()
  fields?: string[];

  @IsString()
  @IsOptional()
  boardId?: string;
}
