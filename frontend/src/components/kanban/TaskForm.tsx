import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status: task?.status || 'todo',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ingresa el título de la tarea"
        required
        autoFocus
      />
      
      <Textarea
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ingresa una descripción detallada"
        rows={4}
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {task ? 'Guardar cambios' : 'Crear tarea'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
