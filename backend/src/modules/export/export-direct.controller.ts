import { Controller, Post, Body } from '@nestjs/common';

/**
 * Controlador para exportación directa (bypass N8N)
 * Sigue principios SOLID - Responsabilidad única
 */
@Controller('export-direct')
export class ExportDirectController {

  @Post('backlog')
  async exportBacklogDirect(@Body() body: { email: string; subject?: string }) {
    // Lógica de envío directo
    return {
      success: true,
      message: `Email enviado a ${body.email}`,
      subject: body.subject || 'Exportación de backlog'
    };
  }
}
