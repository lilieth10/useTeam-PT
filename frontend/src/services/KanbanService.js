/**
 * Servicio de Kanban
 * Responsabilidad: Gestionar datos del tablero Kanban
 * Principio: Single Responsibility - solo maneja lógica de datos de Kanban
 */
export class KanbanService {
  /**
   * Cargar datos iniciales del tablero
   * @param {Function} dispatch - Función dispatch del reducer
   */
  static loadInitialData(dispatch) {
    // Datos mock para desarrollo - TODO: Conectar con API real
    const mockBoards = [
      {
        _id: '1',
        title: 'Mi Tablero Kanban',
        description: 'Tablero de ejemplo para la prueba técnica',
        isActive: true,
        position: 0,
        createdAt: new Date().toISOString()
      }
    ];

    const mockColumns = [
      { _id: 'col1', title: 'Backlog', boardId: '1', position: 0, color: '#e5e7eb' },
      { _id: 'col2', title: 'En Progreso', boardId: '1', position: 1, color: '#fef3c7' },
      { _id: 'col3', title: 'Completado', boardId: '1', position: 2, color: '#d1fae5' }
    ];

    const mockCards = [
      {
        _id: 'card1',
        title: 'Configurar proyecto',
        description: 'Configurar la estructura inicial del proyecto',
        boardId: '1',
        columnId: 'col3',
        position: 0,
        priority: 'high',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'card2', 
        title: 'Implementar drag & drop',
        description: 'Agregar funcionalidad de arrastrar y soltar tarjetas',
        boardId: '1',
        columnId: 'col2',
        position: 0,
        priority: 'medium',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'card3',
        title: 'Conectar con N8N',
        description: 'Integrar la funcionalidad de exportación con N8N',
        boardId: '1',
        columnId: 'col1',
        position: 0,
        priority: 'low',
        createdAt: new Date().toISOString()
      }
    ];

    // Dispatch de datos iniciales
    dispatch({ type: 'SET_BOARDS', payload: mockBoards });
    dispatch({ type: 'SET_COLUMNS', payload: mockColumns });
    dispatch({ type: 'SET_CARDS', payload: mockCards });
    dispatch({ type: 'SET_ACTIVE_BOARD', payload: '1' });
  }

  /**
   * Exportar backlog del tablero
   * @param {string} email - Email de destino
   * @param {string} boardId - ID del tablero
   * @param {Function} dispatch - Función dispatch del reducer
   * @param {SocketService} socketService - Servicio de WebSocket
   */
  static async exportBacklog(email, boardId, dispatch, socketService) {
    try {
      dispatch({ type: 'SET_EXPORTING', payload: true });
      
      // Emitir solicitud de exportación via WebSocket
      if (socketService) {
        socketService.emitExportRequest({ email, boardId });
      }
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error exporting backlog:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_EXPORTING', payload: false });
    }
  }

  /**
   * Crear nueva tarjeta
   * @param {Object} cardData - Datos de la tarjeta
   * @param {Function} dispatch - Función dispatch del reducer
   * @param {SocketService} socketService - Servicio de WebSocket
   */
  static createCard(cardData, dispatch, socketService) {
    const newCard = {
      _id: `card_${Date.now()}`,
      ...cardData,
      createdAt: new Date().toISOString()
    };

    // Actualizar estado local
    dispatch({ type: 'ADD_CARD', payload: newCard });

    // Emitir evento WebSocket
    if (socketService) {
      socketService.emitCardCreate(newCard);
    }

    return newCard;
  }

  /**
   * Mover tarjeta entre columnas
   * @param {string} cardId - ID de la tarjeta
   * @param {string} newColumnId - ID de la nueva columna
   * @param {number} newPosition - Nueva posición
   * @param {Function} dispatch - Función dispatch del reducer
   * @param {SocketService} socketService - Servicio de WebSocket
   */
  static moveCard(cardId, newColumnId, newPosition, dispatch, socketService) {
    const moveData = {
      cardId,
      newColumnId,
      newPosition,
      movedAt: new Date().toISOString()
    };

    // Actualizar estado local
    dispatch({ type: 'MOVE_CARD', payload: moveData });

    // Emitir evento WebSocket
    if (socketService) {
      socketService.emitCardMove(cardId, { newColumnId, newPosition });
    }

    return moveData;
  }
}
