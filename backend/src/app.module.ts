import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardModule } from './modules/board/board.module';
import { CardModule } from './modules/card/card.module';
import { ColumnModule } from './modules/column/column.module';
import { ExportModule } from './modules/export/export.module';
import { WebSocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    // Configuración de MongoDB
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board'),

    // Módulos de la aplicación
    BoardModule,
    CardModule,
    ColumnModule,
    ExportModule,
    WebSocketModule,
  ],
})
export class AppModule {}
