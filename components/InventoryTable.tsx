
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductStatus } from '../types';
import { 
  Edit2, Trash2, ShoppingCart, AlertTriangle, ShieldCheck, 
  CheckCircle, ClipboardList, 
  Share2, LayoutGrid, ArrowRightLeft
} from 'lucide-react';

interface InventoryTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  onBulkDelete: () => void;
  onSell: (id: string) => void;
  onEdit: (product: Product) => void;
  onShare: (product: Product) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  lastAddedId?: string | null;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ 
  products, onDelete, onBulkDelete, onSell, onEdit, onShare, selectedIds, onToggleSelect, onToggleSelectAll, lastAddedId 
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const getStatusStyles = (status: ProductStatus, isCatalog: boolean) => {
    if (isCatalog) return { icon: <ClipboardList size={14} className="text-blue-400" />, container: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    switch (status) {
      case ProductStatus.EXPIRED: return { icon: <AlertTriangle size={14} className="text-red-500" />, container: "bg-red-500/10 text-red-500 border-red-500/20" };
      case ProductStatus.CRITICAL: return { icon: <ShieldCheck size={14} className="text-yellow-500" />, container: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" };
      default: return { icon: <CheckCircle size={14} className="text-green-500" />, container: "bg-green-500/10 text-green-500 border-green-500/20" };
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (products.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, products.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onToggleSelect(products[focusedIndex].id);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onEdit(products[focusedIndex]);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && containerRef.current) {
      const row = containerRef.current.querySelector(`[data-index="${focusedIndex}"]`);
      if (row) {
        row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex]);

  useEffect(() => {
    if (lastAddedId && containerRef.current) {
      const index = products.findIndex(p => p.id === lastAddedId);
      if (index !== -1) {
        setFocusedIndex(index);
        const row = containerRef.current.querySelector(`[data-id="${lastAddedId}"]`);
        if (row) {
          row.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
    }
  }, [lastAddedId, products]);

  return (
    <div 
      ref={containerRef}
      className="bg-red-950/40 border border-white/10 rounded-xl shadow-2xl overflow-hidden outline-none focus:ring-2 focus:ring-orange-500/30"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="grid"
      aria-label="Tabela de produtos e inventário"
    >
      {selectedIds.size > 0 && (
        <div className="bg-red-900/60 p-4 border-b border-white/10 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 bg-orange-500 text-red-950 px-2 py-1 rounded-lg font-black text-[10px]">
            {selectedIds.size} {selectedIds.size === 1 ? 'ITEM' : 'ITENS'}
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] text-white/40 font-bold uppercase hidden md:inline">Atalhos: Espaço (Sel) / Enter (Edit)</span>
             <button onClick={onBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest border-b-2 border-red-800 active:border-b-0 hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
               Excluir Selecionados
             </button>
          </div>
        </div>
      )}

      <div className="max-h-[600px] overflow-auto scrollbar-thin scrollbar-thumb-orange-500">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 z-20 bg-red-950 text-orange-500/50 text-[10px] uppercase font-bold tracking-widest border-b-2 border-orange-500/20">
            <tr>
              <th className="p-4 text-center w-12"><input type="checkbox" onChange={() => onToggleSelectAll(products.map(p => p.id))} checked={products.length > 0 && selectedIds.size === products.length} className="w-4 h-4 rounded border-white/10 bg-black/40 text-orange-500" /></th>
              <th className="p-4 w-[150px]">Lote / Código</th>
              <th className="p-4 min-w-[250px]">Produto / Nome</th>
              <th className="p-4 text-center w-[80px]">Qtd</th>
              <th className="p-4 w-[120px]">Validade</th>
              <th className="p-4 text-center w-[80px]">Dias</th>
              <th className="p-4 w-[140px]">Status</th>
              <th className="p-4 text-right w-[240px]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {products.map((p, index) => {
              const isCatalog = p.expiryDate === '9999-12-31';
              const statusStyle = getStatusStyles(p.status, isCatalog);
              const isFocused = index === focusedIndex;
              const isSelected = selectedIds.has(p.id);
              const isNew = p.id === lastAddedId;

              return (
                <tr 
                  key={p.id} 
                  data-index={index}
                  data-id={p.id}
                  onClick={() => setFocusedIndex(index)}
                  className={`group transition-all duration-200 cursor-pointer ${
                    isFocused 
                      ? 'bg-orange-500/20 ring-1 ring-inset ring-orange-500/50 scale-[1.01] z-10 shadow-lg' 
                      : 'hover:bg-white/[0.03]'
                  } ${isSelected ? 'bg-orange-500/5' : ''} ${isNew ? 'animate-new-row' : ''}`}
                >
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => onToggleSelect(p.id)} 
                      className="w-4 h-4 rounded border-white/10 bg-black/40 text-orange-500" 
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-orange-300/70 truncate text-[11px] leading-tight">{p.batch || (isCatalog ? 'CATÁLOGO' : 'S/ LOTE')}</span>
                      <span className="text-orange-400/30 font-mono text-[10px] leading-tight">{p.barcode || '-----------'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`font-bold uppercase leading-tight transition-colors ${isFocused ? 'text-orange-400' : 'text-white'}`}>
                      {p.name}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {p.section && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[9px] font-black text-orange-400 uppercase">
                          <LayoutGrid size={10} /> SEÇÃO: {p.section}
                        </div>
                      )}
                      {p.transfer && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-black text-blue-400 uppercase">
                          <ArrowRightLeft size={10} /> TRANSF: {p.transfer}
                        </div>
                      )}
                    </div>

                    {p.observations && <div className="text-white/40 text-xs mt-1 italic leading-tight">{p.observations}</div>}
                  </td>
                  <td className="p-4 text-center font-black text-orange-400">{isCatalog ? '-' : p.quantity}</td>
                  <td className="p-4 text-white/70 text-xs">{isCatalog ? '-' : new Date(p.expiryDate).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 text-center font-black text-base">{isCatalog ? '-' : p.daysToExpiry}</td>
                  <td className="p-4"><div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${statusStyle.container}`}>{statusStyle.icon} {isCatalog ? 'CATALOGO' : p.status.split(' ')[0]}</div></td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2.5 items-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 translate-x-4 group-hover:translate-x-0 pr-2">
                      {/* Compartilhar - Azul */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); onShare(p); }} 
                        className="p-2.5 bg-gradient-to-br from-blue-400 to-blue-700 text-white rounded-xl hover:from-blue-300 hover:to-blue-600 transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] hover:scale-110 active:scale-95 border-b-4 border-blue-900"
                        title="Compartilhar Informações"
                      >
                        <Share2 size={16} strokeWidth={2.5} />
                      </button>

                      {/* Vender - Verde (Destaque Máximo) */}
                      {!isCatalog && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSell(p.id); }} 
                          className="p-3 bg-gradient-to-br from-green-400 via-green-500 to-green-700 text-white rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_35px_rgba(34,197,94,0.9)] hover:scale-110 active:scale-95 border-b-4 border-green-900 group/btn" 
                          title="Realizar Venda"
                        >
                          <ShoppingCart size={18} strokeWidth={3} className="group-hover/btn:animate-bounce" />
                        </button>
                      )}

                      {/* Editar - Amarelo/Dourado */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(p); }} 
                        className="p-2.5 bg-gradient-to-br from-yellow-300 to-yellow-600 text-red-950 rounded-xl hover:from-yellow-200 hover:to-yellow-500 transition-all shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.7)] hover:scale-110 active:scale-95 border-b-4 border-yellow-800"
                        title="Editar Registro"
                      >
                        <Edit2 size={16} strokeWidth={2.5} />
                      </button>

                      {/* Excluir - Vermelho */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} 
                        className="p-2.5 bg-gradient-to-br from-red-400 to-red-700 text-white rounded-xl hover:from-red-300 hover:to-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.7)] hover:scale-110 active:scale-95 border-b-4 border-red-950"
                        title="Excluir Permanentemente"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-20 text-center">
            <div className="inline-flex p-4 bg-white/5 rounded-full mb-4 border border-white/10">
              <ClipboardList size={40} className="text-orange-500/20" />
            </div>
            <p className="text-orange-500/40 text-xs font-black uppercase tracking-widest">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};
