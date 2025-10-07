import { apiClient } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/utils/constants';

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
      const response = await apiClient.post(`${API_ENDPOINTS.EXPORT}/backlog`, options);

      return {
        success: response.data.success,
        message: response.data.message,
        jobId: response.data.jobId,
      };
    } catch (error) {
      console.error('Error exporting backlog:', error);

      // Fallback para desarrollo
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
