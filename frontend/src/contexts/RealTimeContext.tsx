import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useKanbanContext } from '@/contexts/KanbanContext';

// Interfaces para tipado seguro
interface CardEventData {
  cardId?: string;
  title?: string;
  description?: string;
  columnId?: string;
  newColumnId?: string;
  position?: number;
}

/**
 * Contexto para gestión de actualizaciones en tiempo real
 * Sigue el principio de inversión de dependencias (DIP)
 */
interface RealTimeContextType {
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

export const useRealTimeContext = () => {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTimeContext must be used within a RealTimeProvider');
  }
  return context;
};

interface RealTimeProviderProps {
  children: ReactNode;
}

export const RealTimeProvider = ({ children }: RealTimeProviderProps) => {
  const { isConnected, on, off } = useWebSocket();
  const { setTasks, setError } = useKanbanContext();

  // Estado de conexión
  const connectionStatus: 'connected' | 'disconnected' | 'connecting' = isConnected ? 'connected' : 'disconnected';

  // Escuchar eventos de tareas en tiempo real
  useEffect(() => {
    if (!isConnected) return;

    const handleCardCreated = (data: CardEventData) => {
      console.log('🔄 Tarjeta creada en tiempo real:', data);
      // Refrescar las tareas para mostrar la nueva tarjeta
      window.location.reload(); // Temporal - mejorar con estado
    };

    const handleCardUpdated = (data: CardEventData) => {
      console.log('🔄 Tarjeta actualizada en tiempo real:', data);
      // Refrescar las tareas para mostrar los cambios
      window.location.reload(); // Temporal - mejorar con estado
    };

    const handleCardDeleted = (cardId: string) => {
      console.log('🔄 Tarjeta eliminada en tiempo real:', cardId);
      // Refrescar las tareas para ocultar la tarjeta eliminada
      window.location.reload(); // Temporal - mejorar con estado
    };

    const handleCardMoved = (data: CardEventData) => {
      console.log('🔄 Tarjeta movida en tiempo real:', data);
      // Refrescar las tareas para mostrar la nueva posición
      window.location.reload(); // Temporal - mejorar con estado
    };

    // Suscribirse a eventos
    on('card:created', handleCardCreated);
    on('card:updated', handleCardUpdated);
    on('card:deleted', handleCardDeleted);
    on('card:moved', handleCardMoved);

    // Cleanup
    return () => {
      off('card:created', handleCardCreated);
      off('card:updated', handleCardUpdated);
      off('card:deleted', handleCardDeleted);
      off('card:moved', handleCardMoved);
    };
  }, [isConnected, on, off]);

  const value = {
    isConnected,
    connectionStatus,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};
