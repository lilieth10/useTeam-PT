import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Tipos para eventos WebSocket
type WebSocketEventCallback = (...args: unknown[]) => void;

/**
 * Hook personalizado para gestión de WebSocket
 * Sigue el principio de responsabilidad única (SRP)
 */
export const useWebSocket = (url?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const wsUrl = url || import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

  // Conectar al servidor WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(wsUrl, {
      transports: ['websocket'],
      upgrade: true,
    });

    socketRef.current.on('connect', () => {
      // Conexión establecida
    });

    socketRef.current.on('disconnect', () => {
      // Desconexión del servidor
    });

    socketRef.current.on('connect_error', () => {
      // Error de conexión
    });
  }, [wsUrl]);

  // Desconectar del servidor WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // Suscribirse a eventos
  const on = useCallback((event: string, callback: WebSocketEventCallback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Desuscribirse de eventos
  const off = useCallback((event: string, callback?: WebSocketEventCallback) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // Emitir eventos
  const emit = useCallback((event: string, ...args: unknown[]) => {
    if (socketRef.current) {
      socketRef.current.emit(event, ...args);
    }
  }, []);

  // Conectar automáticamente al montar
  useEffect(() => {
    connect();

    // Cleanup al desmontar
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    connect,
    disconnect,
    on,
    off,
    emit,
  };
};
