
import React from 'react';
import { Sparkles, X, ShieldCheck, Info } from 'lucide-react';

interface AIAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  advice: string;
  loading: boolean;
}

export const AIAdviceModal: React.FC<AIAdviceModalProps> = ({ isOpen, onClose, productName, advice, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-red-900 to-black border-2 border-yellow-500/50 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="p-4 bg-yellow-500 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="text-red-900 animate-pulse" size={20} />
            <h2 className="text-red-950 font-black uppercase text-sm tracking-tighter">Assistente IA PEX</h2>
          </div>
          <button onClick={onClose} className="text-red-900 hover:scale-110 transition-transform"><X size={20} /></button>
        </header>
        
        <div className="p-8">
          <h3 className="text-white font-black text-xl mb-4 uppercase tracking-tight">{productName}</h3>
          
          {loading ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-yellow-500 font-bold animate-pulse text-xs uppercase tracking-widest">Consultando diretrizes farmacêuticas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-orange-100 text-sm leading-relaxed italic">
                {advice}
              </div>
              <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <ShieldCheck className="text-blue-400 shrink-0" size={18} />
                <p className="text-[10px] text-blue-200 uppercase font-medium leading-tight">
                  Este é um conselho gerado por IA. Sempre siga as normas da Vigilância Sanitária local e as instruções da bula original.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <footer className="p-4 border-t border-white/5 bg-black/40 text-center">
          <button 
            onClick={onClose}
            className="text-yellow-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            Entendido, fechar consulta
          </button>
        </footer>
      </div>
    </div>
  );
};
