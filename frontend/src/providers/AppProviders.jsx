import React from 'react';
import { SocketProvider } from '../context/SocketContext';
import { KanbanProvider } from '../context/KanbanContext';

/**
 * Proveedor centralizado de todos los contexts
 * Responsabilidad: Organizar la jerarquía de providers siguiendo Dependency Inversion
 * SocketProvider -> KanbanProvider (KanbanProvider depende de SocketProvider)
 */
export const AppProviders = ({ children }) => {
  return (
    <SocketProvider>
      <KanbanProvider>
        {children}
      </KanbanProvider>
    </SocketProvider>
  );
};
