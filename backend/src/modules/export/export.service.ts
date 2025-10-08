import { Injectable, BadRequestException } from '@nestjs/common';
import { CardService } from '../card/card.service';
import { ColumnService } from '../column/column.service';
import { N8nService } from '../n8n/n8n.service';
import { ExportBacklogDto } from './dto/export-backlog.dto';

@Injectable()
export class ExportService {
  constructor(
    private readonly cardService: CardService,
    private readonly columnService: ColumnService,
    private readonly n8nService: N8nService,
  ) {}

  async exportBacklog(exportDto: ExportBacklogDto): Promise<{ success: boolean; message: string }> {
    try {
      const cards = await this.cardService.findAll(exportDto.boardId);
      const columns = await this.columnService.findAll(exportDto.boardId);

      if (cards.length === 0) {
        throw new BadRequestException('No hay tarjetas para exportar');
      }

      const exportData = this.prepareExportData(cards, columns, exportDto.fields);

      const payload = {
        boardId: exportDto.boardId,
        email: exportDto.email || 'admin@useteam.io',
        fields: exportDto.fields || ['id', 'title', 'description', 'column', 'createdAt'],
        tasks: exportData,
      };

      const result = await this.n8nService.triggerExportWorkflow({
        boardId: payload.boardId,
        email: payload.email,
        fields: payload.fields,
        tasks: payload.tasks.map(task => ({
          id: task.id?.toString() || '',
          title: task.title?.toString() || '',
          description: task.description?.toString() || '',
          column: task.column?.toString() || '',
          createdAt: task.createdAt?.toString() || '',
          priority: task.priority?.toString(),
        }))
      });
      return result;

    } catch (error) {
      throw new BadRequestException(`Error en exportación: ${error.message}`);
    }
  }

  private prepareExportData(cards: unknown[], columns: unknown[], fields?: string[]) {
    const defaultFields = ['id', 'title', 'description', 'column', 'createdAt', 'priority', 'tags'];
    const selectedFields = fields || defaultFields;

    return cards.map(card => {
      const cardData = card as Record<string, unknown>;
      const column = columns.find(col => {
        const colData = col as Record<string, unknown>;
        return colData._id?.toString() === cardData.columnId?.toString();
      });
      const columnData = column as Record<string, unknown>;

      const exportItem: Record<string, unknown> = {};

      selectedFields.forEach(field => {
        switch (field) {
          case 'id':
            exportItem[field] = cardData._id?.toString() || cardData.id?.toString() || '';
            break;
          case 'title':
            exportItem[field] = cardData.title?.toString() || '';
            break;
          case 'description':
            exportItem[field] = cardData.description?.toString() || '';
            break;
          case 'column':
            exportItem[field] = columnData?.title?.toString() || 'Sin columna';
            break;
          case 'createdAt':
            exportItem[field] = cardData.createdAt ? 
              new Date(cardData.createdAt as string).toLocaleDateString('es-ES') : '';
            break;
          case 'priority':
            exportItem[field] = cardData.priority?.toString() || 'medium';
            break;
          case 'tags':
            exportItem[field] = Array.isArray(cardData.tags) ? 
              (cardData.tags as string[]).join(', ') : '';
            break;
          case 'dueDate':
            exportItem[field] = cardData.dueDate ? 
              new Date(cardData.dueDate as string).toLocaleDateString('es-ES') : '';
            break;
          default:
            exportItem[field] = cardData[field]?.toString() || '';
        }
      });

      return exportItem;
    });
  }
}
