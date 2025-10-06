import React from 'react';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { KanbanProvider } from './context/KanbanContext';
import { Board } from './components/Board/Board';
import { Header } from './components/common/Header';

/**
 * Componente raíz de la aplicación
 * Responsabilidad: Configurar providers y layout principal
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SocketProvider>
        <KanbanProvider>
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Board />
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </KanbanProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
