
import React from 'react';
import { AlertCircle, Clock, CheckCircle2, Package } from 'lucide-react';
import { InventoryStats } from '../types';

interface DashboardProps {
  stats: InventoryStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="region" aria-label="Resumo do Inventário">
      <StatCard 
        label="Total Ativos" 
        value={stats.total} 
        icon={<Package size={28} />} 
        colorClass="border-orange-500/50 bg-orange-950/60"
        accentColor="text-orange-500"
        valueColor="text-orange-400"
        indicatorColor="bg-orange-500"
      />
      <StatCard 
        label="Vencidos" 
        value={stats.expired} 
        icon={<AlertCircle size={28} className={stats.expired > 0 ? "animate-flash-icon" : ""} />} 
        colorClass={`bg-red-900/40 ${stats.expired > 0 ? "animate-glow-red border-4" : "border-red-500/80"}`}
        accentColor="text-red-500"
        valueColor="text-red-500"
        indicatorColor="bg-red-600"
      />
      <StatCard 
        label="Críticos" 
        value={stats.critical} 
        icon={<Clock size={28} />} 
        colorClass={`bg-yellow-900/30 ${stats.critical > 0 ? "animate-glow-yellow border-4" : "border-yellow-500/80"}`}
        accentColor="text-yellow-400"
        valueColor="text-yellow-400"
        indicatorColor="bg-yellow-500"
      />
      <StatCard 
        label="Seguros" 
        value={stats.safe} 
        icon={<CheckCircle2 size={28} />} 
        colorClass="border-green-500/50 bg-green-900/20"
        accentColor="text-green-400"
        valueColor="text-green-400"
        indicatorColor="bg-green-500"
      />
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  accentColor: string;
  valueColor: string;
  indicatorColor: string;
}> = ({ label, value, icon, colorClass, accentColor, valueColor, indicatorColor }) => {
  return (
    <article 
      className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 ${colorClass} shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md`}
    >
      {/* Faixa lateral de cor sólida para reforço visual */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${indicatorColor}`} />
      
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em]">
            {label}
          </span>
          <div className={`${accentColor} p-2 bg-black/40 rounded-xl border border-white/10 shadow-inner`}>
            {icon}
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <h3 className={`text-5xl font-black ${valueColor} tracking-tight drop-shadow-md`}>
            {value}
          </h3>
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">itens</span>
        </div>
      </div>
      
      {/* Elemento decorativo de fundo para profundidade */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] ${accentColor}`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 100 }) : null}
      </div>
    </article>
  );
};
