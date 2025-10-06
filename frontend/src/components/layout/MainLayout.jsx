import React from 'react';
import { Header } from '../common/Header';
import { Board } from '../Board/Board';

/**
 * Layout principal de la aplicación
 * Responsabilidad: Estructurar la interfaz principal (Header + Board)
 */
export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Board />
      </main>
    </div>
  );
};
