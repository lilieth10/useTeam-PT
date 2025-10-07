import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CardService } from '../card/card.service';
import { ColumnService } from '../column/column.service';
import { ExportBacklogDto } from './dto/export-backlog.dto';
import axios from 'axios';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly cardService: CardService,
    private readonly columnService: ColumnService,
  ) {}

  async exportBacklog(exportDto: ExportBacklogDto): Promise<{ success: boolean; message: string; jobId?: string }> {
    try {
      this.logger.log('Iniciando exportación de backlog...');

      // Obtener datos del tablero
      const cards = await this.cardService.findAll(exportDto.boardId);
      const columns = await this.columnService.findAll(exportDto.boardId);

      if (cards.length === 0) {
        throw new BadRequestException('No hay tarjetas para exportar');
      }

      // Preparar datos para exportación
      const exportData = this.prepareExportData(cards, columns, exportDto.fields);

      // Enviar a N8N webhook
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/kanban-export';

      const payload = {
        email: exportDto.email || process.env.DEFAULT_EXPORT_EMAIL,
        data: exportData,
        timestamp: new Date().toISOString(),
        boardId: exportDto.boardId,
      };

      const response = await axios.post(n8nWebhookUrl, payload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Exportación enviada a N8N. Job ID: ${response.data?.jobId}`);

      return {
        success: true,
        message: 'Exportación iniciada correctamente. Recibirás un email con el archivo CSV.',
        jobId: response.data?.jobId,
      };

    } catch (error) {
      this.logger.error(`Error en exportación: ${error.message}`);

      if (axios.isAxiosError(error)) {
        throw new BadRequestException(`Error de comunicación con N8N: ${error.message}`);
      }

      throw new BadRequestException(`Error interno: ${error.message}`);
    }
  }

  private prepareExportData(cards: any[], columns: any[], fields?: string[]) {
    const defaultFields = ['id', 'title', 'description', 'column', 'createdAt', 'priority', 'tags'];
    const selectedFields = fields || defaultFields;

    return cards.map(card => {
      const column = columns.find(col => col._id.toString() === card.columnId.toString());

      const exportItem: any = {};

      selectedFields.forEach(field => {
        switch (field) {
          case 'id':
            exportItem[field] = card._id?.toString() || card.id;
            break;
          case 'title':
            exportItem[field] = card.title;
            break;
          case 'description':
            exportItem[field] = card.description || '';
            break;
          case 'column':
            exportItem[field] = column?.title || 'Sin columna';
            break;
          case 'createdAt':
            exportItem[field] = card.createdAt ? new Date(card.createdAt).toLocaleDateString('es-ES') : '';
            break;
          case 'priority':
            exportItem[field] = card.priority || 'medium';
            break;
          case 'tags':
            exportItem[field] = card.tags?.join(', ') || '';
            break;
          case 'dueDate':
            exportItem[field] = card.dueDate ? new Date(card.dueDate).toLocaleDateString('es-ES') : '';
            break;
          default:
            exportItem[field] = card[field] || '';
        }
      });

      return exportItem;
    });
  }
}
