/**
 * Servicio de WebSocket
 * Responsabilidad: Encapsular todas las operaciones de WebSocket
 * Principio: Single Responsibility - solo maneja eventos de socket
 */
export class SocketService {
  constructor(socket) {
    this.socket = socket;
  }

  // ========== MÉTODOS PARA EMITIR EVENTOS ==========

  /**
   * Emitir evento de creación de tarjeta
   * @param {Object} cardData - Datos de la tarjeta
   */
  emitCardCreate(cardData) {
    if (this.socket?.connected) {
      this.socket.emit('card:create', cardData);
    }
  }

  /**
   * Emitir evento de actualización de tarjeta
   * @param {string} cardId - ID de la tarjeta
   * @param {Object} cardData - Datos actualizados
   */
  emitCardUpdate(cardId, cardData) {
    if (this.socket?.connected) {
      this.socket.emit('card:update', { cardId, ...cardData });
    }
  }

  /**
   * Emitir evento de eliminación de tarjeta
   * @param {string} cardId - ID de la tarjeta
   */
  emitCardDelete(cardId) {
    if (this.socket?.connected) {
      this.socket.emit('card:delete', { cardId });
    }
  }

  /**
   * Emitir evento de movimiento de tarjeta
   * @param {string} cardId - ID de la tarjeta
   * @param {Object} moveData - Datos del movimiento
   */
  emitCardMove(cardId, moveData) {
    if (this.socket?.connected) {
      this.socket.emit('card:move', { cardId, ...moveData });
    }
  }

  /**
   * Emitir evento de creación de columna
   * @param {Object} columnData - Datos de la columna
   */
  emitColumnCreate(columnData) {
    if (this.socket?.connected) {
      this.socket.emit('column:create', columnData);
    }
  }

  /**
   * Emitir evento de actualización de columna
   * @param {string} columnId - ID de la columna
   * @param {Object} columnData - Datos actualizados
   */
  emitColumnUpdate(columnId, columnData) {
    if (this.socket?.connected) {
      this.socket.emit('column:update', { columnId, ...columnData });
    }
  }

  /**
   * Emitir solicitud de exportación
   * @param {Object} exportData - Datos de exportación
   */
  emitExportRequest(exportData) {
    if (this.socket?.connected) {
      this.socket.emit('export:request', exportData);
    }
  }

  // ========== MÉTODOS PARA ESCUCHAR EVENTOS ==========

  /**
   * Escuchar eventos de tarjetas creadas
   * @param {Function} callback - Función callback
   */
  onCardCreated(callback) {
    if (this.socket) {
      this.socket.on('card:created', callback);
    }
  }

  /**
   * Escuchar eventos de tarjetas actualizadas
   * @param {Function} callback - Función callback
   */
  onCardUpdated(callback) {
    if (this.socket) {
      this.socket.on('card:updated', callback);
    }
  }

  /**
   * Escuchar eventos de tarjetas eliminadas
   * @param {Function} callback - Función callback
   */
  onCardDeleted(callback) {
    if (this.socket) {
      this.socket.on('card:deleted', callback);
    }
  }

  /**
   * Escuchar eventos de tarjetas movidas
   * @param {Function} callback - Función callback
   */
  onCardMoved(callback) {
    if (this.socket) {
      this.socket.on('card:moved', callback);
    }
  }

  /**
   * Escuchar eventos de columnas creadas
   * @param {Function} callback - Función callback
   */
  onColumnCreated(callback) {
    if (this.socket) {
      this.socket.on('column:created', callback);
    }
  }

  /**
   * Escuchar eventos de columnas actualizadas
   * @param {Function} callback - Función callback
   */
  onColumnUpdated(callback) {
    if (this.socket) {
      this.socket.on('column:updated', callback);
    }
  }

  /**
   * Escuchar eventos de exportación exitosa
   * @param {Function} callback - Función callback
   */
  onExportSuccess(callback) {
    if (this.socket) {
      this.socket.on('export:success', callback);
    }
  }

  /**
   * Escuchar eventos de error en exportación
   * @param {Function} callback - Función callback
   */
  onExportError(callback) {
    if (this.socket) {
      this.socket.on('export:error', callback);
    }
  }

  /**
   * Remover todos los listeners
   */
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}
