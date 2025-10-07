import { apiClient } from '@/services/apiClient';
import { Task, CreateTaskData, UpdateTaskData } from '@/types/task';
import { API_ENDPOINTS } from '@/utils/constants';

/**
 * Servicio para gestionar operaciones CRUD de tareas
 * Sigue el principio de responsabilidad única (SRP)
 */
export class TaskService {
  /**
   * Obtiene todas las tareas de un tablero
   */
  static async getTasks(boardId?: string): Promise<Task[]> {
    try {
      const response = await apiClient.get<Task[]>(API_ENDPOINTS.CARDS, {
        params: boardId ? { boardId } : undefined,
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Fallback a datos locales si el API falla
      return this.getLocalTasks();
    }
  }

  /**
   * Obtiene tareas de una columna específica
   */
  static async getTasksByColumn(columnId: string): Promise<Task[]> {
    try {
      const response = await apiClient.get<Task[]>(`${API_ENDPOINTS.CARDS}/column/${columnId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching tasks by column:', error);
      return [];
    }
  }

  /**
   * Crea una nueva tarea
   */
  static async createTask(taskData: CreateTaskData): Promise<Task> {
    try {
      const response = await apiClient.post<Task>(API_ENDPOINTS.CARDS, taskData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('No se pudo crear la tarea');
    }
  }

  /**
   * Actualiza una tarea existente
   */
  static async updateTask(taskId: string | number, taskData: UpdateTaskData): Promise<Task> {
    try {
      const response = await apiClient.put<Task>(`${API_ENDPOINTS.CARDS}/${taskId}`, taskData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('No se pudo actualizar la tarea');
    }
  }

  /**
   * Actualiza la posición de una tarea (drag & drop)
   */
  static async updateTaskPosition(
    taskId: string | number,
    newPosition: number,
    newColumnId?: string
  ): Promise<Task> {
    try {
      const response = await apiClient.patch<Task>(`${API_ENDPOINTS.CARDS}/${taskId}/position`, {
        position: newPosition,
        columnId: newColumnId,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating task position:', error);
      throw new Error('No se pudo actualizar la posición de la tarea');
    }
  }

  /**
   * Elimina una tarea
   */
  static async deleteTask(taskId: string | number): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.CARDS}/${taskId}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('No se pudo eliminar la tarea');
    }
  }

  /**
   * Datos locales como fallback (para desarrollo/testing)
   */
  private static getLocalTasks(): Task[] {
    return [
      {
        id: '1',
        title: 'Diseñar mockups de la interfaz',
        description: 'Crear los diseños iniciales para la nueva funcionalidad del dashboard',
        createdAt: new Date('2024-01-15'),
        status: 'todo',
        priority: 'high',
      },
      {
        id: '2',
        title: 'Implementar autenticación',
        description: 'Configurar el sistema de login y registro de usuarios',
        createdAt: new Date('2024-01-16'),
        status: 'inProgress',
        priority: 'high',
      },
      {
        id: '3',
        title: 'Configurar base de datos',
        description: 'Establecer las tablas y relaciones necesarias para el proyecto',
        createdAt: new Date('2024-01-14'),
        status: 'completed',
        priority: 'medium',
      },
    ];
  }
}
