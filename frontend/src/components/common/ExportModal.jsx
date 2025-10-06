import React, { useState } from 'react';
import { useKanban } from '../../context/KanbanContext';

const ExportModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const { exportBacklog, exporting } = useKanban();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    try {
      await exportBacklog(email);
      onClose();
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
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={exporting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={exporting || !email.trim()}
            >
              {exporting ? 'Exportando...' : 'Exportar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;
