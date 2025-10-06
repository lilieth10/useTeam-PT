import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Column', required: true })
  columnId: Types.ObjectId;

  @Prop({ default: 0 })
  position: number;

  @Prop({ 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  })
  priority: string;

  @Prop([String])
  tags?: string[];

  @Prop()
  dueDate?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const CardSchema = SchemaFactory.createForClass(Card);
