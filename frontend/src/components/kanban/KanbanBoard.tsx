import { useState } from 'react';
import { Task } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { KanbanHeader } from '@/components/kanban/KanbanHeader';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { Modal } from '@/components/kanban/Modal';
import { TaskForm } from '@/components/kanban/TaskForm';
import { ConnectionIndicator } from '@/components/kanban/ConnectionIndicator';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { TaskCard } from '@/components/kanban/TaskCard';

/**
 * Componente principal del tablero Kanban
 * Sigue el principio de responsabilidad única (SRP)
 * Solo maneja la lógica del tablero y drag & drop
 */
export const KanbanBoard = () => {
  // Estados locales del componente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Hooks personalizados
  const { tasks, loading, error, getTasksByStatus, refetch } = useTasks();
  const { createTask, updateTask, updateTaskPosition, deleteTask } = useTaskOperations();

  // Configuración de sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Columnas del tablero
  const columns = [
    { id: 'todo', title: 'Por hacer' },
    { id: 'inProgress', title: 'En progreso' },
    { id: 'completed', title: 'Completado' },
  ];

  // Manejadores de drag & drop
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id.toString() === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id.toString() === activeId);
    const overTask = tasks.find((t) => t.id.toString() === overId);

    if (!activeTask) return;

    const activeStatus = activeTask.status;
    const overStatus = overTask?.status || (overId as any);

    if (activeStatus === overStatus) {
      // Reordenamiento dentro de la misma columna
      const activeIndex = tasks.findIndex((t) => t.id.toString() === activeId);
      const overIndex = tasks.findIndex((t) => t.id.toString() === overId);

      if (activeIndex !== overIndex) {
        // Aquí actualizaría el estado local temporalmente
        // El backend se actualiza en handleDragEnd
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const activeTask = tasks.find((t) => t.id.toString() === activeId);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id.toString() === overId);
    const newStatus = overTask?.status || (overId as any);

    if (activeTask.status !== newStatus) {
      try {
        // Actualizar posición y columna en el backend
        await updateTaskPosition(activeTask.id, 0, newStatus);

        // Refrescar datos
        await refetch();
      } catch (error) {
        console.error('Error updating task position:', error);
      }
    }
  };

  // Manejadores CRUD
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await createTask({
        ...taskData,
        boardId: 'default-board', // TODO: Obtener del contexto
        columnId: taskData.status || 'todo',
      });

      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, taskData);
      await refetch();
      setEditingTask(undefined);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string | number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await deleteTask(taskId);
        await refetch();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Manejadores del modal
  const openCreateModal = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando tablero...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <ConnectionIndicator />
      <div className="max-w-7xl mx-auto">
        <KanbanHeader onCreateTask={openCreateModal} />

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={getTasksByStatus(column.id as any)}
                onEditTask={openEditModal}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 opacity-90">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingTask ? 'Editar tarea' : 'Nueva tarea'}
        >
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={closeModal}
          />
        </Modal>
      </div>
    </div>
  );
};
