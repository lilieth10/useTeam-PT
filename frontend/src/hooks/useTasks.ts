import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskService } from '@/services/taskService';
import { filterTasks, sortTasksByPosition } from '@/utils/taskUtils';

/**
 * Hook personalizado para gestión de tareas
 * Sigue el principio de responsabilidad única (SRP)
 */
export const useTasks = (boardId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para filtros
  const [filters, setFilters] = useState<{
    status?: TaskStatus;
    search?: string;
    priority?: string;
  }>({});

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedTasks = await TaskService.getTasks(boardId);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  // Cargar tareas al montar el componente
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filtrar tareas según criterios actuales
  const filteredTasks = filterTasks(tasks, filters);

  // Obtener tareas por columna
  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return sortTasksByPosition(
      filteredTasks.filter(task => task.status === status)
    );
  }, [filteredTasks]);

  return {
    tasks: filteredTasks,
    loading,
    error,
    filters,
    setFilters,
    getTasksByStatus,
    refetch: fetchTasks,
  };
};
