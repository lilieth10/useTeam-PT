import { createContext, useContext, useState, ReactNode } from 'react';
import { Task, TaskStatus } from '@/types/task';

/**
 * Contexto global para el estado de la aplicación Kanban
 * Sigue el principio de inversión de dependencias (DIP)
 */
interface KanbanFilters {
  status?: TaskStatus;
  search?: string;
  priority?: string;
}

interface KanbanContextType {
  // Estado de tareas
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;

  // Estado de filtros
  filters: KanbanFilters;
  setFilters: (filters: KanbanFilters) => void;

  // Estado de carga
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Estado de errores
  error: string | null;
  setError: (error: string | null) => void;

  // Acciones
  refreshTasks: () => Promise<void>;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const useKanbanContext = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanbanContext must be used within a KanbanProvider');
  }
  return context;
};

interface KanbanProviderProps {
  children: ReactNode;
}

export const KanbanProvider = ({ children }: KanbanProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KanbanFilters>({});

  const refreshTasks = async () => {
    setLoading(true);
    setError(null);
    // Aquí se implementaría la lógica para refrescar tareas
    // Por ahora solo simulamos
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const value = {
    tasks,
    setTasks,
    filters,
    setFilters,
    loading,
    setLoading,
    error,
    setError,
    refreshTasks,
  };

  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
};
