
import React, { useState } from 'react';
import { X, ShoppingCart, UserCheck, PackageCheck } from 'lucide-react';
import { Product } from '../types';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sellerId: string, quantity: number) => void;
  product: Product | null;
}

export const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose, onConfirm, product }) => {
  const [sellerId, setSellerId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId.trim()) {
      setError('A matrícula do vendedor é obrigatória');
      return;
    }
    if (quantity <= 0 || quantity > product.quantity) {
      setError(`Quantidade inválida (Máx: ${product.quantity})`);
      return;
    }
    onConfirm(sellerId, quantity);
    setSellerId('');
    setQuantity(1);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#2d0606] border-4 border-green-600 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.3)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="p-4 bg-green-600 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <ShoppingCart size={20} />
            <h2 className="font-black uppercase text-xs tracking-widest">Confirmar Venda / Saída</h2>
          </div>
          <button onClick={onClose} className="text-white hover:rotate-90 transition-transform"><X size={20} /></button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-1">Produto Selecionado</p>
            <p className="text-white font-bold text-lg uppercase">{product.name}</p>
            <p className="text-xs text-white/40">Estoque atual: {product.quantity} unidades</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <UserCheck size={14} /> Matrícula do Vendedor
              </label>
              <input 
                type="text" 
                autoFocus
                placeholder="Ex: 998877"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500 transition-all text-sm font-mono"
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <PackageCheck size={14} /> Quantidade a Retirar
              </label>
              <input 
                type="number" 
                min="1"
                max={product.quantity}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500 transition-all text-sm font-mono"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-tight text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-red-950 text-white font-black uppercase tracking-widest text-[11px] rounded-xl border-b-4 border-black/40 hover:bg-red-900 hover:border-red-800 transition-all active:translate-y-0.5 active:border-b-0"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-gradient-to-b from-green-500 to-green-600 text-white font-black uppercase tracking-widest text-[11px] rounded-xl border-b-4 border-green-800 shadow-xl transition-all hover:from-green-400 hover:to-green-500 active:translate-y-0.5 active:border-b-0"
            >
              Salvar Venda
            </button>
          </div>
        </form>

        <footer className="p-3 bg-black/20 text-center">
          <p className="text-[8px] text-green-400/50 uppercase font-black tracking-widest italic">
            Registro Obrigatório de Saída de Estoque
          </p>
        </footer>
      </div>
    </div>
  );
};
