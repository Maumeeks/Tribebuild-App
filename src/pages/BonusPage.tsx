import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift,
  Lock,
  Unlock,
  Download,
  Clock,
  FileText,
  Rocket,
  CheckSquare,
  MessageCircle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
// ✅ CORREÇÃO: Caminhos ajustados para ../../
import TribeBuildLogo from '../../components/TribeBuildLogo';
import { cn } from '../../lib/utils';

// Tipo para os bônus
interface Bonus {
  id: string;
  title: string;
  description: string;
  value: string;
  icon: React.ElementType;
  filename: string;
  color: string;
}

// Lista de bônus
const bonusList: Bonus[] = [
  {
    id: 'templates',
    title: 'Templates de Alta Conversão',
    description: 'Emails, scripts de vendas e copys validados para copiar e colar.',
    value: 'R$197',
    icon: FileText,
    filename: 'templates-prontos-tribebuild.pdf',
    color: 'bg-blue-500'
  },
  {
    id: 'guia',
    title: 'Playbook de Lançamento',
    description: 'O mapa exato para lançar seu aplicativo em 7 dias com segurança.',
    value: 'R$147',
    icon: Rocket,
    filename: 'guia-lancamento-tribebuild.pdf',
    color: 'bg-orange-500'
  },
  {
    id: 'checklist',
    title: 'Checklist de Configuração',
    description: 'Não esqueça nada. Uma lista técnica para garantir que seu app está perfeito.',
    value: 'R$97',
    icon: CheckSquare,
    filename: 'checklist-configuracao-tribebuild.pdf',
    color: 'bg-emerald-500'
  },
  {
    id: 'suporte',
    title: 'Acesso Prioritário (VIP)',
    description: 'Canal direto com nosso time de especialistas para destravar seu negócio.',
    value: 'R$56',
    icon: MessageCircle,
    filename: '',
    color: 'bg-purple-500'
  }
];

const BonusPage: React.FC = () => {
  const navigate = useNavigate();

  // Lógica de Tempo
  const [registrationDate, setRegistrationDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(7);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const storedDate = localStorage.getItem('tribebuild_registration_date');
    if (storedDate) {
      setRegistrationDate(new Date(storedDate));
    } else {
      const now = new Date();
      localStorage.setItem('tribebuild_registration_date', now.toISOString());
      setRegistrationDate(now);
    }
  }, []);

  useEffect(() => {
    if (!registrationDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const unlockDate = new Date(registrationDate);
      unlockDate.setDate(unlockDate.getDate() + 7);

      const distance = unlockDate.getTime() - now.getTime();

      if (distance <= 0) {
        setIsUnlocked(true);
        setDaysRemaining(0);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setDaysRemaining(days);
      setTimeLeft({ days, hours, minutes, seconds });
      setIsUnlocked(false);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [registrationDate]);

  const handleDownload = (filename: string) => {
    if (!isUnlocked || !filename) return;
    window.open(`/downloads/${filename}`, '_blank');
  };

  // Funções de Teste (Dev Mode)
  const handleTestUnlock = () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 8);
    localStorage.setItem('tribebuild_registration_date', pastDate.toISOString());
    setRegistrationDate(pastDate);
  };

  const handleTestReset = () => {
    const now = new Date();
    localStorage.setItem('tribebuild_registration_date', now.toISOString());
    setRegistrationDate(now);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Inter']">
      {/* Header Minimalista */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <TribeBuildLogo size="sm" />

          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section - Dashboard Style */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full mb-4 shadow-sm">
              <Gift className="w-4 h-4 text-brand-blue" />
              <span className="text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Recursos Premium</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
              Acelerador de Resultados
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl leading-relaxed">
              Desbloqueie ferramentas e materiais exclusivos avaliados em <span className="font-bold text-slate-900 dark:text-white">R$ 497</span>.
              Disponível gratuitamente para assinantes ativos.
            </p>
          </div>

          {/* Timer Card - Estilo Técnico */}
          <div className={cn(
            "p-5 rounded-xl border w-full md:w-auto min-w-[320px] shadow-sm transition-all",
            isUnlocked
              ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isUnlocked ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                  <p className={cn("text-xs font-bold", isUnlocked ? "text-emerald-600" : "text-slate-700 dark:text-white")}>
                    {isUnlocked ? 'Desbloqueado' : 'Aguardando Prazo'}
                  </p>
                </div>
              </div>

              {!isUnlocked && (
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faltam</p>
                  <p className="text-xs font-bold text-brand-coral">{daysRemaining} dias</p>
                </div>
              )}
            </div>

            {!isUnlocked && (
              <div className="flex gap-2">
                {[
                  { value: timeLeft.days, label: 'D' },
                  { value: timeLeft.hours, label: 'H' },
                  { value: timeLeft.minutes, label: 'M' },
                  { value: timeLeft.seconds, label: 'S' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-lg py-2 text-center border border-slate-100 dark:border-slate-800">
                    <span className="block text-base font-mono font-bold text-slate-900 dark:text-white leading-none mb-1">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                  </div>
                ))}
              </div>
            )}

            {isUnlocked && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-100/50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                <ShieldCheck className="w-4 h-4" />
                Acesso total concedido ao acervo.
              </div>
            )}
          </div>
        </div>

        {/* Grid de Bônus */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {bonusList.map((bonus) => {
            const Icon = bonus.icon;
            const canDownload = isUnlocked && bonus.filename;

            return (
              <div
                key={bonus.id}
                className={cn(
                  "group relative bg-white dark:bg-slate-900 rounded-xl p-6 border transition-all duration-300 flex flex-col hover:border-slate-300 dark:hover:border-slate-700",
                  isUnlocked
                    ? "border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
                    : "border-slate-100 dark:border-slate-800 opacity-60 grayscale"
                )}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm",
                    bonus.color
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-slate-200 dark:border-slate-700">
                    {bonus.value}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-blue transition-colors">
                  {bonus.title}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 flex-grow">
                  {bonus.description}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                  {bonus.filename ? (
                    <button
                      onClick={() => handleDownload(bonus.filename)}
                      disabled={!canDownload}
                      className={cn(
                        "w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                        canDownload
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-blue dark:hover:bg-slate-200 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                      )}
                    >
                      {canDownload ? (
                        <>
                          <Download className="w-4 h-4" />
                          Baixar Arquivo
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Bloqueado
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      Ativado na Conta
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box - Explicação do Bloqueio */}
        {!isUnlocked && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-5 items-start">
            <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Por que esperar 7 dias?</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                Este período foi desenhado para que você foque 100% na configuração inicial da sua plataforma sem distrações.
                Quando os bônus forem liberados, você já terá a base pronta para aplicar as estratégias de aceleração.
              </p>
            </div>
          </div>
        )}

        {/* Botões de Teste (Dev Mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl opacity-60 hover:opacity-100 transition-opacity">
            <p className="text-[10px] font-mono text-slate-500 mb-3 font-bold uppercase flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Painel de Debug (Dev Only)
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleTestUnlock}
                className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                Forçar Desbloqueio
              </button>
              <button
                onClick={handleTestReset}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Resetar Timer
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BonusPage;