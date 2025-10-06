import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { kanbanReducer, initialState } from './kanbanReducer';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

const KanbanContext = createContext();

/**
 * Hook para acceder al contexto de Kanban
 * Responsabilidad: Proveer acceso seguro al estado de Kanban
 */
export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};

/**
 * Proveedor de Kanban
 * Responsabilidad: Gestionar estado del tablero Kanban y coordinar con WebSocket
 * Principio: Single Responsibility - solo maneja estado de Kanban
 *principio: Dependency Inversion - depende de abstracción (SocketService)
 */
export const KanbanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);
  const { socket } = useSocket();

  // Inicializar datos y configurar listeners de WebSocket
  useEffect(() => {
    // Cargar datos iniciales (mock data)
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

    // Configurar listeners de WebSocket si está disponible
    if (socket) {
      setupSocketListeners(socket, dispatch);
    }

    // Cleanup listeners al desmontar
    return () => {
      if (socket) {
        socket.removeAllListeners();
      }
    };
  }, [socket]);

  const value = {
    // Estado
    ...state,
    
    // Socket
    socket,
    
    // Dispatch para actualizaciones directas
    dispatch
  };

  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
};

/**
 * Configurar listeners de WebSocket para colaboración en tiempo real
 * @param {Socket} socket - Socket de WebSocket
 * @param {Function} dispatch - Función dispatch del reducer
 */
function setupSocketListeners(socket, dispatch) {
  // Listeners para tarjetas
  socket.on('card:created', (card) => {
    dispatch({ type: 'CARD_CREATED', payload: card });
    toast.success(`Nueva tarjeta: ${card.title}`);
  });

  socket.on('card:updated', (card) => {
    dispatch({ type: 'CARD_UPDATED', payload: card });
    toast.success(`Tarjeta actualizada: ${card.title}`);
  });

  socket.on('card:deleted', (cardId) => {
    dispatch({ type: 'CARD_DELETED', payload: cardId });
    toast.success('Tarjeta eliminada');
  });

  socket.on('card:moved', (card) => {
    dispatch({ type: 'CARD_MOVED', payload: card });
    toast.success(`Tarjeta movida: ${card.title}`);
  });

  // Listeners para columnas
  socket.on('column:created', (column) => {
    dispatch({ type: 'COLUMN_CREATED', payload: column });
    toast.success(`Nueva columna: ${column.title}`);
  });

  socket.on('column:updated', (column) => {
    dispatch({ type: 'COLUMN_UPDATED', payload: column });
    toast.success(`Columna actualizada: ${column.title}`);
  });

  // Listeners para exportación
  socket.on('export:success', (data) => {
    toast.success(`Backlog exportado exitosamente. ${data.totalCards} tarjetas enviadas.`);
  });

  socket.on('export:error', (error) => {
    toast.error(`Error en exportación: ${error.message}`);
  });
}
