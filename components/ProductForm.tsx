
import React, { useState, useEffect } from 'react';
import { X, Save, Barcode, ClipboardList, Info, LayoutGrid, ArrowRightLeft, Edit3, Lock, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface ProductFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => void;
  onDelete?: (id: string) => void;
  initialData?: Product;
  isFastMode?: boolean;
  products?: Product[];
}

export const ProductForm: React.FC<ProductFormProps> = ({ 
  onClose, 
  onSubmit, 
  onDelete,
  initialData, 
  isFastMode = false,
  products = []
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    barcode: '', batch: '', name: '', quantity: 1, expiryDate: '', observations: '', section: '', transfer: '', registeredBy: ''
  });
  
  const [errors, setErrors] = useState<{ name?: string; expiryDate?: string }>({});
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [isNameLocked, setIsNameLocked] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [matchedCatalogId, setMatchedCatalogId] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsNameLocked(false);
    }
  }, [initialData]);

  const handleBarcodeChange = (ean: string) => {
    setFormData(prev => ({ ...prev, barcode: ean }));
    if (ean.length >= 8) {
      const catMatch = products.find(p => p.barcode === ean && p.expiryDate === '9999-12-31');
      const invMatch = products.find(p => p.barcode === ean && p.expiryDate !== '9999-12-31');
      const best = catMatch || invMatch;
      
      if (best) {
        setFormData(prev => ({ ...prev, name: best.name.toUpperCase() }));
        setIsAutoFilled(true);
        setMatchFound(true);
        if (catMatch) setMatchedCatalogId(catMatch.id);
        
        if (isFastMode) {
          setIsNameLocked(true);
        }
        
        setTimeout(() => { setIsAutoFilled(false); }, 4000);
      } else {
        setMatchFound(false);
        setIsNameLocked(false);
        setMatchedCatalogId(null);
      }
    } else {
      setMatchFound(false);
      setIsNameLocked(false);
      setMatchedCatalogId(null);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name?.trim()) newErrors.name = 'Nome é obrigatório';
    if (!isFastMode && !formData.expiryDate) newErrors.expiryDate = 'Validade é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDelete = () => {
    if (matchedCatalogId && onDelete) {
      onDelete(matchedCatalogId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
      <div className={`bg-[#2d0606] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in ${isFastMode ? 'border-blue-500/30' : 'border-orange-500/20'}`}>
        <header className={`p-6 border-b border-white/10 flex justify-between items-center ${isFastMode ? 'bg-blue-900/40' : 'bg-red-950'}`}>
          <div className="flex items-center gap-3">
            {isFastMode ? <ClipboardList className="text-blue-400" /> : <Save className="text-yellow-500" />}
            <h2 className="text-white font-bold text-xl">{isFastMode ? 'Registro de Catálogo' : (initialData ? 'Editar Produto' : 'Novo Produto')}</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X /></button>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); if (validate()) onSubmit(formData); }} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1 text-orange-500">EAN / Código de Barras</label>
            <div className="relative">
              <Barcode className="absolute left-3 top-3 text-white/30" size={18} />
              <input 
                type="text" 
                autoFocus={!initialData}
                className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white font-mono focus:border-orange-500 outline-none transition-all" 
                value={formData.barcode} 
                onChange={(e) => handleBarcodeChange(e.target.value)} 
                placeholder="0000000000000" 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase text-orange-500">Nome do Produto *</label>
                {matchFound && isFastMode && (
                  <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded tracking-widest animate-pulse">
                    JÁ CADASTRADO
                  </span>
                )}
              </div>
              {isAutoFilled && !matchFound && <span className="text-[9px] font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded animate-bounce">DADOS RECUPERADOS</span>}
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly={isNameLocked}
                className={`flex-1 bg-black/20 border rounded-lg py-2.5 px-4 text-white uppercase transition-all outline-none ${
                  isNameLocked ? 'opacity-60 cursor-not-allowed border-blue-500/30' : 
                  errors.name ? 'border-red-500' : 'border-white/10 focus:border-orange-500'
                }`} 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                placeholder="EX: DIPIRONA 500MG C/10CP (PRATI)" 
              />
              {matchFound && isFastMode && (
                <button
                  type="button"
                  onClick={() => setIsNameLocked(!isNameLocked)}
                  className={`px-4 rounded-lg flex items-center justify-center transition-all border-b-4 ${
                    isNameLocked 
                      ? 'bg-yellow-500 text-red-950 border-yellow-700 hover:bg-yellow-400' 
                      : 'bg-blue-600 text-white border-blue-800 hover:bg-blue-500'
                  }`}
                  title={isNameLocked ? "Editar Nome Cadastrado" : "Bloquear Nome"}
                >
                  {isNameLocked ? <Edit3 size={18} /> : <Lock size={18} />}
                </button>
              )}
            </div>
            {isNameLocked && (
              <p className="text-[9px] text-blue-400 font-bold mt-1 uppercase tracking-tighter flex items-center gap-1">
                <Info size={10} /> Clique no botão amarelo para corrigir o nome no catálogo.
              </p>
            )}
          </div>

          {!isFastMode && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-orange-500 uppercase">Lote</label><input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 px-4 text-white uppercase outline-none focus:border-orange-500" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value.toUpperCase()})} /></div>
                <div><label className="text-xs font-bold text-orange-500 uppercase">Matrícula</label><input type="text" maxLength={5} className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 px-4 text-white font-mono outline-none focus:border-orange-500" value={formData.registeredBy} onChange={(e) => setFormData({...formData, registeredBy: e.target.value.replace(/\D/g, '')})} /></div>
                <div><label className="text-xs font-bold text-orange-500 uppercase">Quantidade</label><input type="number" className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 px-4 text-white outline-none focus:border-orange-500" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} /></div>
                <div><label className="text-xs font-bold text-orange-500 uppercase">Validade *</label><input type="date" className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 px-4 text-white [color-scheme:dark] outline-none focus:border-orange-500" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} /></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-orange-500 flex items-center gap-2">
                    <LayoutGrid size={14} /> Seção
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm uppercase focus:border-orange-500 outline-none" 
                    value={formData.section} 
                    onChange={(e) => setFormData({...formData, section: e.target.value.toUpperCase()})}
                    placeholder="EX: A-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-orange-500 flex items-center gap-2">
                    <ArrowRightLeft size={14} /> Transferência
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm uppercase focus:border-orange-500 outline-none" 
                    value={formData.transfer} 
                    onChange={(e) => setFormData({...formData, transfer: e.target.value.toUpperCase()})}
                    placeholder="EX: FILIAL 02"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-orange-500 flex items-center gap-2">
                  <Info size={14} /> Observações Gerais
                </label>
                <textarea 
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm min-h-[80px] resize-none focus:border-orange-500 outline-none uppercase" 
                  value={formData.observations} 
                  onChange={(e) => setFormData({...formData, observations: e.target.value.toUpperCase()})}
                  placeholder="Informações adicionais como fornecedor ou detalhes do item..."
                />
              </div>
            </>
          )}

          <footer className="pt-4 flex flex-wrap gap-3">
            <button 
              type="submit" 
              className={`flex-1 font-black uppercase text-[11px] py-4 rounded-xl shadow-xl border-b-4 transition-all active:translate-y-0.5 active:border-b-0 ${
                isFastMode 
                  ? 'bg-blue-600 border-blue-800 hover:bg-blue-500' 
                  : 'bg-orange-600 border-orange-800 hover:bg-orange-500'
              } text-white min-w-[140px]`}
            >
              <Save size={18} className="inline mr-2" /> 
              {matchFound && isFastMode ? 'Atualizar Catálogo' : 'Salvar Registro'}
            </button>

            {isFastMode && matchFound && matchedCatalogId && (
              <button 
                type="button" 
                onClick={handleDelete}
                className="px-6 py-4 bg-red-600 border-red-800 border-b-4 hover:bg-red-500 text-white font-black uppercase text-[11px] rounded-xl transition-all active:translate-y-0.5 active:border-b-0 shadow-xl flex items-center gap-2"
              >
                <Trash2 size={18} />
                Excluir
              </button>
            )}

            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 bg-white/5 text-white font-black uppercase text-[11px] rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Sair
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
