import { Task } from '@/types/task';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string | number) => void;
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
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <motion.div 
        className={`bg-gradient-to-br ${getColumnColor(id)} border rounded-xl p-4 mb-4 backdrop-blur-sm`}
        whileHover={{ scale: 1.03, y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <h2 className="font-bold text-lg text-foreground flex items-center justify-between">
          {title}
          <motion.span 
            className="text-sm font-normal bg-card px-3 py-1 rounded-full shadow-sm"
            key={tasks.length}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {tasks.length}
          </motion.span>
        </h2>
      </motion.div>
      
      <motion.div
        ref={setNodeRef}
        className={`flex-1 rounded-xl border-2 border-dashed p-4 transition-all duration-300 min-h-[400px] ${
          isOver 
            ? 'border-primary bg-primary/10 shadow-lg scale-[1.02] ring-2 ring-primary/20' 
            : 'border-border bg-muted/20 hover:bg-muted/30'
        }`}
        animate={{
          scale: isOver ? 1.02 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            <AnimatePresence>
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.03,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                >
                  <TaskCard
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </motion.div>
    </motion.div>
  );
};
