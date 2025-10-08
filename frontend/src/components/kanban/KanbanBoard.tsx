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
        distance: 3, // Menor distancia para activar más rápido
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
    const overStatus = overTask?.status || (overId as 'todo' | 'inProgress' | 'completed');

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

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id.toString() === activeId);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id.toString() === overId);
    const newStatus = overTask?.status || (overId as 'todo' | 'inProgress' | 'completed');

    try {
      if (activeTask.status !== newStatus) {
        const newColumnId = mapStatusToColumnId(newStatus);
        await updateTaskPosition(activeTask.id, 0, newColumnId);
      } else {
        const tasksInColumn = tasks.filter(t => t.status === activeTask.status);
        const activeIndex = tasksInColumn.findIndex(t => t.id.toString() === activeId);
        const overIndex = tasksInColumn.findIndex(t => t.id.toString() === overId);
        
        if (activeIndex !== overIndex) {
          const newPosition = overIndex;
          const newColumnId = mapStatusToColumnId(activeTask.status);
          await updateTaskPosition(activeTask.id, newPosition, newColumnId);
        }
      }

      await refetch();
    } catch (error) {
      // Error handling could be improved with user notifications
    }
  };

  // Mapear status del frontend a columnId del backend
  const mapStatusToColumnId = (status: string): string => {
    const statusToColumnMap = {
      'todo': 'todo',
      'inProgress': 'inProgress', 
      'completed': 'completed'
    };
    return statusToColumnMap[status] || 'todo';
  };

  // Manejadores CRUD
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      // Extraer solo los campos que necesita el backend
      const { status, ...cleanTaskData } = taskData;
      
      await createTask({
        title: cleanTaskData.title,
        description: cleanTaskData.description,
        boardId: 'default-board', // TODO: Obtener del contexto
        columnId: status || 'todo',
        priority: cleanTaskData.priority,
        tags: cleanTaskData.tags,
        dueDate: cleanTaskData.dueDate,
      });

      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      // Error handling could be improved with user notifications
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingTask) return;

    try {
      // Extraer solo los campos que necesita el backend, excluyendo campos del frontend
      const { status, position, boardId, columnId, ...cleanTaskData } = taskData;
      
      // Preparar datos limpios para el backend
      const updateData = {
        title: cleanTaskData.title,
        description: cleanTaskData.description,
        priority: cleanTaskData.priority,
        tags: cleanTaskData.tags,
        dueDate: cleanTaskData.dueDate,
      };

      // Filtrar campos undefined
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      
      await updateTask(editingTask.id, filteredData);
      await refetch();
      setEditingTask(undefined);
      setIsModalOpen(false);
    } catch (error) {
      // Error handling could be improved with user notifications
    }
  };

  const handleDeleteTask = async (taskId: string | number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await deleteTask(taskId);
        await refetch();
      } catch (error) {
        // Error handling could be improved with user notifications
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
                tasks={getTasksByStatus(column.id as 'todo' | 'inProgress' | 'completed')}
                onEditTask={openEditModal}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-6 scale-110 opacity-90 shadow-2xl ring-4 ring-primary/50 rounded-lg transform-gpu">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-lg">
                  <TaskCard
                    task={activeTask}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
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
