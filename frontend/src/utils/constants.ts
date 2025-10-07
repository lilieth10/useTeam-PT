// API Endpoints
export const API_ENDPOINTS = {
  BOARDS: '/boards',
  CARDS: '/cards',
  COLUMNS: '/columns',
  EXPORT: '/export',
} as const;

// Task Status
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];

// Column Colors
export const COLUMN_COLORS = {
  [TASK_STATUS.TODO]: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
  [TASK_STATUS.IN_PROGRESS]: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
  [TASK_STATUS.COMPLETED]: 'from-green-500/10 to-green-500/5 border-green-500/20',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DRAG_ACTIVATION_DISTANCE: 8,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  COLUMN_MIN_HEIGHT: 400,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'useteam_preferences',
  BOARD_STATE: 'useteam_board_state',
  THEME: 'useteam_theme',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  TASK_PRIORITY: TASK_PRIORITY.MEDIUM,
  COLUMN_COLOR: '#e5e7eb',
  BOARD_TITLE: 'Tablero Principal',
  EXPORT_EMAIL: 'admin@useteam.io',
} as const;
