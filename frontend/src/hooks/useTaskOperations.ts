import { useCallback } from 'react';
import { Task, CreateTaskData, UpdateTaskData } from '@/types/task';
import { TaskService } from '@/services/taskService';

/**
 * Hook personalizado para operaciones CRUD de tareas
 * Sigue el principio de responsabilidad única (SRP)
 */
export const useTaskOperations = () => {

  // Crear tarea
  const createTask = useCallback(async (taskData: CreateTaskData): Promise<Task> => {
    try {
      const newTask = await TaskService.createTask(taskData);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }, []);

  // Actualizar tarea
  const updateTask = useCallback(async (taskId: string | number, taskData: UpdateTaskData): Promise<Task> => {
    try {
      const updatedTask = await TaskService.updateTask(taskId, taskData);
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, []);

  // Actualizar posición de tarea (drag & drop)
  const updateTaskPosition = useCallback(async (
    taskId: string | number,
    newPosition: number,
    newColumnId?: string
  ): Promise<Task> => {
    try {
      const updatedTask = await TaskService.updateTaskPosition(taskId, newPosition, newColumnId);
      return updatedTask;
    } catch (error) {
      console.error('Error updating task position:', error);
      throw error;
    }
  }, []);

  // Eliminar tarea
  const deleteTask = useCallback(async (taskId: string | number): Promise<void> => {
    try {
      await TaskService.deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }, []);

  return {
    createTask,
    updateTask,
    updateTaskPosition,
    deleteTask,
  };
};
