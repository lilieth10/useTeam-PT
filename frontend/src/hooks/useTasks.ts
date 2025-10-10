import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskService } from '@/services/taskService';
import { filterTasks, sortTasksByPosition } from '@/utils/taskUtils';
import { useWebSocket } from '@/hooks/useWebSocket';

// Interfaces para eventos WebSocket
interface WebSocketTaskEvent {
  task: Task;
}

interface WebSocketDeleteEvent {
  taskId: string | number;
}

interface WebSocketReorderEvent {
  columnId: string;
  tasks: Task[];
}

/**
 * Hook personalizado para gestión de tareas
 * Sigue el principio de responsabilidad única (SRP)
 */
export const useTasks = (boardId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, on, off } = useWebSocket();

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

  // Escuchar eventos WebSocket para actualizar en tiempo real
  useEffect(() => {
    if (!isConnected) return;

    const handleCardCreated = (data: WebSocketTaskEvent) => {
      // Actualización optimista para nueva tarea
      if (data?.task) {
        setTasks(prevTasks => [...prevTasks, data.task]);
      } else {
        fetchTasks();
      }
    };

    const handleCardUpdated = (data: WebSocketTaskEvent) => {
      // Actualización optimista para tarea modificada
      if (data?.task) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === data.task.id ? data.task : task
          )
        );
      } else {
        fetchTasks();
      }
    };

    const handleCardDeleted = (data: WebSocketDeleteEvent) => {
      // Actualización optimista para tarea eliminada
      if (data?.taskId) {
        setTasks(prevTasks => 
          prevTasks.filter(task => task.id.toString() !== data.taskId.toString())
        );
      } else {
        fetchTasks();
      }
    };

    const handleCardMoved = (data: WebSocketTaskEvent) => {
      // Actualización optimista para movimiento entre columnas
      if (data?.task) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === data.task.id ? data.task : task
          )
        );
      } else {
        // Fallback: refetch solo si no tenemos los datos
        fetchTasks();
      }
    };

    const handleCardsReordered = (data: WebSocketReorderEvent) => {
      // Actualización optimista para reordenamiento dentro de columna
      if (data?.tasks && Array.isArray(data.tasks)) {
        setTasks(prevTasks => {
          const updatedTasksMap = new Map<string | number, Task>();
          data.tasks.forEach((task: Task) => {
            updatedTasksMap.set(task.id, task);
          });
          
          return prevTasks.map(task => {
            const updatedTask = updatedTasksMap.get(task.id);
            return updatedTask || task;
          });
        });
      } else {
        // Fallback: refetch solo si no tenemos los datos
        fetchTasks();
      }
    };

    // Suscribirse a eventos
    on('card:created', handleCardCreated);
    on('card:updated', handleCardUpdated);
    on('card:deleted', handleCardDeleted);
    on('card:moved', handleCardMoved);
    on('cards:reordered', handleCardsReordered);

    return () => {
      off('card:created', handleCardCreated);
      off('card:updated', handleCardUpdated);
      off('card:deleted', handleCardDeleted);
      off('card:moved', handleCardMoved);
      off('cards:reordered', handleCardsReordered);
    };
  }, [isConnected, on, off, fetchTasks]);

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
