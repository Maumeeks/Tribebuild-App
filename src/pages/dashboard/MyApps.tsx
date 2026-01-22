import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ExternalLink,
  Settings,
  Users,
  BarChart3,
  MoreHorizontal,
  Smartphone,
  Loader2
} from 'lucide-react';
import { useApps } from '../../contexts/AppsContext'; // Conectando ao Banco de Dados!
import Button from '../../components/Button';
import { cn } from '../../lib/utils';

const MyApps: React.FC = () => {
  const navigate = useNavigate();
  const { apps, loading } = useApps(); // Dados reais do Supabase

  // Função para criar novo app
  const handleCreateNew = () => {
    // Redireciona para o fluxo de criação (ajuste a rota conforme seu projeto)
    navigate('/onboarding');
  };

  return (
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Meus Apps</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie seus aplicativos e acompanhe métricas.</p>
        </div>
        <Button onClick={handleCreateNew} leftIcon={Plus} className="shadow-lg shadow-brand-blue/20">
          Criar Novo App
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Loading State (Skeletons) */}
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 h-[280px] animate-pulse">
                <div className="flex justify-between mb-6">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg mt-auto"></div>
              </div>
            ))}
          </>
        )}

        {/* Lista de Apps Reais */}
        {!loading && apps.map((app) => (
          <div
            key={app.id}
            className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-blue/50 dark:hover:border-brand-blue/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 flex flex-col"
          >
            <div className="p-6 flex-1">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md transition-transform group-hover:scale-105"
                  style={{ backgroundColor: app.primaryColor || '#2563EB' }}
                >
                  {app.logo ? (
                    <img src={app.logo} alt={app.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    app.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border",
                    app.status === 'published'
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                      : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  )}>
                    {app.status === 'published' ? 'Online' : 'Rascunho'}
                  </span>
                  <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* App Info */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-brand-blue transition-colors">
                  {app.name}
                </h3>
                <a
                  href={app.accessLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 dark:text-slate-400 hover:underline flex items-center gap-1 font-medium truncate"
                >
                  {app.slug}.tribebuild.app <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Stats (Mockados por enquanto, pois não temos tabela de analytics ainda) */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-brand-blue">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usuários</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">0</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acessos</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 rounded-b-xl flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-xs uppercase font-bold h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                onClick={() => window.open(app.accessLink, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                Visitar
              </Button>
              <Button
                className="flex-1 text-xs uppercase font-bold h-10"
                onClick={() => navigate(`/app/${app.id}/dashboard`)} // Rota para o painel do app
              >
                <Settings className="w-3.5 h-3.5 mr-2" />
                Gerenciar
              </Button>
            </div>
          </div>
        ))}

        {/* Card "Criar Novo" (Sempre visível) */}
        {!loading && (
          <button
            onClick={handleCreateNew}
            className="group min-h-[380px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-blue dark:hover:border-brand-blue bg-slate-50/50 dark:bg-slate-900/20 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Smartphone className="w-8 h-8 text-slate-400 group-hover:text-brand-blue transition-colors" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-blue transition-colors">Novo Aplicativo</h3>
              <p className="text-xs text-slate-400 mt-1">Adicione um novo produto ao seu portfólio</p>
            </div>
          </button>
        )}

      </div>
    </div>
  );
};

export default MyApps;