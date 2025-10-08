import { Task } from '@/types/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string | number) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    scale: isDragging ? '1.08' : '1',
    rotate: isDragging ? '5deg' : '0deg',
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      todo: 'Por hacer',
      inProgress: 'En progreso',
      completed: 'Completado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card rounded-lg p-4 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-grab active:cursor-grabbing group border-2 border-transparent hover:border-primary/20 ${
        isDragging ? 'shadow-2xl border-primary/40 bg-card/90 backdrop-blur-sm rotate-2' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-base mb-1">{task.title}</h3>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 text-muted-foreground hover:text-primary transition-smooth"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 text-muted-foreground hover:text-destructive transition-smooth"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
        {task.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(task.createdAt)}</span>
        <span className="px-2 py-1 bg-muted rounded-md">
          {getStatusLabel(task.status)}
        </span>
      </div>
    </div>
  );
};
