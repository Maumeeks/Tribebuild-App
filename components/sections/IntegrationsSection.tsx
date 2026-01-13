import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';

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
    <section id="integracoes" className="py-24 relative overflow-hidden bg-white dark:bg-neutral-950 transition-colors">
      
      {/* Background Sutil (Baseado no Aceternity) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-200/20 via-transparent to-transparent dark:from-neutral-800/20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 mb-16 text-center">
        
        {/* Badge Estilo Aceternity */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-medium rounded-full mb-8 border border-neutral-200 dark:border-neutral-700">
          <Zap className="w-3.5 h-3.5" />
          Integração Automática
        </div>
        
        {/* Título com Gradiente (O que você gostou no código) */}
        <h2 className="bg-gradient-to-b from-neutral-900 to-neutral-600 bg-clip-text text-center font-sans text-3xl font-bold text-transparent md:text-5xl dark:from-white dark:to-neutral-400 mb-6 tracking-tight">
          Trusted by the best companies
        </h2>
        
        <p className="mt-4 text-center font-sans text-base text-neutral-700 dark:text-neutral-400 max-w-lg mx-auto">
          Conectamos automaticamente com as maiores plataformas do mercado. Venda aprovada, acesso liberado.
        </p>
      </div>

      {/* --- MARQUEE INFINITO (Melhor UX que grade parada) --- */}
      <div className="relative flex flex-col gap-8 overflow-hidden py-4">
        
        {/* Fileira 1 - Esquerda */}
        <div className="flex w-max hover:pause" style={{ animation: 'scroll-left 50s linear infinite' }}>
          {[...integrations, ...integrations].map((integration, idx) => (
            <div
              key={`${integration.name}-${idx}`}
              className="mx-4 flex h-16 w-40 items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <img
                src={integration.logo}
                alt={integration.name}
                className="max-h-8 w-auto object-contain dark:invert dark:brightness-200" 
              />
            </div>
          ))}
        </div>

        {/* Fileira 2 - Direita */}
        <div className="flex w-max hover:pause" style={{ animation: 'scroll-right 50s linear infinite' }}>
          {[...integrations.reverse(), ...integrations].map((integration, idx) => (
            <div
              key={`rev-${integration.name}-${idx}`}
              className="mx-4 flex h-16 w-40 items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <img
                src={integration.logo}
                alt={integration.name}
                className="max-h-8 w-auto object-contain dark:invert dark:brightness-200"
              />
            </div>
          ))}
        </div>

        {/* Fades Laterais para suavidade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent"></div>
      </div>

      {/* CTA Final Clean */}
      <div className="text-center mt-12 relative z-10">
        <button className="group inline-flex items-center gap-2 px-6 py-3 text-neutral-900 dark:text-white font-medium hover:text-brand-blue transition-colors">
          <span>Ver documentação completa</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
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