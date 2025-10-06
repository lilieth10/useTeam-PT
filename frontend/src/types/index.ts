/**
 * Tipos principales para la aplicación Kanban
 */

// Prioridades de tarjetas
export type Priority = 'low' | 'medium' | 'high';

// Estado de carga
export type LoadingState = boolean;

// Interfaz para Board (Tablero)
export interface Board {
  _id: string;
  title: string;
  description?: string;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt?: string;
}

// Interfaz para Column (Columna)
export interface Column {
  _id: string;
  title: string;
  boardId: string;
  position: number;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para Card (Tarjeta)
export interface Card {
  _id: string;
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  position: number;
  priority: Priority;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: string;
  tags?: string[];
}

// Estado del contexto Kanban
export interface KanbanState {
  boards: Board[];
  columns: Column[];
  cards: Card[];
  activeBoardId: string | null;
  loading: LoadingState;
  exporting: LoadingState;
  error: string | null;
}

// Acciones del reducer
export type KanbanAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_EXPORTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'SET_ACTIVE_BOARD'; payload: string }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: Board }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'SET_COLUMNS'; payload: Column[] }
  | { type: 'ADD_COLUMN'; payload: Column }
  | { type: 'UPDATE_COLUMN'; payload: Column }
  | { type: 'DELETE_COLUMN'; payload: string }
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'MOVE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'CARD_CREATED'; payload: Card }
  | { type: 'CARD_UPDATED'; payload: Card }
  | { type: 'CARD_DELETED'; payload: string }
  | { type: 'CARD_MOVED'; payload: Card }
  | { type: 'COLUMN_CREATED'; payload: Column }
  | { type: 'COLUMN_UPDATED'; payload: Column };

// Props para componentes
export interface BoardProps {
  board?: Board;
}

export interface ColumnProps {
  column: Column;
  cards: Card[];
}

export interface CardProps {
  card: Card;
  onMove?: (cardId: string, newColumnId: string) => void;
  onUpdate?: (card: Card) => void;
  onDelete?: (cardId: string) => void;
}

// WebSocket Events
export interface SocketEvents {
  'card:created': Card;
  'card:updated': Card;
  'card:deleted': string;
  'card:moved': Card;
  'column:created': Column;
  'column:updated': Column;
  'export:success': { totalCards: number; message: string };
  'export:error': { message: string };
}

// Export Modal
export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (email: string) => Promise<void>;
  isExporting: boolean;
}
