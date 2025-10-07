import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

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
      console.log('Connected to WebSocket server');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
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
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Desuscribirse de eventos
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // Emitir eventos
  const emit = useCallback((event: string, ...args: any[]) => {
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
