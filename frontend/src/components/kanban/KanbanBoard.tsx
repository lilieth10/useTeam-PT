import { useState } from 'react';
import { Task } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { useRealTimeContext } from '@/contexts/RealTimeContext';
import { Modal } from '@/components/kanban/Modal';
import { TaskForm } from '@/components/kanban/TaskForm';
import { TaskCard } from '@/components/kanban/TaskCard';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { KanbanHeader } from '@/components/kanban/KanbanHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    taskId: string | number | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    taskId: null,
    title: '',
    message: ''
  });

  // Hooks personalizados
  const { tasks, loading, error, getTasksByStatus, refetch } = useTasks();
  const { createTask, updateTask, updateTaskPosition, deleteTask } = useTaskOperations();
  const { toast } = useToast();

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
        // Movimiento entre columnas
        const newColumnId = mapStatusToColumnId(newStatus);
        await updateTaskPosition(activeTask.id, 0, newColumnId);
      } else {
        // Movimiento dentro de la misma columna - usar índice directamente
        const tasksInColumn = tasks.filter(t => t.status === activeTask.status);
        const overIndex = tasksInColumn.findIndex(t => t.id.toString() === overId);

        if (overIndex !== -1) {
          const newColumnId = mapStatusToColumnId(activeTask.status);
          await updateTaskPosition(activeTask.id, overIndex, newColumnId);
        }
      }

      // No refetch - WebSocket actualiza automáticamente
    } catch (error) {
      console.error('Error moving task:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo mover la tarea",
        variant: "destructive",
      });
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
        boardId: import.meta.env.VITE_DEFAULT_BOARD_ID || 'default-board',
        columnId: status || 'todo',
        priority: cleanTaskData.priority,
        tags: cleanTaskData.tags,
        dueDate: cleanTaskData.dueDate,
      });

      setIsModalOpen(false);
      toast({
        title: "✅ Tarea creada",
        description: "La tarea se ha creado correctamente.",
        variant: "default",
      });
      // No necesitamos refetch manual - el WebSocket lo actualiza automáticamente
    } catch (error) {
      console.error('❌ Error al crear tarea:', error);
      toast({
        title: "❌ Error",
        description: `Error: ${error?.message || 'No se pudo crear la tarea'}`,
        variant: "destructive",
      });
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
      setEditingTask(undefined);
      setIsModalOpen(false);
      toast({
        title: "✅ Tarea actualizada",
        description: "La tarea se ha actualizada correctamente.",
        variant: "default",
      });
      // No necesitamos refetch manual - el WebSocket lo actualiza automáticamente
    } catch (error) {
      console.error('❌ Error al actualizar tarea:', error);
      toast({
        title: "❌ Error",
        description: `Error: ${error?.message || 'No se pudo actualizar la tarea'}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = (taskId: string | number) => {
    setConfirmDialog({
      isOpen: true,
      taskId,
      title: 'Eliminar Tarea',
      message: '¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.'
    });
  };

  const confirmDeleteTask = async () => {
    if (!confirmDialog.taskId) return;

    try {
      await deleteTask(confirmDialog.taskId);
      toast({
        title: "✅ Tarea eliminada",
        description: "La tarea se ha eliminado correctamente.",
        variant: "default",
      });
      // No necesitamos refetch manual - el WebSocket lo actualiza automáticamente
    } catch (error) {
      console.error('❌ Error al eliminar tarea:', error);
      toast({
        title: "❌ Error",
        description: `Error: ${error?.message || 'No se pudo eliminar la tarea'}`,
        variant: "destructive",
      });
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
    <motion.div 
      className="min-h-screen p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        <KanbanHeader onCreateTask={openCreateModal} />

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {columns.map((column, index) => (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: 0.1 + (index * 0.05),
                  type: "spring",
                  stiffness: 400,
                  damping: 30
                }}
              >
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  tasks={getTasksByStatus(column.id as 'todo' | 'inProgress' | 'completed')}
                  onEditTask={openEditModal}
                  onDeleteTask={handleDeleteTask}
                />
              </motion.div>
            ))}
          </motion.div>

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

        {/* Modal de confirmación para eliminar */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDeleteTask}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      </div>
    </motion.div>
  );
};
