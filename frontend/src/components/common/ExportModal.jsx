import React, { useState } from 'react';

/**
 * Modal de exportación de backlog
 * Responsabilidad: Interfaz para configurar exportación de backlog
 * Principio: Single Responsibility - solo maneja UI de exportación
 */
export const ExportModal = ({ isOpen, onClose, onExport, isExporting }) => {
  const [email, setEmail] = useState('');

  /**
   * Manejar envío del formulario
   * @param {Event} e - Evento del formulario
   */
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
