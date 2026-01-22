import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone, Plus, ArrowRight, ShieldCheck, Globe,
  CreditCard, Link2, ExternalLink, Zap, LifeBuoy, Users, Loader2
} from 'lucide-react';
import { useApps } from '../../contexts/AppsContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

const DashboardHome: React.FC = () => {
  const { apps } = useApps();
  const { profile } = useAuth();

  // --- NOVOS ESTADOS PARA DADOS REAIS ---
  const [totalClients, setTotalClients] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // --- BUSCA DE DADOS NO SUPABASE ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        // Busca a contagem real de alunos na tabela 'clients'
        const { count, error } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        setTotalClients(count || 0);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

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
    <div className="space-y-8 pb-20 animate-fade-in font-sans">

      {/* Header Clean */}
      <div className="animate-slide-up flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
            Olá, {profile?.full_name?.split(' ')[0] || 'Criador'}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Aqui está o resumo da sua operação TribeBuild hoje.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Plano Ativo:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-brand-blue/5 text-brand-blue border border-brand-blue/20">
            {rawPlan}
          </span>
        </div>
      </div>

      {/* GRID DE DASHBOARD (Stats + Card Principal) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">

        {/* Card Principal de App (2 Colunas no Desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-brand-blue/30 transition-all duration-300 group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg">
                <Smartphone className="w-7 h-7 text-white dark:text-slate-900" />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {mainApp ? mainApp.name : "Nenhum App Criado"}
                  </h2>
                  {mainApp && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Online
                    </span>
                  )}
                </div>

                {mainApp ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <a
                      href={mainApp.customDomain ? `https://${mainApp.customDomain}` : mainApp.accessLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-blue flex items-center gap-1.5 transition-colors"
                    >
                      {mainApp.customDomain || mainApp.accessLink.replace('https://', '')}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Comece criando seu primeiro aplicativo agora mesmo.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {mainApp ? (
                <Link
                  to="/dashboard/apps"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl font-black uppercase tracking-[0.15em] text-[11px] shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Gerenciar App
                </Link>
              ) : (
                <Link
                  to="/dashboard/builder"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeiro App
                </Link>
              )}
            </div>
          </div>

          {/* Barra de Progresso de Uso */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Capacidade do Plano</span>
              <span className={cn("text-xs font-bold", isLimitReached ? "text-red-500" : "text-slate-700 dark:text-slate-300")}>
                {safeApps.length} de {maxApps} Slots Utilizados
              </span>
            </div>
            <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-700", isLimitReached ? "bg-red-500" : "bg-brand-blue")}
                style={{ width: `${(safeApps.length / maxApps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card de Estatísticas Reais (1 Coluna no Desktop) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Geral</span>
          </div>

          <div>
            {isLoadingStats ? (
              <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
            ) : (
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                {totalClients}
              </h3>
            )}
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total de Alunos</p>
          </div>

          <Link to="/dashboard/clients" className="mt-6 text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-transform">
            Ver Lista Completa <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Grid de Links Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        {[
          {
            to: "/dashboard/integrations",
            title: "Integrações",
            desc: "Conecte plataformas de pagamento.",
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
            className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:border-brand-blue/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110", item.bg)}>
                <item.icon className={cn("w-5 h-5", item.color)} />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue transition-colors" />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{item.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Info Section Suporte */}
      <div className="bg-slate-950 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 animate-slide-up relative overflow-hidden group" style={{ animationDelay: '300ms' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -mr-32 -mt-32" />

        <div className="flex items-center gap-6 relative z-10">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white group-hover:rotate-12 transition-transform">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Precisa de Suporte Estratégico?</h3>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Nossa equipe técnica pode te ajudar com integrações personalizadas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
          <a
            href="https://wa.me/5561982199922"
            target="_blank"
            rel="noreferrer"
            className="flex-1 md:flex-none px-8 py-3.5 bg-white text-slate-950 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all text-center shadow-xl shadow-white/5"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;