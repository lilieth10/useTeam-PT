import { useState, useCallback } from 'react';
import { ExportService } from '@/services/exportService';

/**
 * Hook personalizado para gestión de exportaciones
 * Sigue el principio de responsabilidad única (SRP)
 */
export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{
    success: boolean;
    message: string;
    jobId?: string;
  } | null>(null);

  const exportBacklog = useCallback(async (options: {
    boardId?: string;
    email?: string;
    fields?: string[];
  } = {}) => {
    try {
      setIsExporting(true);
      setExportResult(null);

      // Validar opciones antes de enviar
      const validationErrors = ExportService.validateExportOptions(options);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const result = await ExportService.exportBacklog(options);
      setExportResult(result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setExportResult({
        success: false,
        message: errorMessage,
      });

      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const clearExportResult = useCallback(() => {
    setExportResult(null);
  }, []);

  return {
    isExporting,
    exportResult,
    exportBacklog,
    clearExportResult,
  };
};
