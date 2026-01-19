import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Plus, ArrowRight, ShieldCheck, Globe, CreditCard, Link2, ExternalLink, Zap, Clock } from 'lucide-react';
import { useApps } from '../../contexts/AppsContext';
import { useAuth } from '../../contexts/AuthContext';

const DashboardHome: React.FC = () => {
  const { apps } = useApps();
  // ✅ CORREÇÃO 1: Removemos isTrialActive e trialDaysLeft (que causavam o erro)
  const { profile } = useAuth(); 
  
  // Define o plano atual
  const currentPlan = profile?.plan || 'free';
  const planStatus = profile?.plan_status;

  // ✅ CORREÇÃO 2: Lógica local para exibição (sem depender do Context)
  const isTrialActive = planStatus === 'trial';
  
  const getTrialDaysLeft = () => {
    if (!profile?.trial_ends_at) return 0;
    const end = new Date(profile.trial_ends_at).getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  };

  const trialDaysLeft = getTrialDaysLeft();

  // --- CONFIGURAÇÃO OFICIAL DOS LIMITES ---
  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'starter': return 1;
      case 'professional': return 3;
      case 'business': return 5;
      case 'enterprise': return 10;
      case 'free': return 1;
      default: return 1; 
    }
  };

  const maxApps = getPlanLimits(currentPlan);
  const safeApps = apps || [];
  const isLimitReached = safeApps.length >= maxApps;
  
  const mainApp = safeApps.length > 0 ? safeApps[0] : null;

  return (
    <div className="space-y-10 pb-20">
      {/* Boas-vindas */}
      <div className="animate-slide-up">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Bem-vindo, {profile?.full_name?.split(' ')[0] || 'Criador'}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-lg flex items-center gap-2">
          Você está no plano 
          <span className="text-brand-blue font-bold uppercase">
            {currentPlan} 
            {isTrialActive && <span className="text-amber-500 ml-1 text-sm">(Período de Testes)</span>}
          </span>
        </p>
      </div>

      {/* CARD PRINCIPAL */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 md:p-10 shadow-sm hover:shadow-2xl hover:border-brand-blue/30 transition-all duration-500 group animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
              <Smartphone className="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {mainApp ? mainApp.name : "Meus Apps"}
              </h2>
              
              {mainApp ? (
                <div className="mt-2 space-y-1">
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                     Seu aplicativo está ativo e rodando.
                   </p>
                   <a 
                     href={mainApp.customDomain ? `https://${mainApp.customDomain}` : mainApp.accessLink}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
                   >
                     {mainApp.customDomain || mainApp.accessLink}
                     <ExternalLink className="w-3 h-3" />
                   </a>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed font-medium max-w-xl">
                  Crie seu primeiro aplicativo agora mesmo e comece a escalar.
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-4">
                {/* Badge do Plano */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-brand-blue dark:text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800">
                  {currentPlan}
                </span>

                {/* Badge do Trial (se ativo) */}
                {isTrialActive && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 dark:border-amber-800">
                        <Clock className="w-3 h-3" />
                        {trialDaysLeft} DIAS RESTANTES
                    </span>
                )}

                <span className={`text-xs font-bold uppercase tracking-widest ${isLimitReached ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                  APPS: <span className={isLimitReached ? 'text-red-600' : 'text-slate-900 dark:text-white'}>{safeApps.length}/{maxApps}</span>
                </span>
              </div>
            </div>
          </div>
           
          {/* BOTÕES DE AÇÃO */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            {mainApp ? (
              <>
                <a
                  href={mainApp.customDomain ? `https://${mainApp.customDomain}` : mainApp.accessLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/30 transform hover:-translate-y-1 active:scale-95 transition-all duration-300 w-full md:w-auto"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  Acessar App
                </a>
                <Link
                  to="/dashboard/apps"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all w-full md:w-auto"
                >
                  Gerenciar
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard/builder"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 transform hover:-translate-y-1 active:scale-95 transition-all duration-300 w-full md:w-auto"
              >
                <Plus className="w-5 h-5" />
                Criar Meu App
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Links Rápidos (Mantido inalterado) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Link
          to="/dashboard/integrations"
          className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-8 hover:border-brand-blue/30 hover:shadow-2xl transition-all duration-500 group"
        >
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <Link2 className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Integrações
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
            Conecte seu app com Hotmart, Kiwify e Eduzz.
          </p>
          <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
            Configurar
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/dashboard/domains"
          className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-8 hover:border-brand-blue/30 hover:shadow-2xl transition-all duration-500 group"
        >
          <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <Globe className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Domínios
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
            Use seu próprio endereço (ex: app.seunome.com).
          </p>
          <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
            Configurar
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/dashboard/plans"
          className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-8 hover:border-brand-blue/30 hover:shadow-2xl transition-all duration-500 group"
        >
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <CreditCard className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Assinatura
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
            Gerencie seu plano e faturas.
          </p>
          <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
            Ver Detalhes
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative group animate-slide-up border border-slate-800" style={{ animationDelay: '300ms' }}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full w-fit backdrop-blur-sm border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">Seu ambiente está seguro</span>
               </div>
               <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Precisa de ajuda?</h3>
               <p className="text-slate-400 font-medium max-w-lg leading-relaxed">
                 Acesse nossa base de conhecimento ou fale com o suporte.
               </p>
            </div>
            <a 
              href="https://wa.me/5561982199922" 
              target="_blank" 
              rel="noreferrer"
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-all shadow-xl w-full md:w-auto text-center"
            >
              Falar com Suporte
            </a>
         </div>
      </div>
    </div>
  );
};

export default DashboardHome;