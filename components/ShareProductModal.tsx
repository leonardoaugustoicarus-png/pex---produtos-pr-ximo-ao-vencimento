
import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { Product } from '../types';

interface ShareProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({ isOpen, onClose, product }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const shareText = `Produto: ${product.name}
Lote: ${product.batch || 'N/A'}
Código: ${product.barcode}
Validade: ${new Date(product.expiryDate).toLocaleDateString('pt-BR')}
Status: ${product.status}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-red-900 border-4 border-orange-500 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="p-4 bg-orange-600 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-white" />
            <h2 className="text-white font-black uppercase text-xs tracking-widest">Compartilhar Produto</h2>
          </div>
          <button onClick={onClose} className="text-white hover:rotate-90 transition-transform"><X size={20} /></button>
        </header>
        
        <div className="p-6 space-y-4">
          <div className="bg-black/40 border border-orange-500/30 rounded-xl p-4 font-mono text-xs text-yellow-100 whitespace-pre-wrap leading-relaxed">
            {shareText}
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-2 border-b-4 shadow-xl active:translate-y-0.5 active:border-b-0 ${
              copied 
                ? 'bg-gradient-to-b from-green-500 to-green-600 border-green-800 text-white' 
                : 'bg-gradient-to-b from-yellow-400 to-yellow-500 border-yellow-700 text-red-950 hover:from-yellow-300 hover:to-yellow-400'
            }`}
          >
            {copied ? (
              <>
                <Check size={18} strokeWidth={3} />
                Copiado com Sucesso!
              </>
            ) : (
              <>
                <Copy size={18} strokeWidth={3} />
                Copiar Informações
              </>
            )}
          </button>
        </div>

        <footer className="p-3 bg-black/20 text-center">
          <p className="text-[8px] text-orange-400/50 uppercase font-black tracking-widest">
            PEX - Controle de Validade
          </p>
        </footer>
      </div>
    </div>
  );
};
