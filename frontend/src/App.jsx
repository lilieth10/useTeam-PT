import React from 'react';
import { Toaster } from 'react-hot-toast';
import { KanbanProvider } from './context/KanbanContext';
import Board from './components/Board/Board';
import Header from './components/common/Header';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
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
    </div>
  );
}

export default App;
