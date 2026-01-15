import React, { useState } from 'react';
import { Check, Sparkles, Zap, Crown, Building2, Rocket, Clock, Shield, Gift, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();
  const { elementRef, isVisible } = useIntersectionObserver();

  // Definição exata da oferta solicitada
  const plans = [
    {
      name: 'Starter',
      // Lógica de preço: Se anual 672 (eq 56/mês), se mensal 67
      priceDisplay: isAnnual ? 56 : 67, 
      totalPrice: isAnnual ? 672 : 67,
      description: 'Quem está dando os primeiros passos.',
      icon: Zap,
      color: 'blue', // Referência visual para cores
      highlight: false,
      features: [
        '1 Aplicativo',
        '500 membros ativos',
        'Produtos e cursos ilimitados',
        'Comunidade + Feed',
        'Notificações Push ilimitados',
        'Integração (Hotmart/Kiwify)',
        'Domínio Personalizado',
        'Acesso a Tutoriais'
      ],
      cta: 'Começar Grátis',
      extraInfo: 'Sem cartão para testar'
    },
    {
      name: 'Professional',
      // Lógica de preço: Se anual 1272 (eq 106/mês), se mensal 127
      priceDisplay: isAnnual ? 106 : 127,
      totalPrice: isAnnual ? 1272 : 127,
      description: 'Criadores em crescimento constante.',
      icon: Crown,
      color: 'coral',
      highlight: true, // Destaque
      features: [
        '3 Aplicativos',
        '1.500 membros ativos',
        'Produtos e cursos ilimitados',
        'Comunidade + Feed',
        'Notificações Push ilimitados',
        'Integração (Hotmart/Kiwify)',
        'Domínio Personalizado',
        'Suporte via E-mail (48h)'
      ],
      cta: 'Escolher Professional',
      extraInfo: 'R$ 0,40 por membro extra'
    },
    {
      name: 'Business',
      // Lógica de preço: Se anual 1970 (eq 164/mês), se mensal 197
      priceDisplay: isAnnual ? 164 : 197,
      totalPrice: isAnnual ? 1970 : 197,
      description: 'Operações escalando sem limites.',
      icon: Building2,
      color: 'purple',
      highlight: false,
      features: [
        '5 Aplicativos',
        '2.800 membros ativos',
        'Produtos e cursos ilimitados',
        'Comunidade + Feed',
        'Notificações Push ilimitados',
        'Integração (Hotmart/Kiwify)',
        'Domínio Personalizado',
        'Suporte via E-mail (48h)'
      ],
      cta: 'Selecionar Business',
      extraInfo: 'R$ 0,40 por membro extra'
    },
    {
      name: 'Enterprise',
      // Lógica de preço: Se anual 3970 (eq 330/mês), se mensal 397
      priceDisplay: isAnnual ? 330 : 397,
      totalPrice: isAnnual ? 3970 : 397,
      description: 'Máxima potência e exclusividade.',
      icon: Rocket,
      color: 'indigo',
      highlight: false,
      features: [
        '10 Aplicativos',
        '6.000 membros ativos',
        'Produtos e cursos ilimitados',
        'Comunidade + Feed',
        'Notificações Push ilimitados',
        'Integração (Hotmart/Kiwify)',
        'Domínio Personalizado',
        'Suporte via E-mail (prioritário)',
        'White Label (sem marca TribeBuild)'
      ],
      cta: 'Selecionar Enterprise',
      extraInfo: 'R$ 0,30 por membro extra (desconto)'
    }
  ];

  return (
    <section id="precos" ref={elementRef} className="py-20 relative overflow-hidden transition-colors font-['Inter']">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-[2px]"></div>
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/8 via-transparent to-transparent dark:from-brand-blue/15 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header com Animação Fade In Up */}
        <div 
          className="text-center mb-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 700ms ease-out, transform 700ms ease-out'
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
            <span className="text-slate-400 text-sm line-through">Desenvolver um app custa R$15.000+</span>
            <span className="text-brand-coral font-bold text-sm">Aqui começa em R$67/mês</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Invista Menos Que Uma <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">Pizza Por Semana</span>
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6 font-medium">
            Menos de R$2,20 por dia para ter seu próprio app profissional. Quanto você perdeu em reembolsos esse mês?
          </p>
          
          {/* Timer */}
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-brand-coral/10 dark:bg-brand-coral/20 rounded-2xl border border-brand-coral/30">
            <Clock className="w-5 h-5 text-brand-coral" />
            <span className="text-brand-coral font-bold">Preço de lançamento acaba em: 4d 11h 0m</span>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 shadow-inner">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${!isAnnual ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 transform scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Mensal
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${isAnnual ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 transform scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Anual
              </button>
              <span className="ml-3 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-tighter mr-1">
                2 MESES GRÁTIS
              </span>
            </div>
          </div>
        </div>

        {/* Grid de Planos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            // Delay escalonado para cada card subir um depois do outro
            const delay = 200 + (index * 100); 

            return (
              <div 
                key={plan.name}
                className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-8 transition-all duration-500 cursor-pointer
                  ${plan.highlight 
                    ? 'border-2 border-brand-blue shadow-2xl shadow-brand-blue/10 dark:shadow-brand-blue/20 scale-105 z-10' 
                    : 'border border-slate-100 dark:border-slate-800 shadow-sm'
                  }
                  hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-blue/20 hover:border-brand-blue/50
                `}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`
                }}
              >
                {/* Badge de Popular (apenas Professional) */}
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-blue text-white text-[10px] font-black rounded-full shadow-lg uppercase tracking-widest">
                      <Rocket className="w-3.5 h-3.5" />
                      Mais Popular
                    </span>
                  </div>
                )}

                {/* Badge de 7 dias (apenas Starter) */}
                {plan.name === 'Starter' && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-brand-coral/10 dark:bg-brand-coral/20 text-brand-coral text-[10px] font-black rounded-full uppercase tracking-tighter">
                      7 dias grátis
                    </span>
                  </div>
                )}
                
                {/* Sob Medida (apenas Enterprise) */}
                {plan.name === 'Enterprise' && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-brand-coral/10 dark:bg-brand-coral/20 text-brand-coral text-[10px] font-black rounded-full uppercase tracking-tighter">
                      Alta Performance
                    </span>
                  </div>
                )}

                <div className={`mb-6 ${plan.highlight ? 'mt-2' : ''}`}>
                  <h3 className={`text-xl font-black tracking-tight ${plan.highlight ? 'text-brand-blue' : 'text-slate-900 dark:text-white'}`}>
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold text-slate-400 dark:text-slate-500">R$</span>
                    <span className="text-5xl font-black text-slate-900 dark:text-white mx-1 tracking-tighter">
                      {plan.priceDisplay}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">/mês</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 p-0.5 rounded-full ${
                        plan.highlight 
                        ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-tight">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6 pb-4 border-t border-slate-100 dark:border-slate-800 pt-4 justify-center">
                  <Info className="w-3.5 h-3.5" />
                  <span>{plan.extraInfo}</span>
                </div>

                <button 
                  onClick={() => navigate('/register')}
                  className={`block w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 text-center
                    ${plan.highlight 
                      ? 'bg-brand-blue text-white hover:bg-brand-blue-dark shadow-xl shadow-brand-blue/30 hover:shadow-2xl hover:shadow-brand-blue/40' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm'
                    }
                    active:scale-95
                  `}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* SEÇÃO DE BÔNUS */}
        <div 
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 700ms ease-out 400ms, transform 700ms ease-out 400ms'
          }}
        >
          <div className="bg-gradient-to-r from-brand-blue/5 via-emerald-500/5 to-brand-coral/5 dark:from-brand-blue/10 dark:via-emerald-500/10 dark:to-brand-coral/10 rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full mb-4">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">Teste Grátis</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">7 Dias Para Testar Tudo</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Crie seu app, configure tudo, veja funcionando. Se não for para você, cancele antes dos 7 dias e não paga nada.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-brand-coral" />
                  <span className="text-brand-coral font-bold">Bônus Exclusivos (R$497 em valor)</span>
                </div>
                <ul className="space-y-3">
                  {[
                    'Templates prontos - Copie e cole (R$197)',
                    'Guia de lançamento - Passo a passo (R$147)',
                    'Checklist de configuração - Nada esquecido (R$97)',
                    'Suporte prioritário (apenas no Pro/Business) (R$56)'
                  ].map((bonus, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span><strong>{bonus.split(' - ')[0]}</strong> - {bonus.split(' - ')[1]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;