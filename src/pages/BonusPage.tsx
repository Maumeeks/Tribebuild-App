import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift, Lock, Unlock, Download, Clock, FileText, Rocket, CheckSquare,
  MessageCircle, ArrowLeft, Sparkles, ShieldCheck, AlertCircle, Crown, Loader2
} from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext'; // ✅ Motor de Autenticação Real

interface Bonus {
  id: string;
  title: string;
  description: string;
  value: string;
  icon: React.ElementType;
  filename: string;
  color: string;
}

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
  const { profile, loading } = useAuth(); // ✅ Conexão Real com o Perfil
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (loading || !profile?.created_at) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      // ✅ Usa a data real de cadastro do banco de dados
      const unlockDate = new Date(profile.created_at);
      unlockDate.setDate(unlockDate.getDate() + 7);

      const distance = unlockDate.getTime() - now.getTime();

      if (distance <= 0) {
        setIsUnlocked(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
      setIsUnlocked(false);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [profile, loading]);

  const handleDownload = (filename: string) => {
    if (!isUnlocked || !filename) return;
    window.open(`/downloads/${filename}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <TribeBuildLogo size="sm" />
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Card de Destaque com Contador */}
        <div className="relative bg-slate-900 rounded-[2.5rem] p-10 text-white overflow-hidden shadow-2xl animate-slide-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-coral/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Área de Membros VIP</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight leading-none mb-4">R$497 em Bônus Ativados</h1>
              <p className="text-white/60 text-sm font-medium leading-relaxed">
                Estes materiais são liberados automaticamente após 7 dias para garantir que você foque no essencial da sua plataforma primeiro.
              </p>
            </div>

            {/* Status do Cronômetro */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 min-w-[300px] text-center">
              {isUnlocked ? (
                <div className="animate-pulse">
                  <Unlock className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <p className="font-black text-emerald-400 uppercase tracking-widest text-sm">Acesso Liberado!</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Desbloqueio em:</p>
                  <div className="flex justify-center gap-3">
                    {[{ v: timeLeft.days, l: 'Dias' }, { v: timeLeft.hours, l: 'Hrs' }, { v: timeLeft.minutes, l: 'Min' }].map(t => (
                      <div key={t.l} className="bg-white/10 rounded-2xl px-4 py-3 min-w-[60px]">
                        <p className="text-3xl font-black">{String(t.v).padStart(2, '0')}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30">{t.l}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Grid de Bônus */}
        <div className="grid md:grid-cols-2 gap-8">
          {bonusList.map((bonus) => {
            const Icon = bonus.icon;
            return (
              <div key={bonus.id} className={cn(
                "group bg-white dark:bg-slate-900 rounded-[2rem] p-8 border-2 transition-all",
                isUnlocked ? "border-emerald-100 hover:shadow-xl" : "border-slate-50 opacity-60 grayscale"
              )}>
                <div className="flex gap-6 items-start">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white", isUnlocked ? bonus.color : "bg-slate-100")}>
                    <Icon size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white">{bonus.title}</h3>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{bonus.value}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">{bonus.description}</p>
                    <button
                      onClick={() => handleDownload(bonus.filename)}
                      disabled={!isUnlocked}
                      className={cn(
                        "w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                        isUnlocked ? "bg-slate-900 text-white hover:bg-brand-blue" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {isUnlocked ? "Fazer Download" : "Conteúdo Bloqueado"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default BonusPage;