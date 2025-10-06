import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useKanban } from './KanbanContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { dispatch } = useKanban();

  useEffect(() => {
    // Inicializar conexión WebSocket
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3000';
    socketRef.current = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    const socket = socketRef.current;

    // Event listeners para conexión
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      toast.success('Conectado al servidor');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      toast.error('Desconectado del servidor');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      toast.error('Error de conexión');
    });

    // Event listeners para actualizaciones en tiempo real
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

    socket.on('column:created', (column) => {
      dispatch({ type: 'COLUMN_CREATED', payload: column });
      toast.success(`Nueva columna: ${column.title}`);
    });

    socket.on('column:updated', (column) => {
      dispatch({ type: 'COLUMN_UPDATED', payload: column });
      toast.success(`Columna actualizada: ${column.title}`);
    });

    // Event listeners para exportación
    socket.on('export:success', (data) => {
      toast.success(`Backlog exportado exitosamente. ${data.totalCards} tarjetas enviadas.`);
    });

    socket.on('export:error', (error) => {
      toast.error(`Error en exportación: ${error.message}`);
    });

    // Cleanup al desmontar
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  // Funciones para emitir eventos
  const emitCardCreate = (cardData) => {
    if (socketRef.current) {
      socketRef.current.emit('card:create', cardData);
    }
  };

  const emitCardUpdate = (cardId, cardData) => {
    if (socketRef.current) {
      socketRef.current.emit('card:update', { cardId, ...cardData });
    }
  };

  const emitCardDelete = (cardId) => {
    if (socketRef.current) {
      socketRef.current.emit('card:delete', cardId);
    }
  };

  const emitCardMove = (cardId, moveData) => {
    if (socketRef.current) {
      socketRef.current.emit('card:move', { cardId, ...moveData });
    }
  };

  const emitColumnCreate = (columnData) => {
    if (socketRef.current) {
      socketRef.current.emit('column:create', columnData);
    }
  };

  const emitColumnUpdate = (columnId, columnData) => {
    if (socketRef.current) {
      socketRef.current.emit('column:update', { columnId, ...columnData });
    }
  };

  const value = {
    socket: socketRef.current,
    emitCardCreate,
    emitCardUpdate,
    emitCardDelete,
    emitCardMove,
    emitColumnCreate,
    emitColumnUpdate
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
