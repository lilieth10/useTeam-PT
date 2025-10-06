import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { kanbanReducer, initialState } from './kanbanReducer';
import toast from 'react-hot-toast';

const KanbanContext = createContext();

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};

export const KanbanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);

  useEffect(() => {
    const mockBoards = [
      {
        _id: '1',
        title: 'Mi Tablero Kanban',
        description: 'Tablero de ejemplo para la prueba técnica',
        isActive: true,
        position: 0,
        createdAt: new Date().toISOString()
      }
    ];

    const mockColumns = [
      { _id: 'col1', title: 'Backlog', boardId: '1', position: 0, color: '#e5e7eb' },
      { _id: 'col2', title: 'En Progreso', boardId: '1', position: 1, color: '#fef3c7' },
      { _id: 'col3', title: 'Completado', boardId: '1', position: 2, color: '#d1fae5' }
    ];

    const mockCards = [
      {
        _id: 'card1',
        title: 'Configurar proyecto',
        description: 'Configurar la estructura inicial del proyecto',
        boardId: '1',
        columnId: 'col3',
        position: 0,
        priority: 'high',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'card2', 
        title: 'Implementar drag & drop',
        description: 'Agregar funcionalidad de arrastrar y soltar tarjetas',
        boardId: '1',
        columnId: 'col2',
        position: 0,
        priority: 'medium',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'card3',
        title: 'Conectar con N8N',
        description: 'Integrar la funcionalidad de exportación con N8N',
        boardId: '1',
        columnId: 'col1',
        position: 0,
        priority: 'low',
        createdAt: new Date().toISOString()
      }
    ];

    dispatch({ type: 'SET_BOARDS', payload: mockBoards });
    dispatch({ type: 'SET_COLUMNS', payload: mockColumns });
    dispatch({ type: 'SET_CARDS', payload: mockCards });
    dispatch({ type: 'SET_ACTIVE_BOARD', payload: '1' });
  }, []);

  const exportBacklog = async (email) => {
    try {
      dispatch({ type: 'SET_EXPORTING', payload: true });
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Solicitud de exportación enviada');
    } catch (error) {
      console.error('Error exporting backlog:', error);
      toast.error('Error al exportar el backlog');
      throw error;
    } finally {
      dispatch({ type: 'SET_EXPORTING', payload: false });
    }
  };

  const value = {
    // State
    ...state,
    
    // Actions
    exportBacklog,
    
    // Dispatch for direct state updates
    dispatch
  };

  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
};
