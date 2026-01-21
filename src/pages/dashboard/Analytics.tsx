import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  trend: string;
  icon: any;
}

const MetricCard = ({ label, value, trend, icon: Icon }: MetricCardProps) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800">
        <ArrowUpRight className="w-3 h-3" /> {trend}
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</div>
    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">{label}</div>
  </div>
);

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8 font-['Inter'] animate-fade-in pb-20">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Dados de crescimento e retenção da sua tribo.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Calendar className="w-4 h-4" />
            Últimos 30 dias
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Usuários Ativos" value="1.250" trend="+15.2%" icon={Users} />
        <MetricCard label="Tempo Médio" value="12m 45s" trend="+8.4%" icon={Clock} />
        <MetricCard label="Taxa de Cliques" value="24.8%" trend="+2.1%" icon={BarChart3} />
        <MetricCard label="Conversão" value="4.2%" trend="+0.5%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfico de Barras */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-400" /> Novos Membros Diários
            </h3>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Orgânico</span>
            </div>
          </div>

          <div className="flex-1 flex items-end gap-1.5 px-2">
            {[40, 60, 45, 90, 65, 80, 50, 70, 100, 85, 95, 110, 75, 88].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div
                  className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-[2px] transition-all duration-300 group-hover:bg-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                    {Math.round(h * 2.4)} membros
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] border-t border-slate-100 dark:border-slate-800 pt-4">
            <span>01 Jan</span>
            <span>07 Jan</span>
            <span>14 Jan</span>
            <span>21 Jan</span>
            <span>28 Jan</span>
          </div>
        </div>

        {/* Lista de Populares */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" /> Mais Populares
            </h3>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-7">
            {[
              { name: 'Ebook: Mindset', views: '1,2k', color: 'bg-blue-500', pct: 85 },
              { name: 'Aula 03: Estratégia', views: '950', color: 'bg-purple-500', pct: 70 },
              { name: 'Checklist PDF', views: '820', color: 'bg-emerald-500', pct: 60 },
              { name: 'Live Mentoria', views: '450', color: 'bg-amber-500', pct: 35 },
            ].map((item, i) => (
              <div key={i} className="group cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-blue transition-colors">{item.name}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{item.views} views</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)]", item.color)}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <button className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
              Ver Relatório Completo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;