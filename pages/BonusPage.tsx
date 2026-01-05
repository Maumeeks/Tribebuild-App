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
  Shield
} from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';

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
    title: 'Templates Prontos',
    description: 'Emails, mensagens de WhatsApp, descrições de produtos, posts para redes sociais e scripts de vídeo. Copie, cole e personalize!',
    value: 'R$197',
    icon: FileText,
    filename: 'templates-prontos-tribebuild.pdf',
    color: 'blue'
  },
  {
    id: 'guia',
    title: 'Guia de Lançamento',
    description: 'Passo a passo completo para lançar seu app em 7 dias. Da preparação ao dia do lançamento, tudo explicado.',
    value: 'R$147',
    icon: Rocket,
    filename: 'guia-lancamento-tribebuild.pdf',
    color: 'coral'
  },
  {
    id: 'checklist',
    title: 'Checklist de Configuração',
    description: 'Lista completa com tudo que você precisa configurar. Marque cada item e tenha certeza que nada foi esquecido.',
    value: 'R$97',
    icon: CheckSquare,
    filename: 'checklist-configuracao-tribebuild.pdf',
    color: 'emerald'
  },
  {
    id: 'suporte',
    title: 'Suporte Prioritário',
    description: 'Resposta em até 2 horas no WhatsApp. Tire suas dúvidas diretamente com nossa equipe.',
    value: 'R$56',
    icon: MessageCircle,
    filename: '', // Não tem download, é um benefício
    color: 'purple'
  }
];

const BonusPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Simular data de cadastro do usuário (será substituído pelo backend)
  // Por enquanto, pega do localStorage ou usa data atual
  const [registrationDate, setRegistrationDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(7);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Tentar pegar data de cadastro do localStorage (mockado)
    const storedDate = localStorage.getItem('tribebuild_registration_date');
    
    if (storedDate) {
      setRegistrationDate(new Date(storedDate));
    } else {
      // Se não existe, criar agora (primeiro acesso)
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
      unlockDate.setDate(unlockDate.getDate() + 7); // 7 dias após cadastro
      
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
    
    // Abrir PDF em nova aba
    window.open(`/downloads/${filename}`, '_blank');
  };

  // Para teste: função para simular desbloqueio
  const handleTestUnlock = () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 8); // 8 dias atrás
    localStorage.setItem('tribebuild_registration_date', pastDate.toISOString());
    setRegistrationDate(pastDate);
  };

  // Para teste: função para resetar
  const handleTestReset = () => {
    const now = new Date();
    localStorage.setItem('tribebuild_registration_date', now.toISOString());
    setRegistrationDate(now);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-blue transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </button>
          
          <TribeBuildLogo size="sm" />
          
          <div className="w-20"></div> {/* Spacer para centralizar logo */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-coral/10 dark:bg-brand-coral/20 rounded-full mb-6">
            <Gift className="w-5 h-5 text-brand-coral" />
            <span className="text-brand-coral font-bold text-sm">ÁREA DE BÔNUS EXCLUSIVOS</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Seus Bônus{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">
              Exclusivos
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Valor total: <span className="font-bold text-brand-coral">R$497</span> em materiais para acelerar seu sucesso.
          </p>
        </div>

        {/* Status do Desbloqueio */}
        <div className={`mb-12 p-6 rounded-3xl border-2 ${
          isUnlocked 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' 
            : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {isUnlocked ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Unlock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                      🎉 Bônus Desbloqueados!
                    </h2>
                    <p className="text-emerald-700 dark:text-emerald-400">
                      Parabéns! Você pode baixar todos os materiais agora.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300">
                      ⏳ Bônus Bloqueados
                    </h2>
                    <p className="text-amber-700 dark:text-amber-400">
                      Continue usando o TribeBuild para desbloquear!
                    </p>
                  </div>
                </>
              )}
            </div>

            {!isUnlocked && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div className="flex gap-2">
                  {[
                    { value: timeLeft.days, label: 'dias' },
                    { value: timeLeft.hours, label: 'hrs' },
                    { value: timeLeft.minutes, label: 'min' },
                    { value: timeLeft.seconds, label: 'seg' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl px-3 py-2 text-center shadow-sm">
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                        {String(item.value).padStart(2, '0')}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grid de Bônus */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {bonusList.map((bonus) => {
            const Icon = bonus.icon;
            const canDownload = isUnlocked && bonus.filename;
            
            const colorClasses = {
              blue: {
                bg: 'bg-brand-blue/10 dark:bg-brand-blue/20',
                icon: 'text-brand-blue',
                border: 'border-brand-blue/20 hover:border-brand-blue/50',
              },
              coral: {
                bg: 'bg-brand-coral/10 dark:bg-brand-coral/20',
                icon: 'text-brand-coral',
                border: 'border-brand-coral/20 hover:border-brand-coral/50',
              },
              emerald: {
                bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
                icon: 'text-emerald-600 dark:text-emerald-400',
                border: 'border-emerald-500/20 hover:border-emerald-500/50',
              },
              purple: {
                bg: 'bg-purple-500/10 dark:bg-purple-500/20',
                icon: 'text-purple-600 dark:text-purple-400',
                border: 'border-purple-500/20 hover:border-purple-500/50',
              },
            };
            
            const colors = colorClasses[bonus.color as keyof typeof colorClasses];
            
            return (
              <div 
                key={bonus.id}
                className={`relative bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 ${colors.border} transition-all duration-300 ${
                  !isUnlocked ? 'opacity-80' : 'hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Badge de valor */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 ${colors.bg} ${colors.icon} text-xs font-bold rounded-full`}>
                    {bonus.value}
                  </span>
                </div>
                
                {/* Overlay de bloqueio */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/30 rounded-3xl flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
                      <Lock className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Libera em {daysRemaining} dias
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Conteúdo */}
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-6`}>
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {bonus.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  {bonus.description}
                </p>
                
                {/* Botão de Download */}
                {bonus.filename ? (
                  <button
                    onClick={() => handleDownload(bonus.filename)}
                    disabled={!canDownload}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      canDownload
                        ? 'bg-brand-blue hover:bg-brand-blue-dark text-white shadow-lg shadow-brand-blue/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {canDownload ? (
                      <>
                        <Download className="w-4 h-4" />
                        Baixar PDF
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Bloqueado
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    Benefício Ativo
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dica */}
        <div className="bg-gradient-to-r from-brand-blue/5 via-brand-coral/5 to-brand-blue/5 dark:from-brand-blue/10 dark:via-brand-coral/10 dark:to-brand-blue/10 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                Por que esperar 7 dias?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Queremos que você primeiro explore o TribeBuild e configure seu app. 
                Assim, quando os bônus forem liberados, você vai aproveitar muito mais! 
                Use esse tempo para deixar tudo pronto.
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Teste (remover em produção) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <p className="text-xs text-slate-500 mb-2 font-bold">🛠️ MODO DESENVOLVIMENTO - Botões de teste:</p>
            <div className="flex gap-3">
              <button 
                onClick={handleTestUnlock}
                className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg"
              >
                Simular Desbloqueio
              </button>
              <button 
                onClick={handleTestReset}
                className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-lg"
              >
                Resetar Timer
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer simples */}
      <footer className="py-8 text-center border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} TribeBuild. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default BonusPage;
