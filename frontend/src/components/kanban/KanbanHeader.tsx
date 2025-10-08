import { useState, useCallback } from 'react';
import { useExport } from '@/hooks/useExport';
import { Button } from '@/components/kanban/Button';
import { motion } from 'framer-motion';

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
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={handleExportClick}
              variant="ghost"
              disabled={isExporting}
              className="transition-all duration-200 hover:shadow-lg hover:bg-primary/5"
            >
              {isExporting ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Exportando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V17a2 2 0 01-2 2z" />
                  </svg>
                  Exportar Backlog
                </>
              )}
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button 
              onClick={onCreateTask} 
              variant="primary"
              className="transition-all duration-200 hover:shadow-xl hover:shadow-primary/25"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva tarea
            </Button>
          </motion.div>
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
