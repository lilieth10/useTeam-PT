import { Task, TaskStatus, CreateTaskData } from '@/types/task';
import { TASK_STATUS } from '@/utils/constants';

/**
 * Formatea una fecha para mostrar en la interfaz
 */
export const formatTaskDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Obtiene el label legible para un estado de tarea
 */
export const getTaskStatusLabel = (status: TaskStatus): string => {
  const labels = {
    [TASK_STATUS.TODO]: 'Por hacer',
    [TASK_STATUS.IN_PROGRESS]: 'En progreso',
    [TASK_STATUS.COMPLETED]: 'Completado',
  };

  return labels[status] || status;
};

/**
 * Obtiene el color para un estado de tarea
 */
export const getTaskStatusColor = (status: TaskStatus): string => {
  const colors = {
    [TASK_STATUS.TODO]: 'text-blue-600 bg-blue-100',
    [TASK_STATUS.IN_PROGRESS]: 'text-amber-600 bg-amber-100',
    [TASK_STATUS.COMPLETED]: 'text-green-600 bg-green-100',
  };

  return colors[status] || 'text-gray-600 bg-gray-100';
};

/**
 * Calcula estadísticas básicas de tareas
 */
export const calculateTaskStats = (tasks: Task[]) => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === TASK_STATUS.COMPLETED).length;
  const inProgress = tasks.filter(task => task.status === TASK_STATUS.IN_PROGRESS).length;
  const todo = tasks.filter(task => task.status === TASK_STATUS.TODO).length;

  return {
    total,
    completed,
    inProgress,
    todo,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

/**
 * Filtra tareas por criterios
 */
export const filterTasks = (
  tasks: Task[],
  filters: {
    status?: TaskStatus;
    search?: string;
    priority?: string;
  }
): Task[] => {
  return tasks.filter(task => {
    // Filtro por estado
    if (filters.status && task.status !== filters.status) {
      return false;
    }

    // Filtro por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchTerm);
      const matchesDescription = task.description?.toLowerCase().includes(searchTerm);

      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }

    // Filtro por prioridad
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    return true;
  });
};

/**
 * Ordena tareas por posición dentro de una columna
 */
export const sortTasksByPosition = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // Primero por posición
    if (a.position !== undefined && b.position !== undefined) {
      return a.position - b.position;
    }

    // Si no hay posición, por fecha de creación (más recientes primero)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Valida datos de tarea antes de crear/actualizar
 */
export const validateTaskData = (data: Partial<CreateTaskData>): string[] => {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('El título es requerido');
  }

  if (data.title && data.title.length > 100) {
    errors.push('El título no puede tener más de 100 caracteres');
  }

  if (data.description && data.description.length > 500) {
    errors.push('La descripción no puede tener más de 500 caracteres');
  }

  return errors;
};

/**
 * Genera ID único para nuevas tareas (temporal hasta conectar con backend)
 */
export const generateTaskId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};
