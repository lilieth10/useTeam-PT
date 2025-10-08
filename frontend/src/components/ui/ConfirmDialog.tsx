import React from 'react';
import { Button } from './button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * Modal de confirmación elegante y responsive
 * Sigue principios SOLID - Responsabilidad única
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50',
    info: 'border-blue-200 bg-blue-50'
  };

  const iconStyles = {
    danger: '🗑️',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const buttonVariant = {
    danger: 'destructive',
    warning: 'default',
    info: 'default'
  } as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className={`p-6 border-b ${variantStyles[variant]} rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{iconStyles[variant]}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            variant={buttonVariant[variant]}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
