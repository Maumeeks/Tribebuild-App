import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Lista de integrações
const integrations = [
  { name: 'Kiwify', logo: '/images/integrations/kiwify.png' },
  { name: 'Eduzz', logo: '/images/integrations/eduzz.png' },
  { name: 'Perfect Pay', logo: '/images/integrations/perfectpay.png' },
  { name: 'Kirvano', logo: '/images/integrations/kirvano.png' },
  { name: 'Ticto', logo: '/images/integrations/ticto.png' },
  { name: 'Cakto', logo: '/images/integrations/cakto.png' },
  { name: 'Cartpanda', logo: '/images/integrations/cartpanda.png' },
  { name: 'Payt', logo: '/images/integrations/payt.png' },
  { name: 'Mundpay', logo: '/images/integrations/mundpay.png' },
  { name: 'TriboPay', logo: '/images/integrations/tribopay.png' },
  { name: 'Lastlink', logo: '/images/integrations/lastlink.png' },
  { name: 'B4You', logo: '/images/integrations/b4you.png' },
  { name: 'Disrupty', logo: '/images/integrations/disrupty.png' },
  { name: 'Frendz', logo: '/images/integrations/frendz.png' },
];

const IntegrationsSection: React.FC = () => {
  return (
    <section id="integracoes" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors">
      
      {/* Background Sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 mb-12 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-widest rounded-full mb-6 border border-brand-blue/20">
          <Zap className="w-4 h-4" />
          Compatível com tudo
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
          Conecte Com Sua{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">
            Plataforma Favorita
          </span>
        </h2>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Detectamos o pagamento e liberamos o acesso no app. <br/>
          Sem planilhas, sem trabalho manual.
        </p>
      </div>

      {/* --- INÍCIO DO MARQUEE INFINITO --- */}
      <div className="relative flex flex-col gap-8 overflow-hidden py-8">
        
        {/* Fileira 1 - Indo para a Esquerda */}
        <div className="flex w-max hover:pause" style={{ animation: 'scroll-left 40s linear infinite' }}>
          {[...integrations, ...integrations].map((integration, idx) => (
            <div
              key={`${integration.name}-${idx}`}
              // MUDANÇA AQUI: dark:bg-white/5 (Vidro sutil) e dark:border-white/5
              className="mx-4 flex h-24 w-52 items-center justify-center rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm px-8 py-4 transition-all hover:border-brand-blue/50 hover:bg-white hover:shadow-lg dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10 dark:hover:border-white/20"
            >
              <img
                src={integration.logo}
                alt={integration.name}
                loading="lazy"
                // Mantive o brilho alto para o logo saltar do fundo escuro
                className="max-h-12 w-auto object-contain transition-all hover:scale-110 dark:brightness-200 dark:contrast-125" 
              />
            </div>
          ))}
        </div>

        {/* Fileira 2 - Indo para a Direita */}
        <div className="flex w-max hover:pause" style={{ animation: 'scroll-right 40s linear infinite' }}>
          {[...integrations.reverse(), ...integrations].map((integration, idx) => (
            <div
              key={`rev-${integration.name}-${idx}`}
              // MUDANÇA AQUI: dark:bg-white/5 (Vidro sutil) e dark:border-white/5
              className="mx-4 flex h-24 w-52 items-center justify-center rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm px-8 py-4 transition-all hover:border-brand-blue/50 hover:bg-white hover:shadow-lg dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10 dark:hover:border-white/20"
            >
              <img
                src={integration.logo}
                alt={integration.name}
                loading="lazy"
                className="max-h-12 w-auto object-contain transition-all hover:scale-110 dark:brightness-200 dark:contrast-125"
              />
            </div>
          ))}
        </div>

        {/* Gradientes Laterais (Fade) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-slate-50 dark:from-[#0B1120] to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-slate-50 dark:from-[#0B1120] to-transparent"></div>
      </div>
      {/* --- FIM DO MARQUEE --- */}

      {/* CTA Final */}
      <div className="text-center mt-12 relative z-10">
        <Link 
          to="/api-docs" 
          className="group inline-flex items-center gap-2 px-6 py-3 text-brand-blue hover:text-brand-coral font-bold transition-colors"
        >
          <span>Ver documentação da API</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .hover\\:pause:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
};

export default IntegrationsSection;