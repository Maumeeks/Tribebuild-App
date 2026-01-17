import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Users, Play, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  videoUrl?: string;
  onCTAClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  videoUrl = 'https://www.youtube.com/embed/hBp4dgE7Bho?si=prVREhXGCWN0naEy',
  onCTAClick,
}) => {
  const navigate = useNavigate();

  // Contador regressivo - próxima segunda-feira às 23:59
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

  const handleCTA = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      navigate('/register');
    }
  };

  return (
    <section
      id="inicio"
      className="relative px-4 pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-x-hidden overflow-y-visible bg-transparent"
    >
      {/* Overlay sutil para legibilidade */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 via-slate-50/30 to-slate-50/70 dark:from-slate-950/40 dark:via-slate-950/20 dark:to-slate-950/50"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/5 via-transparent to-transparent dark:from-brand-blue/15"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col items-center text-center">

          {/* Badge de Urgência com Contador */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-coral/10 dark:bg-brand-coral/20 rounded-full border border-brand-coral/30 backdrop-blur-md mb-8 animate-fade-in">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-coral opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-coral"></span>
            </span>
            <span className="text-xs font-bold tracking-wide text-brand-coral font-display">
              🔥 PREÇO DE LANÇAMENTO ACABA EM:
              <span className="ml-2 font-black">
                {String(timeLeft.days).padStart(2, '0')}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </span>
          </div>

          {/* Headline Principal - Big Idea Forte */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold text-slate-900 dark:text-white mb-6 tracking-tighter leading-[1.2] max-w-5xl animate-slide-up py-2">
            O Método Para Cobrar{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-500 to-brand-coral">3x Mais</span>
            {' '}Pelo{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-500 to-brand-coral">Mesmo{' '}</span>
            {' '}Conteúdo
          </h1>

          {/* Subheadline - Nova copy */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl font-light leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
            Sem criar nada novo. Sem gravar mais aulas.
            <br className="hidden sm:block" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Apenas mudando COMO você entrega.</span>
          </p>

          {/* Vídeo / Mockup Container (MOVIDO PARA CIMA) */}
          <div className="relative w-full max-w-5xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-blue/20 dark:bg-brand-blue/30 rounded-3xl blur-2xl animate-float"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-coral/20 dark:bg-brand-coral/20 rounded-3xl blur-2xl animate-float" style={{ animationDelay: '3s' }}></div>

            <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border-[12px] border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group">
              <iframe
                width="100%"
                height="100%"
                src={videoUrl}
                title="TribeBuild Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>

              {/* Overlay on hover/load */}
              <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-900/20 pointer-events-none group-hover:opacity-0 transition-opacity"></div>
            </div>

            {/* Trust Badges - Logo abaixo do vídeo */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:gap-6 px-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">SSL 256-bit</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-brand-blue" />
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">1.247 criadores</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">4.9/5 (312)</span>
              </div>
            </div>
          </div>

          {/* CTAs Otimizados (MOVIDO PARA BAIXO DO VÍDEO) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <button
              onClick={handleCTA}
              className="group px-8 py-4 bg-brand-coral hover:bg-brand-coral-dark text-white rounded-full font-bold text-lg shadow-xl shadow-brand-coral/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-coral/40 font-display flex items-center gap-3"
            >
              CRIAR MEU APP EM 17 MINUTOS
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className="px-8 py-4 bg-white dark:bg-white/5 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-white/10 hover:border-brand-blue dark:hover:border-brand-blue rounded-full font-bold text-lg transition-all font-display flex items-center gap-2"
              onClick={() => document.getElementById('demo-apps')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="w-5 h-5" />
              Ver Apps de Clientes
            </button>
          </div>

          {/* Micro-compromisso */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-16 animate-slide-up" style={{ animationDelay: '400ms' }}>
            ✓ 7 dias grátis · ✓ Cancele quando quiser · ✓ Suporte via WhatsApp
          </p>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;