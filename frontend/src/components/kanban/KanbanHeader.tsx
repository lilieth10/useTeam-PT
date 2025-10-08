import { useState, useCallback } from 'react';
import { useExport } from '@/hooks/useExport';
import { Button } from '@/components/kanban/Button';

/**
 * Componente Header del tablero Kanban
 * Sigue el principio de responsabilidad única (SRP)
 * Solo maneja la lógica del header y acciones principales
 */
interface KanbanHeaderProps {
  onCreateTask: () => void;
}

export const KanbanHeader = ({ onCreateTask }: KanbanHeaderProps) => {
  const { isExporting, exportBacklog } = useExport();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');

  const handleExportClick = useCallback(() => {
    setShowEmailModal(true);
  }, []);

  const handleExportWithEmail = useCallback(async () => {
    if (!email) return;

    try {
      await exportBacklog({
        email: email,
        fields: ['id', 'title', 'description', 'column', 'createdAt', 'priority'],
      });
      setShowEmailModal(false);
      setEmail('');
    } catch (error) {
      console.error('Error exporting backlog:', error);
    }
  }, [email, exportBacklog]);

  const handleCloseModal = useCallback(() => {
    setShowEmailModal(false);
    setEmail('');
  }, []);

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            useTeam PT
          </h1>
          <p className="text-muted-foreground mt-2">
            Tablero Kanban Colaborativo
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleExportClick}
            variant="ghost"
            disabled={isExporting}
          >
            {isExporting ? '⏳ Exportando...' : '📊 Exportar Backlog'}
          </Button>
          <Button onClick={onCreateTask} variant="primary">
            + Nueva tarea
          </Button>
        </div>
      </div>

      {/* Modal para configurar email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Configurar Exportación</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Email de destino:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-email@ejemplo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportWithEmail}
                variant="primary"
                disabled={!email}
              >
                Exportar
              </Button>
              <Button
                onClick={handleCloseModal}
                variant="ghost"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
