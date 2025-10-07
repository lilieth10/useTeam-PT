export type TaskStatus = 'todo' | 'inProgress' | 'completed';

export interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  status: TaskStatus;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
