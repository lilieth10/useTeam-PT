import { useExport } from '@/hooks/useExport';
import { Button } from '@/components/kanban/Button';

/**
 * Componente Header del tablero Kanban
 * Sigue el principio de responsabilidad única (SRP)
 * Solo maneja la lógica del header y acciones principales
 */
interface KanbanHeaderProps {
  onCreateTask: () => void;
}

export const KanbanHeader = ({ onCreateTask }: KanbanHeaderProps) => {
  const { isExporting, exportBacklog } = useExport();

  const handleExport = async () => {
    try {
      await exportBacklog({
        fields: ['id', 'title', 'description', 'column', 'createdAt', 'priority'],
      });
    } catch (error) {
      console.error('Error exporting backlog:', error);
    }
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            useTeam PT
          </h1>
          <p className="text-muted-foreground mt-2">
            Tablero Kanban Colaborativo
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            variant="ghost"
            disabled={isExporting}
          >
            {isExporting ? '⏳ Exportando...' : '📊 Exportar Backlog'}
          </Button>
          <Button onClick={onCreateTask} variant="primary">
            + Nueva tarea
          </Button>
        </div>
      </div>
    </header>
  );
};
