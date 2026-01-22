import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Plus, ArrowRight, ShieldCheck, Globe, CreditCard, Link2, ExternalLink, Zap, LifeBuoy } from 'lucide-react';
import { useApps } from '../../contexts/AppsContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils'; // Certifique-se que o utils está importado

const DashboardHome: React.FC = () => {
  const { apps } = useApps();
  const { profile } = useAuth();

  // --- LÓGICA DE PLANOS ---
  const rawPlan = profile?.plan?.toLowerCase().trim() || 'starter';

  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 10;
      case 'business': return 5;
      case 'professional': return 3;
      case 'starter': return 1;
      default: return 1;
    }
  };

  const maxApps = getPlanLimits(rawPlan);
  const safeApps = apps || [];
  const isLimitReached = safeApps.length >= maxApps;
  const mainApp = safeApps.length > 0 ? safeApps[0] : null;

  return (
    <div className="space-y-8 pb-20 animate-fade-in font-['inter']">

      {/* Header Clean */}
      <div className="animate-slide-up flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Olá, {profile?.full_name?.split(' ')[0] || 'Criador'}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Aqui está o resumo da sua operação hoje.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Plano Atual:</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {rawPlan}
          </span>
        </div>
      </div>

      {/* CARD PRINCIPAL (App Ativo) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-brand-blue/30 transition-all duration-300 group animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Smartphone className="w-6 h-6 text-brand-blue" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {mainApp ? mainApp.name : "Nenhum App Criado"}
                </h2>
                {mainApp && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    Ativo
                  </span>
                )}
              </div>

              {mainApp ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <a
                    href={mainApp.customDomain ? `https://${mainApp.customDomain}` : mainApp.accessLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-blue hover:underline flex items-center gap-1 transition-colors"
                  >
                    {mainApp.customDomain || mainApp.accessLink.replace('https://', '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Comece criando seu primeiro aplicativo agora mesmo.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
            {mainApp ? (
              <>
                <a
                  href={mainApp.customDomain ? `https://${mainApp.customDomain}` : mainApp.accessLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-sm transition-all active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Acessar
                </a>
                <Link
                  to="/dashboard/apps"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-bold uppercase tracking-wider text-xs transition-all"
                >
                  Gerenciar
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard/builder"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Criar App
              </Link>
            )}
          </div>
        </div>

        {/* Barra de Progresso de Uso */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Uso do Plano</span>
          <div className="flex items-center gap-3">
            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", isLimitReached ? "bg-red-500" : "bg-brand-blue")}
                style={{ width: `${(safeApps.length / maxApps) * 100}%` }}
              />
            </div>
            <span className={cn("font-bold", isLimitReached ? "text-red-500" : "text-slate-700 dark:text-slate-300")}>
              {safeApps.length} / {maxApps} Apps
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Links Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        {[
          {
            to: "/dashboard/integrations",
            title: "Integrações",
            desc: "Conecte Hotmart, Kiwify e Eduzz.",
            icon: Link2,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-500/10"
          },
          {
            to: "/dashboard/domains",
            title: "Domínios",
            desc: "Configure seu endereço personalizado.",
            icon: Globe,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-500/10"
          },
          {
            to: "/dashboard/plans",
            title: "Assinatura",
            desc: "Gerencie seu plano e faturas.",
            icon: CreditCard,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-500/10"
          }
        ].map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", item.bg)}>
                <item.icon className={cn("w-5 h-5", item.color)} />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Info Section Compacta */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-400">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Precisa de ajuda?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Nossa equipe está pronta para te ajudar a configurar seu app.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-500 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Ambiente Seguro
          </div>
          <a
            href="https://wa.me/5561982199922"
            target="_blank"
            rel="noreferrer"
            className="flex-1 md:flex-none px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-center"
          >
            Falar com Suporte
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;