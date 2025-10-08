import { useCallback } from 'react';
import { Task, CreateTaskData, UpdateTaskData } from '@/types/task';
import { TaskService } from '@/services/taskService';
import { useWebSocket } from '@/hooks/useWebSocket';

/**
 * Hook personalizado para operaciones CRUD de tareas
 * Sigue el principio de responsabilidad única (SRP)
 */
export const useTaskOperations = () => {
  const { emit } = useWebSocket();

  // Crear tarea
  const createTask = useCallback(async (taskData: CreateTaskData): Promise<Task> => {
    try {
      const newTask = await TaskService.createTask(taskData);
      
      // Emitir evento WebSocket para notificar a otros usuarios
      emit('card:create', {
        cardId: newTask.id,
        title: newTask.title,
        description: newTask.description,
        columnId: taskData.columnId,
      });
      
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }, [emit]);

  // Actualizar tarea
  const updateTask = useCallback(async (taskId: string | number, taskData: UpdateTaskData): Promise<Task> => {
    try {
      const updatedTask = await TaskService.updateTask(taskId, taskData);
      
      // Emitir evento WebSocket para notificar a otros usuarios
      emit('card:update', {
        cardId: taskId.toString(),
        title: taskData.title,
        description: taskData.description,
      });
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, [emit]);

  // Actualizar posición de tarea (drag & drop)
  const updateTaskPosition = useCallback(async (
    taskId: string | number,
    newPosition: number,
    newColumnId?: string
  ): Promise<Task> => {
    try {
      const updatedTask = await TaskService.updateTaskPosition(taskId, newPosition, newColumnId);
      
      // Emitir evento WebSocket para notificar a otros usuarios
      emit('card:move', {
        cardId: taskId.toString(),
        position: newPosition,
        newColumnId: newColumnId,
      });
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task position:', error);
      throw error;
    }
  }, [emit]);

  // Eliminar tarea
  const deleteTask = useCallback(async (taskId: string | number): Promise<void> => {
    try {
      await TaskService.deleteTask(taskId);
      
      // Emitir evento WebSocket para notificar a otros usuarios
      emit('card:delete', {
        cardId: taskId.toString(),
      });
      
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }, [emit]);

  return {
    createTask,
    updateTask,
    updateTaskPosition,
    deleteTask,
  };
};
