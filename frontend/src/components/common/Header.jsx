import React, { useState } from 'react';
import { useKanban } from '../../context/KanbanContext';

/**
 * Componente Header
 * Responsabilidad: Mostrar información del tablero y botón de exportación
 */
export const Header = () => {
  const { boards, activeBoardId, exporting, dispatch, socket } = useKanban();
  const [showExportModal, setShowExportModal] = useState(false);
  
  const activeBoard = boards.find(board => board._id === activeBoardId);

  /**
   * Manejar exportación de backlog
   * @param {string} email - Email de destino
   */
  const handleExport = async (email) => {
    try {
      dispatch({ type: 'SET_EXPORTING', payload: true });
      
      // Emitir solicitud de exportación via WebSocket
      if (socket) {
        socket.emit('export:request', { email, boardId: activeBoardId });
      }
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowExportModal(false);
    } catch (error) {
      console.error('Error en exportación:', error);
    } finally {
      dispatch({ type: 'SET_EXPORTING', payload: false });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Kanban Board
            </h1>
            {activeBoard && (
              <span className="text-lg text-gray-600">
                - {activeBoard.title}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowExportModal(true)}
              disabled={exporting || !activeBoardId}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? 'Exportando...' : 'Exportar Backlog'}
            </button>
          </div>
        </div>
      </div>
      
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          isExporting={exporting}
        />
      )}
    </header>
  );
};

/**
 * Modal de exportación de backlog
 */
const ExportModal = ({ isOpen, onClose, onExport, isExporting }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    try {
      await onExport(email);
      setEmail('');
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Exportar Backlog</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email de destino
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ejemplo@correo.com"
              required
              disabled={isExporting}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isExporting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isExporting || !email.trim()}
            >
              {isExporting ? 'Exportando...' : 'Exportar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
