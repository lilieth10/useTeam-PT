import { useRealTimeContext } from '@/contexts/RealTimeContext';

/**
 * Componente indicador de conexión en tiempo real
 * Sigue el principio de responsabilidad única (SRP)
 */
export const ConnectionIndicator = () => {
  const { isConnected, connectionStatus } = useRealTimeContext();

  if (!isConnected) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Desconectado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <span className="text-sm font-medium">Conectado</span>
      </div>
    </div>
  );
};
