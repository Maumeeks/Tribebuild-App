import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Shield, Gift, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';

const CTASection: React.FC = () => {
  const navigate = useNavigate();
  
  // Contador regressivo
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const getNextMonday = () => {
      const now = new Date();
      const nextMonday = new Date();
      nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
      nextMonday.setHours(23, 59, 59, 999);
      return nextMonday;
    };
    
    const targetDate = getNextMonday();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      
      {/* Background Otimizado (Clean no Light Mode) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Light Mode: Fundo Sólido Suave (evita aspecto sujo) */}
        <div className="absolute inset-0 bg-slate-50 dark:hidden"></div>
        {/* Dark Mode: Gradiente Profundo */}
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-slate-950/30 via-slate-900/50 to-slate-950/80"></div>
        
        {/* Glow Central (Brilho) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-coral/5 via-transparent to-transparent dark:from-brand-coral/10"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <ScrollReveal>
          {/* Badge de Urgência */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-brand-coral/10 dark:bg-brand-coral/20 text-brand-coral text-[10px] md:text-xs font-black rounded-full mb-6 uppercase tracking-widest border border-brand-coral/20 animate-pulse">
            <Clock className="w-3 h-3 md:w-4 md:h-4" />
            Oferta Encerra em: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </div>

          {/* Headline Principal */}
          <h2 className="text-3xl md:text-6xl font-display font-extrabold text-slate-900 dark:text-white mb-6 tracking-tighter leading-[1.1]">
            Seu App Pode Estar no Ar{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-500 to-brand-coral">
              em 17 Minutos
            </span>
          </h2>

          {/* Subtítulo com Prova Social */}
          <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            <span className="font-semibold text-slate-900 dark:text-white">1.247 criadores</span> já 
            migraram. A pergunta é:{' '}
            <span className="text-brand-coral font-semibold">quanto você perde hoje em reembolsos?</span>
          </p>

          {/* Countdown Boxes */}
          <div className="flex justify-center gap-2 md:gap-3 mb-10">
            {[
              { value: timeLeft.days, label: 'Dias' },
              { value: timeLeft.hours, label: 'Horas' },
              { value: timeLeft.minutes, label: 'Min' },
              { value: timeLeft.seconds, label: 'Seg' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 shadow-lg border border-slate-100 dark:border-slate-700 min-w-[60px] md:min-w-[70px]">
                <p className="text-2xl md:text-3xl font-black text-brand-blue">{String(item.value).padStart(2, '0')}</p>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Botão CTA Principal (CORRIGIDO: Menor no Mobile) */}
          <div className="mb-10 w-full flex flex-col items-center">
            <button 
              className="group w-full md:w-auto px-6 py-4 md:px-12 md:py-6 bg-brand-coral hover:bg-brand-coral-dark text-white text-lg md:text-xl font-bold rounded-full shadow-xl shadow-brand-coral/30 transition-all hover:-translate-y-1 hover:shadow-brand-coral/50 font-display inline-flex items-center justify-center gap-3 active:scale-95"
              onClick={() => navigate('/register')}
            >
              CRIAR MEU APP AGORA
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <p className="text-slate-500 text-xs md:text-sm mt-4">
              Começa em R$67/mês após 7 dias grátis. Cancele quando quiser.
            </p>
          </div>
        </ScrollReveal>

        {/* Trust Badges (Responsivo: Grid no mobile, Flex no desktop) */}
        <ScrollReveal delay={200}>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mb-12">
            <div className="flex items-center gap-2 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200/50 dark:border-white/10 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-green-600 dark:text-green-400 stroke-[3px]" />
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">7 dias grátis</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200/50 dark:border-white/10 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Cancelamento fácil</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 dark:bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200/50 dark:border-white/10 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <Gift className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">R$497 em bônus</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Escassez Final */}
        <ScrollReveal delay={400}>
          <div className="bg-brand-blue/5 dark:bg-brand-blue/10 rounded-2xl p-4 md:p-6 border border-brand-blue/10 dark:border-brand-blue/20">
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              ⚠️ <strong>Aviso:</strong> O preço de R$67/mês é promocional. 
              <span className="block sm:inline"> Garanta sua vaga agora para travar esse valor para sempre.</span>
            </p>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default CTASection;