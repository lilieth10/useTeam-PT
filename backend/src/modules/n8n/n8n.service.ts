import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface N8nExportPayload {
  boardId?: string;
  email: string;
  fields: string[];
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    column: string;
    createdAt: string;
    priority?: string;
  }>;
}

@Injectable()
export class N8nService {
  private readonly webhookUrl: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.webhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL') || 
      'https://automation.useteam.io/webhook/webhook/kanban-export';
  }
  /**
   * Envía datos al webhook de N8N para procesamiento
   */
  async triggerExportWorkflow(payload: N8nExportPayload): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      return {
        success: true,
        message: 'Workflow triggered successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al conectar con N8N',
          error: error.message,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Verifica el estado de la conexión con N8N
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl.replace('/webhook/kanban-export', '/healthz'));
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
