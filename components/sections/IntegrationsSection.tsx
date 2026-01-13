import React from 'react';
import { Zap, Check, ArrowRight } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

// Lista de integrações com seus logos
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
    <section id="integracoes" className="py-20 relative overflow-hidden transition-colors">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-slate-50/80 to-white/90 dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-950/90 backdrop-blur-[2px]"></div>
      
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/5 via-transparent to-transparent dark:from-brand-blue/10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-widest rounded-full mb-6 border border-brand-blue/20">
            <Zap className="w-4 h-4" />
            Integração Automática
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Conecte Com Sua{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">
              Plataforma Favorita
            </span>
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium mb-2">
            Venda aprovada → Aluno liberado automaticamente no seu app.
          </p>
          <p className="text-lg text-brand-coral font-semibold mb-4">
            Zero trabalho manual.
          </p>

          {/* Benefícios inline */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Check className="w-5 h-5 text-emerald-500" />
              <span>Webhook em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Check className="w-5 h-5 text-emerald-500" />
              <span>Liberação instantânea</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Check className="w-5 h-5 text-emerald-500" />
              <span>Suporte incluso</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Grid de Logos (CORRIGIDO: Fundo branco para visibilidade) */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 md:gap-6">
            {integrations.map((integration, index) => (
              <div
                key={integration.name}
                className="group bg-white dark:bg-slate-800/50 rounded-2xl p-4 md:p-6 flex items-center justify-center border border-slate-100 dark:border-slate-700 hover:border-brand-blue/50 dark:hover:border-brand-blue/50 hover:shadow-lg hover:shadow-brand-blue/10 transition-all duration-300 hover:-translate-y-1 aspect-[4/3]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Container Branco interno para garantir contraste do logo */}
                <div className="w-full h-full flex items-center justify-center bg-white rounded-xl p-2 md:p-3 shadow-inner">
                   <img
                    src={integration.logo}
                    alt={`Logo ${integration.name}`}
                    className="max-h-8 md:max-h-12 w-auto object-contain transition-all duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* CTA para mais integrações */}
        <ScrollReveal delay={300}>
          <div className="text-center mt-12">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Não encontrou sua plataforma? Integramos com qualquer uma via API.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 text-brand-blue hover:text-brand-coral font-bold transition-colors">
              Ver todas as integrações
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </ScrollReveal>

        {/* Como funciona - Mini explicação */}
        <ScrollReveal delay={400}>
          <div className="mt-16 bg-gradient-to-r from-brand-blue/5 via-slate-100/50 to-brand-coral/5 dark:from-brand-blue/10 dark:via-slate-800/50 dark:to-brand-coral/10 rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Como Funciona a Integração
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Passo 1 */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-black text-brand-blue">1</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Copie o Webhook</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No seu painel TribeBuild, copie a URL do webhook em 1 clique
                </p>
              </div>

              {/* Passo 2 */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-black text-brand-blue">2</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Cole na Plataforma</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Na Kiwify, Eduzz ou outra, cole na área de webhooks/postback
                </p>
              </div>

              {/* Passo 3 */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Pronto!</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Cada venda aprovada libera o aluno automaticamente no app
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default IntegrationsSection;