import { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { Modal } from '@/components/kanban/Modal';
import { TaskForm } from '@/components/kanban/TaskForm';
import { Button } from '@/components/kanban/Button';
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

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Diseñar mockups de la interfaz',
    description: 'Crear los diseños iniciales para la nueva funcionalidad del dashboard',
    createdAt: new Date('2024-01-15'),
    status: 'todo',
  },
  {
    id: 2,
    title: 'Implementar autenticación',
    description: 'Configurar el sistema de login y registro de usuarios',
    createdAt: new Date('2024-01-16'),
    status: 'inProgress',
  },
  {
    id: 3,
    title: 'Configurar base de datos',
    description: 'Establecer las tablas y relaciones necesarias para el proyecto',
    createdAt: new Date('2024-01-14'),
    status: 'completed',
  },
  {
    id: 4,
    title: 'Revisar documentación técnica',
    description: 'Actualizar la documentación del API con los nuevos endpoints',
    createdAt: new Date('2024-01-17'),
    status: 'todo',
  },
  {
    id: 5,
    title: 'Testing de componentes',
    description: 'Realizar pruebas unitarias de los componentes principales',
    createdAt: new Date('2024-01-18'),
    status: 'inProgress',
  },
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    { id: 'todo' as TaskStatus, title: 'Por hacer' },
    { id: 'inProgress' as TaskStatus, title: 'En progreso' },
    { id: 'completed' as TaskStatus, title: 'Completado' },
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    const overTask = tasks.find((t) => t.id === overId);

    if (!activeTask) return;

    const activeStatus = activeTask.status;
    const overStatus = overTask?.status || (overId as TaskStatus);

    if (activeStatus === overStatus) {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      if (activeIndex !== overIndex) {
        setTasks((tasks) => arrayMove(tasks, activeIndex, overIndex));
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === overId);
    const newStatus = overTask?.status || (overId as TaskStatus);

    if (activeTask.status !== newStatus) {
      setTasks((tasks) =>
        tasks.map((task) =>
          task.id === activeId ? { ...task, status: newStatus } : task
        )
      );
    }
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.max(...tasks.map((t) => t.id), 0) + 1,
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
    setIsModalOpen(false);
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingTask) return;
    
    setTasks(
      tasks.map((task) =>
        task.id === editingTask.id
          ? { ...task, title: taskData.title, description: taskData.description }
          : task
      )
    );
    setEditingTask(undefined);
    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  const handleExportBacklog = () => {
    alert('⚠️ Función aún no implementada: Exportar backlog');
  };

  const openAddModal = () => {
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                useTeam PT
              </h1>
              <p className="text-muted-foreground mt-2">
                Tablero Kanban Colaborativo
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleExportBacklog} variant="ghost">
                📊 Exportar Backlog
              </Button>
              <Button onClick={openAddModal} variant="primary">
                + Nueva tarea
              </Button>
            </div>
          </div>
        </header>

        {/* Kanban Board */}
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
                tasks={getTasksByStatus(column.id)}
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

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingTask ? 'Editar tarea' : 'Nueva tarea'}
        >
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleEditTask : handleAddTask}
            onCancel={closeModal}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Index;
