import React, { useState } from 'react';
import { useKanban } from '../../context/KanbanContext';
import ExportModal from './ExportModal';

const Header = () => {
  const { boards, activeBoardId, exporting } = useKanban();
  const [showExportModal, setShowExportModal] = useState(false);
  
  const activeBoard = boards.find(board => board._id === activeBoardId);

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
        />
      )}
    </header>
  );
};

export default Header;
