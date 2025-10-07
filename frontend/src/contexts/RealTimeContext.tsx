import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useKanbanContext } from '@/contexts/KanbanContext';

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
  const { isConnected } = useWebSocket();
  const { setTasks, setError } = useKanbanContext();

  // Estado de conexión
  const connectionStatus: 'connected' | 'disconnected' | 'connecting' = isConnected ? 'connected' : 'disconnected';

  // Escuchar eventos de tareas en tiempo real
  useEffect(() => {
    if (!isConnected) return;

    const handleCardCreated = (data: any) => {
      console.log('Card created:', data);
      // Aquí se podría actualizar el estado global si fuera necesario
      // Por ahora solo logueamos el evento
    };

    const handleCardUpdated = (data: any) => {
      console.log('Card updated:', data);
      // Aquí se podría actualizar el estado global si fuera necesario
    };

    const handleCardDeleted = (data: any) => {
      console.log('Card deleted:', data);
      // Aquí se podría actualizar el estado global si fuera necesario
    };

    // Suscribirse a eventos
    const { on } = useWebSocket();

    on('card:created', handleCardCreated);
    on('card:updated', handleCardUpdated);
    on('card:deleted', handleCardDeleted);

    // Cleanup
    return () => {
      // Los eventos se limpiarán automáticamente cuando se desmonte el componente
    };
  }, [isConnected]);

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
