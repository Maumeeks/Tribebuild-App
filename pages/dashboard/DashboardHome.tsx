
import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Plus, ArrowRight, ShieldCheck, Globe, CreditCard, Link2, Lock } from 'lucide-react';
import { useApps } from '../../contexts/AppsContext';

const DashboardHome: React.FC = () => {
  const { apps } = useApps();
  const maxApps = 1; // Basic limit changed to 1
  const isLimitReached = apps.length >= maxApps;

  return (
    <div className="space-y-10 ">
      {/* Boas-vindas */}
      <div className="animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          Bem-vindo ao TribeBuild! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-lg">
          Transforme seus produtos digitais em aplicativos de elite hoje mesmo.
        </p>
      </div>

      {/* Card de Ação Rápida - Meus Apps */}
      <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 md:p-10 shadow-sm shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
              <Smartphone className="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Meus Apps</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed font-medium max-w-xl">
                Gerencie seus aplicativos personalizados. Cada app pode ter sua própria identidade visual, catálogo de produtos, feed de conteúdos e configurações exclusivas de White-Label.
              </p>
              <div className="mt-5 flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-brand-blue/20 text-brand-blue text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-100/50 dark:border-brand-blue/30">
                  PLANO ATUAL: BASIC
                </span>
                <span className={`text-xs font-bold uppercase tracking-widest ${isLimitReached ? 'text-red-500' : 'text-slate-400'}`}>
                  APPS ATIVOS: <span className={isLimitReached ? 'text-red-600' : 'text-slate-900 dark:text-white'}>{apps.length}/{maxApps}</span>
                </span>
              </div>
            </div>
          </div>
          
          {isLimitReached ? (
            <div className="flex flex-col items-center gap-2">
              <button
                disabled
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold uppercase tracking-widest text-sm cursor-not-allowed border border-slate-200/50"
              >
                <Lock className="w-5 h-5" />
                Limite Atingido
              </button>
              <Link to="/dashboard/plans" className="text-[10px] text-brand-blue font-bold uppercase tracking-widest hover:underline">
                Fazer Upgrade
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard/builder"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 transform hover:-translate-y-1 active:scale-95 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Criar Meu App
            </Link>
          )}
        </div>
      </div>

      {/* Grid de Links Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Link
          to="/dashboard/integrations"
          className="bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 hover:border-brand-blue/30 hover:shadow-2xl transition-all duration-500 group"
        >
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <Link2 className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Integrações
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
            Conecte seu app com Hotmart, Kiwify, Eduzz e mais para automatizar acessos.
          </p>
          <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest">
            Configurar Agora
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>

        <Link
          to="/dashboard/domains"
          className="bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 hover:border-brand-blue/30 hover:shadow-2xl transition-all duration-500 group"
        >
          <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <Globe className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Domínios
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
            Remova a marca TribeBuild e use seu próprio endereço personalizado (ex: app.seunome.com).
          </p>
          <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest">
            Apontar Domínio
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>

        <Link
          to="/dashboard/plans"
          className="bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 hover:border-brand-blue/30 hover:shadow-2xl transition-all duration-500 group"
        >
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <CreditCard className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Meu Plano
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
            Gerencie sua assinatura, veja faturas e faça upgrade para desbloquear mais recursos.
          </p>
          <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest">
            Ver Detalhes
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Info Section / Status */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative group animate-slide-up" style={{ animationDelay: '300ms' }}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full w-fit backdrop-blur-sm border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">Seu ambiente está seguro</span>
               </div>
               <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Pronto para o próximo nível?</h3>
               <p className="text-slate-400 font-medium max-w-lg leading-relaxed">
                  Consulte nossa Academia TribeBuild para tutoriais passo a passo sobre como configurar seu primeiro app em menos de 10 minutos.
               </p>
            </div>
            <a 
              href="#/academia" 
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-slate-100 transition-all shadow-xl"
            >
              Acessar Academia
            </a>
         </div>
      </div>
    </div>
  );
};

export default DashboardHome;
