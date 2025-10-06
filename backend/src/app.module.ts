import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardModule } from './modules/board/board.module';

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
    // ColumnModule, // TODO: Crear módulo
    // CardModule, // TODO: Crear módulo  
    // ExportModule, // TODO: Crear módulo
    // WebSocketModule, // TODO: Crear módulo
  ],
})
export class AppModule {}
