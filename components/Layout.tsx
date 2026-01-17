
import React, { useState, useEffect, useRef } from 'react';
import { Pill, AlertTriangle, X, Monitor, Settings, Maximize2, ShieldCheck, Database, Minus, EyeOff, Maximize, Ghost } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  alertCount?: number;
  hasExpired?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, alertCount = 0, hasExpired = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const LOGO_URL = "https://i.postimg.cc/rsmjz3j9/124.png";

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Erro ao entrar em tela cheia: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsMenuOpen(false);
  };

  if (isHidden) {
    return (
      <button 
        onClick={() => setIsHidden(false)}
        className="fixed bottom-4 right-4 z-[200] p-3 bg-red-950/20 hover:bg-red-600/40 text-red-500/20 hover:text-red-500 rounded-full border border-red-500/10 transition-all backdrop-blur-sm group animate-pulse"
        title="Restaurar Interface PEX"
      >
        <Ghost size={20} className="group-hover:scale-125 transition-transform" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[150] animate-in zoom-in-95">
        <div 
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-4 p-4 rounded-2xl border-2 shadow-2xl cursor-pointer hover:scale-105 transition-all bg-red-950 ${
            alertCount > 0 
              ? (hasExpired ? 'border-red-500 animate-glow-red' : 'border-yellow-500 animate-glow-yellow') 
              : 'border-orange-500/30'
          }`}
        >
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
            <Pill className="text-red-950" size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col pr-4">
            <span className="text-white font-black text-[10px] uppercase tracking-widest">PEX Ativo</span>
            <span className={`text-[9px] font-bold ${alertCount > 0 ? (hasExpired ? 'text-red-400' : 'text-yellow-400') : 'text-orange-400/60'}`}>
              {alertCount > 0 ? `${alertCount} ALERTAS` : 'SISTEMA SEGURO'}
            </span>
          </div>
          <Maximize size={16} className="text-orange-500 ml-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#450a0a] flex flex-col selection:bg-orange-500 selection:text-white transition-opacity duration-300">
      <header className="sticky top-0 z-50 bg-red-950 border-b-2 border-orange-600/20 px-6 py-3 shadow-xl">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg">
              <Pill className="text-red-950" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-xl tracking-tight leading-none">PEX</h1>
              <p className="text-orange-400/60 text-[9px] uppercase font-bold tracking-widest mt-1">SISTEMA DE GESTÃO</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {alertCount > 0 && (
              <div 
                className={`hidden md:flex items-center gap-3 px-4 py-1.5 rounded-xl border-2 transition-all duration-500 animate-alert-pop ${
                  hasExpired 
                    ? 'bg-red-600/10 border-red-500/40 text-red-100 animate-glow-red' 
                    : 'bg-yellow-500/5 border-yellow-500/30 text-yellow-400 animate-glow-yellow'
                }`}
              >
                <div className={`${hasExpired ? 'animate-flash-icon' : 'text-yellow-500'}`}>
                  <AlertTriangle size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[8px] font-black uppercase tracking-[0.2em] leading-none ${hasExpired ? 'text-red-400' : 'text-yellow-500/70'}`}>
                    {hasExpired ? 'Atenção Crítica' : 'Alerta'}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-tight mt-0.5 ${hasExpired ? 'text-white' : 'text-yellow-400'}`}>
                    {alertCount} {hasExpired ? 'VENCIDOS' : 'PRÓX. VENC.'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex items-center select-none scale-[0.6] sm:scale-80 lg:scale-90 origin-right transition-all">
              <div className="bg-[#e20613] rounded-xl p-2 shadow-2xl mr-2 flex items-center justify-center border border-white/10 w-11 h-11">
                <div className="relative w-7 h-7">
                  <div className="absolute top-1/2 left-0 w-full h-2.5 bg-[#ffed00] -translate-y-1/2 rounded-sm shadow-sm"></div>
                  <div className="absolute top-0 left-1/2 h-full w-2.5 bg-[#ffed00] -translate-x-1/2 rounded-sm shadow-sm"></div>
                </div>
              </div>
              <div className="bg-[#e20613] rounded-xl px-4 py-1.5 border border-white/10 shadow-2xl flex flex-col items-start justify-center leading-none min-w-[140px]">
                <span className="text-[#ffed00] font-black text-[9px] uppercase tracking-tighter mb-0.5">Drogaria Total</span>
                <span className="text-white font-black italic text-3xl -mt-1.5 tracking-tighter drop-shadow-md">Popular</span>
              </div>
            </div>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2.5 rounded-xl border transition-all shadow-lg active:scale-95 ${
                  isMenuOpen 
                    ? 'bg-orange-500 text-red-950 border-orange-600' 
                    : 'bg-red-900/40 text-orange-400 border-orange-500/20 hover:bg-red-800 hover:text-white'
                }`}
                title="Configurações e Interface"
              >
                <Settings size={22} className={isMenuOpen ? 'animate-spin-slow' : ''} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-red-950 border-2 border-orange-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-top-2 z-[100] backdrop-blur-xl">
                  <div className="p-3 border-b border-white/5 bg-white/5">
                    <span className="text-[9px] font-black text-orange-500/50 uppercase tracking-[0.3em]">Opções de Interface</span>
                  </div>
                  
                  <button 
                    onClick={toggleFullscreen}
                    className="w-full flex items-center gap-3 px-4 py-4 text-white hover:bg-white/10 transition-colors text-xs font-black uppercase tracking-widest border-b border-white/5 group"
                  >
                    <Maximize2 size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                    {isFullscreen ? 'Sair da Tela Cheia' : 'Entrar em Tela Cheia'}
                  </button>

                  <button 
                    onClick={() => { setIsMinimized(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-4 text-white hover:bg-white/10 transition-colors text-xs font-black uppercase tracking-widest border-b border-white/5 group"
                  >
                    <Minus size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
                    Minimizar Janela
                  </button>

                  <button 
                    onClick={() => { setIsHidden(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-4 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-black uppercase tracking-widest group"
                  >
                    <EyeOff size={18} className="group-hover:scale-110 transition-transform" />
                    Ocultar Toda Interface
                  </button>
                  
                  <div className="p-3 bg-black/40 text-center">
                    <p className="text-[8px] text-white/20 uppercase font-bold tracking-tighter">Versão 3.5.0 Premium Edition</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1300px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>

      <footer className="bg-red-950 border-t border-orange-600/10 py-6 px-6">
        <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-orange-500/40 order-2 md:order-1">
            <Monitor size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Terminal Ativo</span>
          </div>
          
          <div className="flex items-center gap-4 group order-1 md:order-2">
             <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">Desenvolvido por</div>
             <div className="flex items-center bg-black/40 px-6 py-2 rounded-2xl border border-white/10 group-hover:border-orange-500/40 transition-all shadow-2xl h-16 justify-center">
                <img 
                   src={LOGO_URL} 
                   alt="Wangler Logo" 
                   className="h-full w-full object-contain filter brightness-110 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform scale-125" 
                />
             </div>
          </div>

          <div className="flex items-center gap-2 text-green-500 order-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">OK</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
