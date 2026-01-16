import React, { useState, useEffect, useRef } from 'react';
import { Check, Rocket, Zap, Crown, Building2, Clock, Shield, Gift, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  // --- LÓGICA DE ANIMAÇÃO NATIVA ---
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (sectionRef.current) observer.unobserve(sectionRef.current);
      }
    }, { threshold: 0.1 });

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      name: 'Starter',
      priceDisplay: isAnnual ? 56 : 67,
      description: 'Quem está dando os primeiros passos.',
      icon: Zap,
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
      priceDisplay: isAnnual ? 106 : 127,
      description: 'Criadores em crescimento constante.',
      icon: Crown,
      highlight: true,
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
      priceDisplay: isAnnual ? 164 : 197,
      description: 'Operações escalando sem limites.',
      icon: Building2,
      highlight: false,
      features: [
        '5 Aplicativos',
        '2.800 membros ativos',
        'Produtos e cursos ilimitados',
        'Comunidade + Feed',
        'Notificações Push ilimitados',
        'Integração (Hotmart/Kiwify)',
        'Domínio Personalizado',
        'Suporte via E-mail (24h)'
      ],
      cta: 'Selecionar Business',
      extraInfo: 'R$ 0,40 por membro extra'
    },
    {
      name: 'Enterprise',
      priceDisplay: isAnnual ? 330 : 397,
      description: 'Máxima potência e exclusividade.',
      icon: Rocket,
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
      extraInfo: 'R$ 0,30 por membro extra'
    }
  ];

  return (
    <section id="precos" ref={sectionRef} className="py-20 relative overflow-hidden transition-colors font-['Inter']">
      <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-[2px]"></div>
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/8 via-transparent to-transparent dark:from-brand-blue/15 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div
          className="text-center mb-10"
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

          {/* CORREÇÃO AQUI: Retângulo único com o Timer */}
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-brand-coral/10 dark:bg-brand-coral/20 rounded-2xl border border-brand-coral/30">
            <Clock className="w-5 h-5 text-brand-coral" />
            <span className="text-brand-coral font-bold text-sm md:text-base text-left leading-tight">
               Preço de lançamento acaba em: <span className="hidden md:inline"> </span>
               <br className="block md:hidden" />
               4d 11h 0m
            </span>
          </div>
        </div>

        {/* NOVO: Botão Toggle Mensal/Anual */}
        <div className="flex justify-center mb-10">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full inline-flex relative">
                <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all z-10 ${!isAnnual ? 'bg-white text-brand-blue shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Mensal
                </button>
                <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all z-10 flex items-center gap-2 ${isAnnual ? 'bg-white text-brand-blue shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Anual
                    <span className="bg-green-100 text-green-600 text-[9px] px-1.5 py-0.5 rounded-full">-15%</span>
                </button>
            </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => {
            const delay = 200 + (index * 100);
            return (
              <div
                key={plan.name}
                className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-8 transition-all duration-500 cursor-pointer ${plan.highlight ? 'border-2 border-brand-blue shadow-2xl shadow-brand-blue/10 dark:shadow-brand-blue/20 scale-105 z-10' : 'border border-slate-100 dark:border-slate-800 shadow-sm'} hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-blue/20 hover:border-brand-blue/50`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-max">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-blue text-white text-[10px] font-black rounded-full shadow-lg uppercase tracking-widest">
                      <Rocket className="w-3.5 h-3.5" /> Mais Popular
                    </span>
                  </div>
                )}
                {plan.name === 'Starter' && <div className="mb-4"><span className="px-3 py-1 bg-brand-coral/10 dark:bg-brand-coral/20 text-brand-coral text-[10px] font-black rounded-full uppercase tracking-tighter">7 dias grátis</span></div>}

                <div className={`mb-6 ${plan.highlight ? 'mt-2' : ''}`}>
                  <h3 className={`text-xl font-black tracking-tight ${plan.highlight ? 'text-brand-blue' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed h-10">{plan.description}</p>
                </div>
                <div className="mb-8 border-b border-slate-50 dark:border-slate-800 pb-6">
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold text-slate-400 dark:text-slate-500">R$</span>
                    <span className="text-5xl font-black text-slate-900 dark:text-white mx-1 tracking-tighter">{plan.priceDisplay}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">/mês</span>
                  </div>
                  {isAnnual && (
                      <p className="text-[10px] text-green-600 font-bold mt-2 bg-green-50 inline-block px-2 py-1 rounded">Cobrado anualmente (Economize 15%)</p>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 p-0.5 rounded-full flex-shrink-0 ${plan.highlight ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-400 text-xs font-bold leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4 justify-center">
                        <Info className="w-3 h-3" /><span>{plan.extraInfo}</span>
                    </div>
                    <button onClick={() => navigate('/register')} className={`block w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 text-center ${plan.highlight ? 'bg-brand-blue text-white hover:bg-brand-blue-dark shadow-xl shadow-brand-blue/30 hover:shadow-2xl hover:shadow-brand-blue/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm'} active:scale-95`}>{plan.cta}</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bônus */}
        <div style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 700ms ease-out 400ms, transform 700ms ease-out 400ms' }}>
          <div className="bg-gradient-to-r from-brand-blue/5 via-emerald-500/5 to-brand-coral/5 dark:from-brand-blue/10 dark:via-emerald-500/10 dark:to-brand-coral/10 rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full mb-4">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">Teste Grátis de Verdade</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">7 Dias Para Testar Tudo</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Crie seu app, configure tudo, veja funcionando. Se não for para você, cancele antes dos 7 dias e não paga nada. Risco Zero.</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-50 dark:border-slate-700">
                  <Gift className="w-5 h-5 text-brand-coral" />
                  <span className="text-brand-coral font-bold text-sm uppercase tracking-wide">Bônus Inclusos (Valor: R$497)</span>
                </div>
                <ul className="space-y-3">
                  {['Templates prontos - Copie e cole (R$197)', 'Guia de lançamento - Passo a passo (R$147)', 'Checklist de configuração - Nada esquecido (R$97)', 'Suporte prioritário (Pro/Business) (R$56)'].map((bonus, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
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