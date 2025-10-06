import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ColumnDocument = Column & Document;

@Schema({ timestamps: true })
export class Column {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ default: 0 })
  position: number;

  @Prop({ default: '#e5e7eb' })
  color: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
