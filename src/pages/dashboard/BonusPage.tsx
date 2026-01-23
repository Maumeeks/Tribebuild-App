import React, { useState, useEffect } from 'react';
import {
  Gift, Lock, Unlock, Download, Clock, FileText, Rocket, CheckSquare,
  Headphones, Sparkles, Shield, Star, Check, Crown, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext'; // ✅ Integração com o motor real

// Tipo para os bônus
interface Bonus {
  id: string;
  title: string;
  description: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  downloadUrl: string;
  type: 'pdf' | 'access';
  unlockAfterDays: number;
}

const bonusList: Bonus[] = [
  {
    id: 'templates',
    title: 'Templates Prontos',
    description: 'Modelos de textos, emails de boas-vindas, estrutura de módulos e copy para vendas. Copie e cole.',
    value: 197,
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    downloadUrl: '/bonus/templates-prontos-tribebuild.pdf',
    type: 'pdf',
    unlockAfterDays: 7
  },
  {
    id: 'guia',
    title: 'Guia de Lançamento',
    description: 'Passo a passo completo para lançar seu app do zero. Da configuração até a primeira venda.',
    value: 147,
    icon: Rocket,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    downloadUrl: '/bonus/guia-lancamento-tribebuild.pdf',
    type: 'pdf',
    unlockAfterDays: 7
  },
  {
    id: 'checklist',
    title: 'Checklist de Configuração',
    description: 'Lista completa de tudo que você precisa configurar. Nada é esquecido, tudo organizado.',
    value: 97,
    icon: CheckSquare,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
    downloadUrl: '/bonus/checklist-configuracao-tribebuild.pdf',
    type: 'pdf',
    unlockAfterDays: 7
  },
  {
    id: 'suporte',
    title: 'Suporte Prioritário',
    description: 'Acesso ao suporte via WhatsApp com resposta em até 2 horas. Tire dúvidas rapidamente.',
    value: 56,
    icon: Headphones,
    color: 'text-brand-coral',
    bgColor: 'bg-brand-coral',
    downloadUrl: 'https://wa.me/5561982199922',
    type: 'access',
    unlockAfterDays: 7
  }
];

const BonusPage: React.FC = () => {
  const { profile, loading } = useAuth(); // ✅ Puxa o perfil real
  const [timeUntilUnlock, setTimeUntilUnlock] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (loading || !profile?.created_at) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      // ✅ Calcula a partir da data real de criação do usuário
      const registrationDate = new Date(profile.created_at);
      const unlockDate = new Date(registrationDate);
      unlockDate.setDate(unlockDate.getDate() + 7); // Bloqueio estratégico de 7 dias

      const difference = unlockDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsUnlocked(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeUntilUnlock(calculateTimeLeft());
    const timer = setInterval(() => setTimeUntilUnlock(calculateTimeLeft()), 1000);

    return () => clearInterval(timer);
  }, [profile, loading]);

  const totalValue = bonusList.reduce((acc, bonus) => acc + bonus.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-10 font-sans pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 animate-slide-up">
        <div className="p-3 bg-brand-coral/10 rounded-2xl">
          <Gift className="w-8 h-8 text-brand-coral" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Seus Bônus Exclusivos</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Acelere seus resultados com materiais de elite.</p>
        </div>
      </div>

      {/* Card de Valor Total e Contador */}
      <div className="relative bg-slate-900 rounded-[2.5rem] p-10 md:p-12 text-white overflow-hidden shadow-2xl animate-slide-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-coral/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">Entrega de Valor</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-2">R${totalValue} em Presentes</h2>
            <p className="text-white/60 font-medium max-w-md text-sm leading-relaxed">
              Desbloqueie ferramentas prontas para escalar sua tribo assim que o período de teste for concluído.
            </p>
          </div>

          {/* Cronômetro Real */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 min-w-[280px]">
            {isUnlocked ? (
              <div className="text-center py-2 animate-bounce">
                <Unlock className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="font-black text-emerald-400 uppercase tracking-widest text-xs">Acesso Liberado!</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" /> Libera em:
                </p>
                <div className="flex items-center justify-center gap-3">
                  {['Dias', 'Hrs', 'Min'].map((label, i) => (
                    <div key={label} className="bg-white/10 rounded-2xl px-4 py-3 min-w-[65px]">
                      <p className="text-3xl font-black leading-none mb-1">
                        {i === 0 ? timeUntilUnlock.days : i === 1 ? String(timeUntilUnlock.hours).padStart(2, '0') : String(timeUntilUnlock.minutes).padStart(2, '0')}
                      </p>
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
            <div key={bonus.id} className={cn(
              "relative bg-white dark:bg-slate-800 rounded-[2rem] border-2 p-8 transition-all group",
              isUnlocked ? "border-emerald-100 hover:shadow-xl" : "border-slate-50 opacity-70 grayscale"
            )}>
              <div className="absolute top-4 right-6">
                {isUnlocked ? <Unlock size={16} className="text-emerald-500" /> : <Lock size={16} className="text-slate-300" />}
              </div>
              <div className="flex gap-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", isUnlocked ? bonus.bgColor : "bg-slate-100")}>
                  <Icon className={cn("w-7 h-7", isUnlocked ? "text-white" : "text-slate-400")} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{bonus.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{bonus.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full text-slate-500">Valor: R${bonus.value}</span>
                    {isUnlocked && (
                      <button onClick={() => window.open(bonus.downloadUrl, '_blank')} className="text-xs font-black text-brand-blue uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                        Download <Download size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BonusPage;