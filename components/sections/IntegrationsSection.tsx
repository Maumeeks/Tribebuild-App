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
      
      {/* Background Sutil (Efeito de luz da marca) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-blue/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 mb-16 text-center">
        
        {/* Badge - Estilo Aceternity mas com COR DA MARCA */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-widest rounded-full mb-8 border border-brand-blue/20 backdrop-blur-sm">
          <Zap className="w-3.5 h-3.5" />
          Integração Automática
        </div>
        
        {/* Título - Tipografia Clean + Gradiente da Marca */}
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
          Conecte Com Sua{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">
            Plataforma Favorita
          </span>
        </h2>
        
        <p className="mt-4 text-center text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Detectamos o pagamento e liberamos o acesso no app automaticamente.
          <br className="hidden md:block" /> Sem planilhas, sem trabalho manual.
        </p>
      </div>

      {/* --- MARQUEE INFINITO (Glassmorphism Cards) --- */}
      <div className="relative flex flex-col gap-6 overflow-hidden py-4">
        
        {/* Fileira 1 - Esquerda */}
        <div className="flex w-max hover:pause" style={{ animation: 'scroll-left 50s linear infinite' }}>
          {[...integrations, ...integrations].map((integration, idx) => (
            <div
              key={`${integration.name}-${idx}`}
              className="mx-4 flex h-20 w-48 items-center justify-center rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md px-6 py-4 transition-all duration-300 hover:border-brand-blue/50 hover:bg-white hover:shadow-xl hover:shadow-brand-blue/10 hover:-translate-y-1 dark:border-white/5 dark:bg-white/5 dark:hover:border-brand-blue/30 dark:hover:bg-white/10"
            >
              <img
                src={integration.logo}
                alt={integration.name}
                className="max-h-10 w-auto object-contain transition-all opacity-80 hover:opacity-100 hover:scale-110 dark:brightness-200" 
              />
            </div>
          ))}
        </div>

        {/* Fileira 2 - Direita */}
        <div className="flex w-max hover:pause" style={{ animation: 'scroll-right 50s linear infinite' }}>
          {[...integrations.reverse(), ...integrations].map((integration, idx) => (
            <div
              key={`rev-${integration.name}-${idx}`}
              className="mx-4 flex h-20 w-48 items-center justify-center rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md px-6 py-4 transition-all duration-300 hover:border-brand-blue/50 hover:bg-white hover:shadow-xl hover:shadow-brand-blue/10 hover:-translate-y-1 dark:border-white/5 dark:bg-white/5 dark:hover:border-brand-blue/30 dark:hover:bg-white/10"
            >
              <img
                src={integration.logo}
                alt={integration.name}
                className="max-h-10 w-auto object-contain transition-all opacity-80 hover:opacity-100 hover:scale-110 dark:brightness-200"
              />
            </div>
          ))}
        </div>

        {/* Fades Laterais (Suaviza o corte) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-50 dark:from-[#0B1120] to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-50 dark:from-[#0B1120] to-transparent"></div>
      </div>

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