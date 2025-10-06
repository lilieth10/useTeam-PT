import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
);

// ========== BOARDS API ==========
export const getBoards = () => api.get('/boards');
export const getBoard = (id) => api.get(`/boards/${id}`);
export const createBoard = (boardData) => api.post('/boards', boardData);
export const updateBoard = (id, boardData) => api.put(`/boards/${id}`, boardData);
export const deleteBoard = (id) => api.delete(`/boards/${id}`);

// ========== COLUMNS API ==========
export const getColumns = () => api.get('/columns');
export const getColumn = (id) => api.get(`/columns/${id}`);
export const createColumn = (columnData) => api.post('/columns', columnData);
export const updateColumn = (id, columnData) => api.put(`/columns/${id}`, columnData);
export const deleteColumn = (id) => api.delete(`/columns/${id}`);

// ========== CARDS API ==========
export const getCards = () => api.get('/cards');
export const getCard = (id) => api.get(`/cards/${id}`);
export const createCard = (cardData) => api.post('/cards', cardData);
export const updateCard = (id, cardData) => api.put(`/cards/${id}`, cardData);
export const moveCard = (id, moveData) => api.patch(`/cards/${id}/move`, moveData);
export const deleteCard = (id) => api.delete(`/cards/${id}`);

// ========== EXPORT API ==========
export const exportBacklog = (exportData) => api.post('/export/backlog', exportData);

export default api;
