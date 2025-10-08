import { apiClient, ApiResponse } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/utils/constants';

// Interface específica para la respuesta de exportación
interface ExportBacklogResponse {
  message: string;
}

/**
 * Servicio para gestionar operaciones de exportación
 * Sigue el principio de responsabilidad única (SRP)
 */
export class ExportService {
  /**
   * Exporta el backlog del tablero
   */
  static async exportBacklog(options: {
    boardId?: string;
    email?: string;
    fields?: string[];
  } = {}): Promise<{ success: boolean; message: string; jobId?: string }> {
    try {
      const response = await apiClient.post<ExportBacklogResponse>(`${API_ENDPOINTS.EXPORT}/backlog`, options);

      // Si n8n inició el flujo, la respuesta será exitosa.
      if (response.data && response.data.message === 'Workflow was started') {
        return {
          success: true,
          message: 'Exportación iniciada correctamente. Recibirás el archivo por email.',
        };
      }

      // Manejar respuestas inesperadas del backend.
      return {
        success: false,
        message: response.data.message || 'Respuesta inesperada del servidor.',
      };
    } catch (error) {
      console.error('Error exporting backlog:', error);

      // Fallback para desarrollo si el servicio no está disponible.
      return {
        success: false,
        message: 'Error al exportar backlog. El servicio N8N no está disponible.',
      };
    }
  }

  /**
   * Obtiene el estado de una exportación
   */
  static async getExportStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message?: string;
    downloadUrl?: string;
  }> {
    try {
      // Esta funcionalidad dependería de cómo implemente el backend el seguimiento de jobs
      // Por ahora retornamos un estado simulado
      return {
        status: 'completed',
        message: 'Exportación completada',
        downloadUrl: '#', // URL del archivo generado
      };
    } catch (error) {
      console.error('Error getting export status:', error);
      return {
        status: 'failed',
        message: 'Error al obtener estado de exportación',
      };
    }
  }

  /**
   * Valida opciones de exportación
   */
  static validateExportOptions(options: {
    email?: string;
    fields?: string[];
  }): string[] {
    const errors: string[] = [];

    if (options.email && !this.isValidEmail(options.email)) {
      errors.push('Email no válido');
    }

    const allowedFields = [
      'id', 'title', 'description', 'column', 'createdAt',
      'priority', 'tags', 'dueDate'
    ];

    if (options.fields) {
      const invalidFields = options.fields.filter(field => !allowedFields.includes(field));
      if (invalidFields.length > 0) {
        errors.push(`Campos no válidos: ${invalidFields.join(', ')}`);
      }
    }

    return errors;
  }

  /**
   * Valida formato de email
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
