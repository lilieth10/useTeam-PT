import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

/**
 * Hook para acceder al contexto de WebSocket
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

/**
 * Proveedor de WebSocket
 * Responsabilidad: Gestionar conexión WebSocket
 */
export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Inicializar conexión WebSocket
    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3000';
    socketRef.current = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    const socket = socketRef.current;

    // Event listeners para conexión
    socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      toast.success('Conectado al servidor');
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      toast.error('Desconectado del servidor');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
      toast.error('Error de conexión');
    });

    socket.on('connection', (data) => {
      console.log('📡 Mensaje del servidor:', data.message);
    });

    // Cleanup al desmontar
    return () => {
      socket.disconnect();
    };
  }, []);

  const value = {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
