import React, { useState, useEffect } from 'react';
import {
  Gift, Lock, Unlock, Download, CheckSquare, Headphones,
  FileText, Rocket, Crown, Loader2, Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface Bonus {
  id: string;
  title: string;
  description: string;
  value: number;
  icon: React.ElementType;
  color: string;
  downloadUrl: string;
  type: 'pdf' | 'access';
}

const bonusList: Bonus[] = [
  {
    id: 'templates',
    title: 'Templates Prontos',
    description: 'Modelos de textos, emails de boas-vindas, estrutura de módulos e copy para vendas. Copie e cole.',
    value: 197,
    icon: FileText,
    color: 'text-blue-500',
    downloadUrl: '/bonus/templates-prontos-tribebuild.pdf',
    type: 'pdf',
  },
  {
    id: 'guia',
    title: 'Guia de Lançamento',
    description: 'Passo a passo completo para lançar seu app do zero. Da configuração até a primeira venda.',
    value: 147,
    icon: Rocket,
    color: 'text-purple-500',
    downloadUrl: '/bonus/guia-lancamento-tribebuild.pdf',
    type: 'pdf',
  },
  {
    id: 'checklist',
    title: 'Checklist de Configuração',
    description: 'Lista completa de tudo que você precisa configurar. Nada é esquecido, tudo organizado.',
    value: 97,
    icon: CheckSquare,
    color: 'text-emerald-500',
    downloadUrl: '/bonus/checklist-configuracao-tribebuild.pdf',
    type: 'pdf',
  },
  {
    id: 'suporte',
    title: 'Suporte Prioritário',
    description: 'Acesso ao suporte via WhatsApp com resposta em até 2 horas. Tire dúvidas rapidamente.',
    value: 56,
    icon: Headphones,
    color: 'text-brand-coral',
    downloadUrl: 'https://wa.me/5561982199922',
    type: 'access',
  },
];

const BonusPage: React.FC = () => {
  const { profile, loading } = useAuth();
  const [timeUntilUnlock, setTimeUntilUnlock] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (loading || !profile?.created_at) {
      console.log('[BonusPage] Aguardando profile...', { loading, hasCreatedAt: !!profile?.created_at });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const registrationDate = new Date(profile.created_at);
      const unlockDate = new Date(registrationDate);
      unlockDate.setDate(unlockDate.getDate() + 7);

      const difference = unlockDate.getTime() - now.getTime();

      // Debug logs
      console.log('[BonusPage] Cálculo de desbloqueio:', {
        now: now.toISOString(),
        registrationDate: registrationDate.toISOString(),
        unlockDate: unlockDate.toISOString(),
        differenceMs: difference,
        differenceHours: Math.floor(difference / (1000 * 60 * 60)),
      });

      if (difference <= 0) {
        console.log('[BonusPage] ✅ DESBLOQUEADO!');
        setIsUnlocked(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeUntilUnlock(calculateTimeLeft());
    const timer = setInterval(() => setTimeUntilUnlock(calculateTimeLeft()), 1000);

    return () => clearInterval(timer);
  }, [profile, loading]);

  const totalValue = bonusList.reduce((acc, bonus) => acc + bonus.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-10 font-['inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-coral/10 flex items-center justify-center">
            <Gift className="w-6 h-6 text-brand-coral" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Seus Bônus Exclusivos</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Ferramentas premium para acelerar seus resultados
            </p>
          </div>
        </div>
      </div>

      {/* Card Valor Total + Contador */}
      <div className="relative bg-slate-900 rounded-2xl p-8 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-coral/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Info do Valor */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full mb-4">
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Entrega de Valor</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              R$ {totalValue} em Presentes
            </h2>
            <p className="text-white/60 text-sm font-medium max-w-md leading-relaxed">
              Desbloqueie materiais exclusivos para escalar sua operação após o período estratégico de 7 dias.
            </p>
          </div>

          {/* Cronômetro */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 min-w-[280px]">
            {isUnlocked ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Unlock className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="font-black text-emerald-400 uppercase tracking-widest text-xs">Acesso Liberado!</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Lock className="w-3.5 h-3.5 text-white/40" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Libera em:
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {[
                    { label: 'Dias', value: timeUntilUnlock.days },
                    { label: 'Hrs', value: String(timeUntilUnlock.hours).padStart(2, '0') },
                    { label: 'Min', value: String(timeUntilUnlock.minutes).padStart(2, '0') },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/10 rounded-xl px-3 py-2.5 min-w-[60px]">
                      <p className="text-2xl font-black text-white leading-none mb-1">{value}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/30">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Bônus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bonusList.map((bonus) => {
          const Icon = bonus.icon;
          return (
            <div
              key={bonus.id}
              className={cn(
                "relative bg-white dark:bg-slate-900 rounded-2xl p-6 border transition-all duration-300",
                isUnlocked
                  ? "border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50"
                  : "border-slate-200 dark:border-slate-800 opacity-60 grayscale"
              )}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {isUnlocked ? (
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="flex gap-5">
                {/* Ícone */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    isUnlocked
                      ? "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                      : "bg-slate-100 dark:bg-slate-800"
                  )}
                >
                  <Icon className={cn("w-6 h-6", isUnlocked ? bonus.color : "text-slate-400")} />
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {bonus.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {bonus.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full">
                      R$ {bonus.value}
                    </span>
                    {isUnlocked && (
                      <button
                        onClick={() => window.open(bonus.downloadUrl, '_blank')}
                        className="text-xs font-bold text-brand-blue hover:text-brand-blue-dark uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        {bonus.type === 'pdf' ? 'Download' : 'Acessar'}
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informativo */}
      {!isUnlocked && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
              Por que 7 dias?
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
              Garantimos que você tenha tempo para conhecer a plataforma antes de receber os materiais avançados.
              Isso maximiza o aproveitamento e resultados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusPage;