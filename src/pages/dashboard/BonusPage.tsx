import React, { useState, useEffect } from 'react';
import {
  Gift,
  Lock,
  Unlock,
  Download,
  Clock,
  FileText,
  Rocket,
  CheckSquare,
  Headphones,
  Sparkles,
  Shield,
  Star,
  ArrowRight,
  AlertCircle,
  Check,
  Crown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

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

// Lista de bônus disponíveis
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

// Mock: data de cadastro do usuário (será substituído pelo Supabase)
const mockUserRegistrationDate = new Date();
mockUserRegistrationDate.setDate(mockUserRegistrationDate.getDate() - 2); // Simula 2 dias atrás

const BonusPage: React.FC = () => {
  const [timeUntilUnlock, setTimeUntilUnlock] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Calcular tempo restante para desbloquear
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const registrationDate = mockUserRegistrationDate;
      const unlockDate = new Date(registrationDate);
      unlockDate.setDate(unlockDate.getDate() + 7);

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

    const timer = setInterval(() => {
      setTimeUntilUnlock(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const totalValue = bonusList.reduce((acc, bonus) => acc + bonus.value, 0);

  const handleDownload = (bonus: Bonus) => {
    if (bonus.type === 'access') {
      window.open(bonus.downloadUrl, '_blank');
    } else {
      window.open(bonus.downloadUrl, '_blank');
    }
  };

  const isBonusUnlocked = (bonus: Bonus) => {
    if (bonus.unlockAfterDays === 0) return true;
    return isUnlocked;
  };

  return (
    <div className="space-y-10 font-['inter']">
      {/* Header */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-brand-coral/10 dark:bg-brand-coral/20 rounded-2xl">
            <Gift className="w-8 h-8 text-brand-coral" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-blue tracking-tighter">Seus Bônus Exclusivos</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Materiais especiais para acelerar seu sucesso
            </p>
          </div>
        </div>
      </div>

      {/* Card Principal - Valor Total */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-10 md:p-12 text-white overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        {/* Decorações */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-coral/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-blue/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Acesso Exclusivo</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                R${totalValue} em Bônus
              </h2>
              <p className="text-white/60 font-medium max-w-md">
                Materiais criados para garantir que você tenha sucesso com o TribeBuild desde o primeiro dia.
              </p>
            </div>

            {/* Status de Desbloqueio */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/10 min-w-[280px]">
              {isUnlocked ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                    <Unlock className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-lg font-black text-emerald-400 mb-1">🎉 Bônus Liberados!</p>
                  <p className="text-sm text-white/60">Faça o download agora</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <Lock className="w-8 h-8 text-white/60" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-3">Libera em</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-white/10 rounded-xl px-3 py-2 min-w-[50px]">
                      <p className="text-2xl font-black">{timeUntilUnlock.days}</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Dias</p>
                    </div>
                    <span className="text-2xl font-black text-white/30">:</span>
                    <div className="bg-white/10 rounded-xl px-3 py-2 min-w-[50px]">
                      <p className="text-2xl font-black">{String(timeUntilUnlock.hours).padStart(2, '0')}</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Hrs</p>
                    </div>
                    <span className="text-2xl font-black text-white/30">:</span>
                    <div className="bg-white/10 rounded-xl px-3 py-2 min-w-[50px]">
                      <p className="text-2xl font-black">{String(timeUntilUnlock.minutes).padStart(2, '0')}</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Min</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem de Incentivo (quando bloqueado) */}
      {!isUnlocked && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6 flex items-start gap-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-black text-amber-800 dark:text-amber-300 mb-1">Continue explorando o TribeBuild!</p>
            <p className="text-sm text-amber-700 dark:text-amber-400/80">
              Seus bônus serão liberados automaticamente após 7 dias de uso. Aproveite esse tempo para configurar seu primeiro app e conhecer todas as funcionalidades.
            </p>
          </div>
        </div>
      )}

      {/* Grid de Bônus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bonusList.map((bonus, index) => {
          const unlocked = isBonusUnlocked(bonus);
          const Icon = bonus.icon;

          return (
            <div
              key={bonus.id}
              className={cn(
                "relative bg-white dark:bg-slate-800 rounded-[2rem] border-2 p-8 transition-all duration-500 group animate-slide-up",
                unlocked
                  ? "border-emerald-200 dark:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10"
                  : "border-slate-100 dark:border-slate-700 opacity-80"
              )}
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              {/* Badge de Status */}
              <div className="absolute -top-3 -right-3">
                {unlocked ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/30">
                    <Check className="w-3.5 h-3.5" />
                    Liberado
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                    <Lock className="w-3.5 h-3.5" />
                    Bloqueado
                  </div>
                )}
              </div>

              {/* Ícone e Conteúdo */}
              <div className="flex items-start gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500",
                  unlocked
                    ? `${bonus.bgColor} text-white shadow-lg group-hover:scale-110`
                    : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                )}>
                  <Icon className="w-8 h-8" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={cn(
                      "text-xl font-black tracking-tight",
                      unlocked ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                    )}>
                      {bonus.title}
                    </h3>
                  </div>

                  <p className={cn(
                    "text-sm mb-4 leading-relaxed",
                    unlocked ? "text-slate-600 dark:text-slate-400" : "text-slate-400 dark:text-slate-600"
                  )}>
                    {bonus.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full",
                        unlocked
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                      )}>
                        Valor: R${bonus.value}
                      </span>
                    </div>

                    {unlocked ? (
                      <button
                        onClick={() => handleDownload(bonus)}
                        className={cn(
                          "flex items-center gap-2 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95",
                          bonus.type === 'pdf'
                            ? "bg-brand-blue text-white hover:bg-brand-blue-dark shadow-lg shadow-blue-500/20"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                        )}
                      >
                        {bonus.type === 'pdf' ? (
                          <>
                            <Download className="w-4 h-4" />
                            Baixar PDF
                          </>
                        ) : (
                          <>
                            <Headphones className="w-4 h-4" />
                            Acessar
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <Lock className="w-4 h-4" />
                        Aguardando
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card de Motivação */}
      <div className="bg-gradient-to-r from-brand-blue/5 via-brand-coral/5 to-brand-blue/5 dark:from-brand-blue/10 dark:via-brand-coral/10 dark:to-brand-blue/10 rounded-[2rem] p-8 md:p-10 border border-slate-200/50 dark:border-slate-700/50 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-20 h-20 bg-brand-coral/10 dark:bg-brand-coral/20 rounded-3xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-10 h-10 text-brand-coral" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Por que esperar 7 dias?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              Queremos ter certeza de que você está comprometido com seu sucesso. Em 7 dias, você terá tempo de explorar a plataforma,
              criar seu primeiro app e entender como o TribeBuild funciona. Assim, quando os bônus forem liberados, você saberá
              exatamente como aproveitá-los ao máximo! 🚀
            </p>
          </div>
        </div>
      </div>

      {/* Garantias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '450ms' }}>
        {[
          { icon: Shield, title: 'Conteúdo Exclusivo', desc: 'Materiais criados especialmente para clientes TribeBuild' },
          { icon: Star, title: 'Atualizações Grátis', desc: 'Sempre que atualizarmos, você recebe a nova versão' },
          { icon: Gift, title: 'Sem Custo Adicional', desc: 'Incluído no seu plano, sem pagar nada a mais' }
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 flex items-start gap-4">
            <div className="p-2 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-xl">
              <item.icon className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BonusPage;
