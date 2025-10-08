import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useKanbanContext } from '@/contexts/KanbanContext';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';

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
  const { isConnected, on, off, socket } = useWebSocket();
  const { tasks, setTasks, setError } = useKanbanContext();
  const { toast } = useToast();

  // Estado de conexión
  const connectionStatus: 'connected' | 'disconnected' | 'connecting' = isConnected ? 'connected' : 'disconnected';

  // Escuchar eventos de tareas en tiempo real
  useEffect(() => {
    if (!isConnected) return;

    const handleCardCreated = (data: CardEventData) => {
      toast({
        title: "🆕 Nueva tarea",
        description: `Se creó la tarea: ${data.title || 'Sin título'}`,
        variant: "default",
      });
    };

    const handleCardUpdated = (data: CardEventData) => {
      toast({
        title: "✏️ Tarea actualizada",
        description: `Se actualizó la tarea: ${data.title || 'Sin título'}`,
        variant: "default",
      });
    };

    const handleCardDeleted = (cardId: string) => {
      toast({
        title: "🗑️ Tarea eliminada",
        description: "Una tarea fue eliminada por otro usuario",
        variant: "destructive",
      });
    };

    const handleCardMoved = (data: CardEventData) => {
      const getColumnName = (columnId: string) => {
        const columns = {
          'todo': 'Por hacer',
          'inProgress': 'En progreso', 
          'completed': 'Completadas'
        };
        return columns[columnId as keyof typeof columns] || columnId;
      };
      
      const columnName = getColumnName(data.newColumnId || data.columnId || '');
      const isPositionChange = data.columnId === data.newColumnId;
      
      const description = isPositionChange 
        ? `"${data.title || 'Sin título'}" cambió de posición en ${columnName}`
        : `"${data.title || 'Sin título'}" se movió a ${columnName}`;
      
      toast({
        title: isPositionChange ? "↕️ Posición actualizada" : "🔄 Tarea movida",
        description,
        variant: "default",
      });
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
  }, [isConnected, on, off, toast]);

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
