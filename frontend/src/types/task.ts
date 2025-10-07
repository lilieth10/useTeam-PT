export type TaskStatus = 'todo' | 'inProgress' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number | string; // Puede ser string del backend
  title: string;
  description?: string;
  createdAt: Date;
  status: TaskStatus;
  priority?: TaskPriority;
  position?: number;
  columnId?: string;
  boardId?: string;
  tags?: string[];
  dueDate?: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  priority?: TaskPriority;
  tags?: string[];
  dueDate?: Date;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  position?: number;
  columnId?: string;
  tags?: string[];
  dueDate?: Date;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
