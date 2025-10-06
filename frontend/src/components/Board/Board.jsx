import React from 'react';
import { useKanban } from '../../context/KanbanContext';

const Board = () => {
  const { boards, columns, cards, activeBoardId, loading } = useKanban();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const activeBoard = boards.find(board => board._id === activeBoardId);
  const boardColumns = columns.filter(column => column.boardId === activeBoardId);

  if (!activeBoard) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          No hay tableros disponibles
        </h2>
        <p className="text-gray-500">
          Crea tu primer tablero para comenzar a organizar tus tareas.
        </p>
      </div>
    );
  }

  const getCardsForColumn = (columnId) => {
    return cards.filter(card => card.columnId === columnId);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {activeBoard.title}
        </h1>
        {activeBoard.description && (
          <p className="text-gray-600">{activeBoard.description}</p>
        )}
      </div>

      <div className="flex space-x-6 overflow-x-auto pb-6">
        {boardColumns.map((column) => (
          <div key={column._id} className="flex-shrink-0 w-80">
            <div className="column">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">{column.title}</h3>
                <span className="bg-gray-200 text-gray-600 text-sm px-2 py-1 rounded-full">
                  {getCardsForColumn(column._id).length}
                </span>
              </div>

              <div className="space-y-3">
                {getCardsForColumn(column._id).map((card) => (
                  <div
                    key={card._id}
                    className={`card border-l-4 ${getPriorityColor(card.priority)} hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{card.title}</h4>
                    {card.description && (
                      <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        card.priority === 'high' ? 'bg-red-100 text-red-800' :
                        card.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {card.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}

                {getCardsForColumn(column._id).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No hay tarjetas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
