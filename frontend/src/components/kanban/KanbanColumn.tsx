import { Task } from '@/types/task';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

export const KanbanColumn = ({ id, title, tasks, onEditTask, onDeleteTask }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getColumnColor = (columnId: string) => {
    const colors = {
      todo: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
      inProgress: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
      completed: 'from-green-500/10 to-green-500/5 border-green-500/20',
    };
    return colors[columnId as keyof typeof colors] || 'from-muted to-background';
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`bg-gradient-to-br ${getColumnColor(id)} border rounded-xl p-4 mb-4`}>
        <h2 className="font-bold text-lg text-foreground flex items-center justify-between">
          {title}
          <span className="text-sm font-normal bg-card px-2 py-1 rounded-md">
            {tasks.length}
          </span>
        </h2>
      </div>
      
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl border-2 border-dashed p-4 transition-smooth min-h-[400px] ${
          isOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
