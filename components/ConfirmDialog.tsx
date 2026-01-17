
import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, Trash2, ShoppingCart, HelpCircle } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: ConfirmVariant;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'danger'
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmButtonRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 size={32} className="text-red-500" />,
          button: 'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border-red-800',
          border: 'border-red-600'
        };
      case 'warning':
        return {
          icon: <ShoppingCart size={32} className="text-yellow-500" />,
          button: 'bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 border-green-800',
          border: 'border-green-600'
        };
      default:
        return {
          icon: <HelpCircle size={32} className="text-orange-500" />,
          button: 'bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 border-orange-800',
          border: 'border-orange-600'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div 
        className={`bg-red-900 border-4 ${styles.border} rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-black/30 rounded-full flex items-center justify-center mb-4 border-2 border-white/10">
            {styles.icon}
          </div>
          
          <h2 id="confirm-title" className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
            {title}
          </h2>
          
          <p id="confirm-message" className="text-orange-200/80 font-medium text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-red-950 text-white font-black uppercase tracking-widest text-[11px] rounded-xl border-b-4 border-black/40 hover:bg-red-900 hover:border-red-800 transition-all active:translate-y-0.5 active:border-b-0"
            >
              Cancelar
            </button>
            <button
              ref={confirmButtonRef}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-3.5 ${styles.button} text-white font-black uppercase tracking-widest text-[11px] rounded-xl border-b-4 shadow-xl transition-all active:translate-y-0.5 active:border-b-0`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
