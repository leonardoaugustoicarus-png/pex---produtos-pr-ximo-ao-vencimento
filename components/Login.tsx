
import React, { useState, useEffect } from 'react';
import { Pill, ShieldCheck, Lock, User, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulação de delay para efeito visual elegante
    setTimeout(() => {
      if (username.toUpperCase() === 'CATANDUVA' && password.toUpperCase() === 'LOJA 04') {
        onLoginSuccess();
      } else {
        setError('CREDENCIAL INVÁLIDA OU ACESSO NEGADO');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#450a0a] overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />

      <div className="w-full max-w-md px-6 animate-in zoom-in-95 duration-500">
        <div className="bg-red-950/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.7)] p-10 relative overflow-hidden">
          {/* Faixa lateral decorativa */}
          <div className="absolute top-0 left-0 w-2 h-full bg-orange-500" />
          
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] transform hover:rotate-6 transition-transform">
                <Pill className="text-red-950" size={42} strokeWidth={2.5} />
              </div>
            </div>

            <div>
              <h1 className="text-white font-black text-4xl tracking-tighter uppercase leading-none italic">
                PEX<span className="text-orange-500">.</span>PRO
              </h1>
              <p className="text-orange-500/40 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">
                Autenticação de Segurança
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 pt-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest pl-1">Usuário / Login</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input 
                    type="text"
                    required
                    autoFocus
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all uppercase placeholder:text-white/10"
                    placeholder="DIGITE O LOGIN"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest pl-1">Chave de Acesso</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input 
                    type="password"
                    required
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all uppercase placeholder:text-white/10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                  <AlertCircle size={14} className="text-red-500" />
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full group relative flex items-center justify-center gap-3 py-4 bg-gradient-to-br from-orange-500 to-orange-700 text-red-950 font-black rounded-2xl border-b-4 border-orange-900 shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_15px_40px_rgba(249,115,22,0.5)] active:translate-y-1 active:border-b-0 transition-all overflow-hidden disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-red-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    <span className="uppercase tracking-widest text-[11px]">Entrar no Sistema</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-white/20 text-[9px] font-bold uppercase tracking-widest">
                <ShieldCheck size={14} />
                Sistema Criptografado
              </div>
              <div className="bg-black/30 px-6 py-2 rounded-xl border border-white/5 h-12 flex items-center justify-center">
                <img 
                   src="https://i.postimg.cc/rsmjz3j9/124.png" 
                   alt="Wangler Logo" 
                   className="h-full object-contain filter grayscale opacity-20 hover:opacity-50 transition-opacity" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
