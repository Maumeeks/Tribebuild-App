
import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, ArrowUpRight } from 'lucide-react';

const MetricCard = ({ label, value, trend, icon: Icon }: any) => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
        <ArrowUpRight className="w-4 h-4" /> {trend}
      </div>
    </div>
    <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{value}</div>
    <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">{label}</div>
  </div>
);

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-white">Analytics</h1>
        <p className="text-slate-500">Métricas de crescimento e engajamento</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Usuários Ativos" value="1.250" trend="+15.2%" icon={Users} />
        <MetricCard label="Tempo Médio" value="12m" trend="+8.4%" icon={Clock} />
        <MetricCard label="Taxa de Cliques" value="24.8%" trend="+2.1%" icon={BarChart3} />
        <MetricCard label="Conversão" value="4.2%" trend="+0.5%" icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm h-96 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Novos Membros por Dia</h3>
            <div className="flex-1 flex items-end gap-2">
               {[40, 60, 45, 90, 65, 80, 50, 70, 100, 85, 95, 110].map((h, i) => (
                 <div key={i} className="flex-1 bg-blue-100 rounded-t-lg group relative hover:bg-blue-500 transition-colors cursor-pointer" style={{ height: `${h}%` }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h * 2}
                    </div>
                 </div>
               ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
               <span>Jan</span>
               <span>Fev</span>
               <span>Mar</span>
               <span>Abr</span>
               <span>Mai</span>
               <span>Jun</span>
               <span>Jul</span>
               <span>Ago</span>
               <span>Set</span>
               <span>Out</span>
               <span>Nov</span>
               <span>Dez</span>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Conteúdos mais Populares</h3>
            <div className="space-y-6">
               {[
                 { name: 'Ebook: Alta Performance', views: '1,2k', color: 'bg-blue-500', pct: 85 },
                 { name: 'Aula: Mindset Vencedor', views: '950', color: 'bg-purple-500', pct: 70 },
                 { name: 'Checklist Diário', views: '820', color: 'bg-green-500', pct: 60 },
                 { name: 'Webinar de Boas-vindas', views: '450', color: 'bg-orange-500', pct: 35 },
               ].map((item, i) => (
                 <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white dark:text-white">{item.name}</span>
                      <span className="text-sm font-bold text-slate-500">{item.views} views</span>
                    </div>
                    <div className="h-3 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                       <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
