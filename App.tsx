
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { InventoryTable } from './components/InventoryTable';
import { ProductForm } from './components/ProductForm';
import { Dashboard } from './components/Dashboard';
import { ConfirmDialog, ConfirmVariant } from './components/ConfirmDialog';
import { SaleModal } from './components/SaleModal';
import { ShareProductModal } from './components/ShareProductModal';
import { Product, ProductStatus, SoldProduct } from './types';
import { calculateDaysToExpiry, getStatusFromDays } from './utils/dateUtils';
import { generatePDF, generateSalesReportPDF, generateProductCatalogPDF } from './services/pdfService';
import {
  Search, FileText, Filter, ChevronDown, ChevronUp, FilterX,
  History, ClipboardList, Barcode, PackagePlus,
  Download, Upload, ShieldCheck, Trash2, UserCheck, LayoutGrid, ArrowRightLeft, Calendar, Tag, Printer
} from 'lucide-react';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant: ConfirmVariant;
  confirmLabel: string;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pex_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [soldProducts, setSoldProducts] = useState<SoldProduct[]>(() => {
    const saved = localStorage.getItem('pex_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'CATALOG' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [transferFilter, setTransferFilter] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const [shareData, setShareData] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false, product: null
  });

  const [saleProduct, setSaleProduct] = useState<Product | null>(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  const [confirmState, setConfirmState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'danger',
    confirmLabel: 'Confirmar'
  });

  useEffect(() => {
    localStorage.setItem('pex_inventory', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pex_sales', JSON.stringify(soldProducts));
  }, [soldProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const isCatalog = p.expiryDate === '9999-12-31';
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm)) ||
        (p.batch && p.batch.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStatus = false;
      if (statusFilter === '') {
        matchesStatus = !isCatalog;
      } else if (statusFilter === 'CATALOG') {
        matchesStatus = isCatalog;
      } else {
        matchesStatus = !isCatalog && p.status === statusFilter;
      }

      const matchesStartDate = !startDate || p.expiryDate >= startDate;
      const matchesEndDate = !endDate || p.expiryDate <= endDate;
      const matchesSection = !sectionFilter || (p.section && p.section.toLowerCase().includes(sectionFilter.toLowerCase()));
      const matchesTransfer = !transferFilter || (p.transfer && p.transfer.toLowerCase().includes(transferFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate && matchesSection && matchesTransfer;
    }).sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [products, searchTerm, statusFilter, startDate, endDate, sectionFilter, transferFilter]);

  const stats = useMemo(() => ({
    total: products.filter(p => p.expiryDate !== '9999-12-31').length,
    expired: products.filter(p => p.status === ProductStatus.EXPIRED && p.expiryDate !== '9999-12-31').length,
    critical: products.filter(p => p.status === ProductStatus.CRITICAL && p.expiryDate !== '9999-12-31').length,
    safe: products.filter(p => p.status === ProductStatus.SAFE && p.expiryDate !== '9999-12-31').length,
  }), [products]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== '') count++;
    if (startDate !== '') count++;
    if (endDate !== '') count++;
    if (sellerFilter !== '') count++;
    if (sectionFilter !== '') count++;
    if (transferFilter !== '') count++;
    return count;
  }, [statusFilter, startDate, endDate, sellerFilter, sectionFilter, transferFilter]);

  const handleClearFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSellerFilter('');
    setSectionFilter('');
    setTransferFilter('');
  };

  const handleAddOrUpdateProduct = (data: Partial<Product>) => {
    const isCatalog = data.expiryDate === '9999-12-31' || isFastMode;
    const expiry = isCatalog ? '9999-12-31' : (data.expiryDate || '');
    const days = isCatalog ? 999999 : calculateDaysToExpiry(expiry);
    const status = isCatalog ? ProductStatus.SAFE : getStatusFromDays(days);

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p, ...data, expiryDate: expiry, daysToExpiry: days, status
      } as Product : p));
      setLastAddedId(editingProduct.id);
    } else {
      if (isCatalog && data.barcode) {
        const existingInCatalog = products.find(p => p.barcode === data.barcode && p.expiryDate === '9999-12-31');
        if (existingInCatalog) {
          setProducts(prev => prev.map(p => p.id === existingInCatalog.id ? { ...p, name: data.name || p.name } : p));
          setLastAddedId(existingInCatalog.id);
          setShowForm(false); setIsFastMode(false); return;
        }
      }
      const newId = Math.random().toString(36).substr(2, 9);
      const newProduct: Product = {
        id: newId,
        barcode: data.barcode || '',
        batch: data.batch || '',
        name: data.name || '',
        quantity: isCatalog ? 0 : (Number(data.quantity) || 0),
        expiryDate: expiry,
        observations: data.observations || '',
        section: data.section || '',
        transfer: data.transfer || '',
        daysToExpiry: days,
        status: status,
        registeredBy: data.registeredBy || ''
      };
      setProducts(prev => [...prev, newProduct]);
      setLastAddedId(newId);
    }
    setShowForm(false); setEditingProduct(undefined); setIsFastMode(false);

    setTimeout(() => setLastAddedId(null), 2000);
  };

  const handleDeleteCatalogProduct = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Excluir do Catálogo?',
      message: 'Deseja remover este produto permanentemente do Catálogo EAN?',
      variant: 'danger',
      confirmLabel: 'Excluir Catálogo',
      onConfirm: () => {
        setProducts(prev => prev.filter(p => p.id !== id));
        setShowForm(false);
        setIsFastMode(false);
      }
    });
  };

  const handleClearSales = () => {
    setConfirmState({
      isOpen: true,
      title: 'Limpar Dados do Inventário?',
      message: 'Isso apagará permanentemente TODO o histórico de vendas registrado no sistema para este mês. Deseja continuar?',
      variant: 'danger',
      confirmLabel: 'Limpar Agora',
      onConfirm: () => {
        setSoldProducts([]);
      }
    });
  };

  const exportBackup = () => {
    const data = JSON.stringify({ products, soldProducts });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PEX_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products) setProducts(data.products);
        if (data.soldProducts) setSoldProducts(data.soldProducts);
        alert('Backup restaurado com sucesso!');
      } catch (err) {
        alert('Falha ao importar backup. Arquivo inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateSalesReport = () => {
    let salesToReport = soldProducts;
    if (sellerFilter) {
      salesToReport = soldProducts.filter(s => s.sellerId.includes(sellerFilter));
    }
    generateSalesReportPDF(salesToReport);
  };

  return (
    <Layout alertCount={stats.total > 0 ? (stats.expired + stats.critical) : 0} hasExpired={stats.expired > 0}>
      <div className="space-y-8 animate-in">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-white font-black text-2xl uppercase tracking-tighter flex items-center gap-2">
              <ShieldCheck className="text-orange-500" /> Dashboard Operacional
            </h2>
            <p className="text-orange-500/40 text-[10px] font-bold uppercase tracking-[0.2em]">Monitoramento em Tempo Real</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportBackup} className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg border border-white/10 transition-all" title="Exportar Backup">
              <Download size={18} />
            </button>
            <label className="p-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg border border-white/10 transition-all cursor-pointer" title="Importar Backup">
              <Upload size={18} />
              <input type="file" className="hidden" accept=".json" onChange={importBackup} />
            </label>
          </div>
        </div>

        <Dashboard stats={stats} />

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => { setIsFastMode(false); setEditingProduct(undefined); setShowForm(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-red-950 font-black py-4 px-10 rounded-2xl text-xs transition-all shadow-[0_10px_30px_rgba(234,179,8,0.3)] active:translate-y-0.5 border-b-4 border-yellow-700 active:border-b-0 group"
          >
            <PackagePlus size={20} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
            <span className="uppercase tracking-[0.1em]">Novo Produto (Inventário)</span>
          </button>

          <button
            onClick={() => { setIsFastMode(true); setEditingProduct(undefined); setShowForm(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-blue-900/40 hover:bg-blue-600/20 text-blue-400 font-bold py-4 px-8 rounded-2xl text-[10px] transition-all border border-blue-500/20 hover:border-blue-500/50 shadow-lg active:scale-95 group"
          >
            <Barcode size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
            <span className="uppercase tracking-widest">Catálogo EAN</span>
          </button>
        </div>

        {/* SEARCH & FILTERS SECTION */}
        <div className="bg-gradient-to-b from-red-950 to-[#2d0606] p-1 rounded-2xl border border-orange-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="bg-red-950/40 p-5 rounded-[calc(1rem-1px)] space-y-5">
            <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-center">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="text-orange-500/40 group-focus-within:text-orange-400 transition-colors" size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar por nome, lote ou código de barras..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all group-hover:bg-black/60 shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className={`relative flex items-center gap-3 py-3 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border-b-4 active:translate-y-0.5 active:border-b-0 shadow-lg ${isFiltersExpanded || activeFiltersCount > 0
                      ? 'bg-orange-500 text-red-950 border-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                      : 'bg-red-900/40 border-red-950 text-white/70 hover:bg-red-800 hover:text-white'
                    }`}
                >
                  <Filter size={18} className={activeFiltersCount > 0 ? "animate-pulse" : ""} />
                  <span className="hidden sm:inline">Filtros Avançados</span>
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 w-5 h-5 flex items-center justify-center bg-red-950 text-white text-[10px] font-black rounded-full shadow-inner border border-white/10">
                      {activeFiltersCount}
                    </span>
                  )}
                  {isFiltersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <div className="h-12 w-px bg-white/10 hidden lg:block mx-1" />

                {/* ACTION CENTER - PROFESSIONAL RELATORIOS */}
                <div className="flex items-center gap-3">
                  {/* BOTÃO CATÁLOGO */}
                  <button
                    onClick={() => generateProductCatalogPDF(products)}
                    className="group relative flex items-center gap-2.5 py-3 px-5 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl border-b-4 border-blue-900 shadow-[0_5px_15px_rgba(30,58,138,0.4)] hover:shadow-[0_8px_25px_rgba(30,58,138,0.6)] hover:from-blue-400 hover:to-blue-600 active:translate-y-0.5 active:border-b-0 transition-all overflow-hidden"
                    title="Gerar Catálogo PDF Completo"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Catálogo</span>
                  </button>

                  {/* BOTÃO INVENTÁRIO */}
                  <button
                    onClick={() => generatePDF(filteredProducts.filter(p => p.expiryDate !== '9999-12-31'))}
                    className="group relative flex items-center gap-2.5 py-3 px-5 bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-xl border-b-4 border-slate-950 shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] hover:from-slate-500 hover:to-slate-700 active:translate-y-0.5 active:border-b-0 transition-all overflow-hidden"
                    title="Exportar Lista de Validades"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <FileText size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Inventário</span>
                  </button>

                  {/* GRUPO VENDAS */}
                  <div className="flex">
                    <button
                      onClick={handleGenerateSalesReport}
                      className="group relative flex items-center gap-2.5 py-3 px-5 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-l-xl border-b-4 border-green-900 shadow-[0_5px_15px_rgba(21,128,61,0.3)] hover:shadow-[0_8px_25px_rgba(21,128,61,0.5)] hover:from-green-400 hover:to-green-600 active:translate-y-0.5 active:border-b-0 transition-all overflow-hidden"
                      title="Relatório de Vendas do Mês"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <History size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Vendas</span>
                    </button>
                    <button
                      onClick={handleClearSales}
                      className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-r-xl border-l border-white/10 border-b-4 border-red-900 active:translate-y-0.5 active:border-b-0 transition-all shadow-lg"
                      title="Limpar Histórico"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* EXPANDED FILTER PANEL */}
            {isFiltersExpanded && (
              <div className="pt-6 border-t border-white/10 animate-in slide-in-from-top-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                  {/* GROUP 1: CATEGORY & STATUS */}
                  <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                    <h3 className="text-[10px] font-black text-orange-500/50 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Tag size={12} /> Status e Categoria
                    </h3>
                    <div className="space-y-3">
                      <div className={`transition-all rounded-xl p-0.5 ${statusFilter !== '' ? 'bg-orange-500/20 ring-1 ring-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : ''}`}>
                        <select
                          className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:border-orange-500 cursor-pointer outline-none"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as ProductStatus | 'CATALOG' | '')}
                        >
                          <option value="">Apenas Inventário Ativo</option>
                          <option value="CATALOG">📦 Apenas Catálogo de Produtos</option>
                          <option value={ProductStatus.EXPIRED}>⚠️ Somente Vencidos</option>
                          <option value={ProductStatus.CRITICAL}>🕒 Somente Críticos</option>
                          <option value={ProductStatus.SAFE}>✅ Somente Seguros</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* GROUP 2: OPERATIONAL */}
                  <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                    <h3 className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.3em] flex items-center gap-2">
                      <UserCheck size={12} /> Localização e Vendedor
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className={`transition-all rounded-xl p-0.5 ${sellerFilter !== '' ? 'bg-blue-500/20 ring-1 ring-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : ''}`}>
                        <div className="relative">
                          <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                          <input
                            type="text"
                            placeholder="Vendedor (Matrícula)"
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-blue-500 outline-none font-mono"
                            value={sellerFilter}
                            onChange={(e) => setSellerFilter(e.target.value.replace(/\D/g, ''))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`transition-all rounded-xl p-0.5 ${sectionFilter !== '' ? 'bg-blue-500/20 ring-1 ring-blue-500/40' : ''}`}>
                          <div className="relative">
                            <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                            <input
                              type="text"
                              placeholder="Seção (A1...)"
                              className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-blue-500 outline-none uppercase"
                              value={sectionFilter}
                              onChange={(e) => setSectionFilter(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className={`transition-all rounded-xl p-0.5 ${transferFilter !== '' ? 'bg-blue-500/20 ring-1 ring-blue-500/40' : ''}`}>
                          <div className="relative">
                            <ArrowRightLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                            <input
                              type="text"
                              placeholder="Transferência"
                              className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-blue-500 outline-none uppercase"
                              value={transferFilter}
                              onChange={(e) => setTransferFilter(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GROUP 3: DATE RANGE */}
                  <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                    <h3 className="text-[10px] font-black text-green-500/50 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Calendar size={12} /> Período de Validade
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`transition-all rounded-xl p-0.5 ${startDate !== '' ? 'bg-green-500/20 ring-1 ring-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : ''}`}>
                        <div className="relative">
                          <input
                            type="date"
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-3 text-white text-xs [color-scheme:dark] outline-none"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className={`transition-all rounded-xl p-0.5 ${endDate !== '' ? 'bg-green-500/20 ring-1 ring-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : ''}`}>
                        <div className="relative">
                          <input
                            type="date"
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-3 text-white text-xs [color-scheme:dark] outline-none"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FILTER ACTIONS FOOTER */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                      {filteredProducts.length} itens correspondentes
                    </span>
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="flex items-center gap-2 py-2 px-6 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      <FilterX size={16} /> Limpar Filtros
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <InventoryTable
          products={filteredProducts}
          onDelete={(id) => setConfirmState({ isOpen: true, title: 'Excluir?', message: 'Deseja remover este item?', variant: 'danger', confirmLabel: 'Excluir', onConfirm: () => setProducts(prev => prev.filter(p => p.id !== id)) })}
          onBulkDelete={() => setConfirmState({ isOpen: true, title: 'Excluir Seleção?', message: `Remover ${selectedIds.size} itens?`, variant: 'danger', confirmLabel: 'Excluir Tudo', onConfirm: () => { setProducts(prev => prev.filter(p => !selectedIds.has(p.id))); setSelectedIds(new Set()); } })}
          onSell={(id) => { const p = products.find(prod => prod.id === id); if (p) { setSaleProduct(p); setIsSaleModalOpen(true); } }}
          onEdit={(p) => { setIsFastMode(p.expiryDate === '9999-12-31'); setEditingProduct(p); setShowForm(true); }}
          onShare={(p) => setShareData({ isOpen: true, product: p })}
          selectedIds={selectedIds}
          onToggleSelect={(id) => setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
          onToggleSelectAll={(ids) => setSelectedIds(prev => ids.length === prev.size ? new Set() : new Set(ids))}
          lastAddedId={lastAddedId}
        />
      </div>

      {showForm && (
        <ProductForm
          onClose={() => { setShowForm(false); setIsFastMode(false); setEditingProduct(undefined); }}
          onSubmit={handleAddOrUpdateProduct}
          onDelete={handleDeleteCatalogProduct}
          initialData={editingProduct}
          isFastMode={isFastMode}
          products={products}
        />
      )}

      <SaleModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} onConfirm={(sId, qty) => {
        if (!saleProduct) return;
        setProducts(prev => prev.map(p => p.id === saleProduct.id ? { ...p, quantity: p.quantity - qty } : p).filter(p => p.quantity > 0 || p.expiryDate === '9999-12-31'));
        setSoldProducts(prev => [{ id: Math.random().toString(36).substr(2, 9), productId: saleProduct.id, productName: saleProduct.name, quantity: qty, sellerId: sId, saleDate: new Date().toISOString(), batch: saleProduct.batch }, ...prev]);
        setIsSaleModalOpen(false);
      }} product={saleProduct} />

      <ShareProductModal {...shareData} onClose={() => setShareData(prev => ({ ...prev, isOpen: false }))} />
      <ConfirmDialog {...confirmState} onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))} />
    </Layout>
  );
};

export default App;
