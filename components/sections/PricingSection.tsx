import React, { useState, useEffect } from 'react';
import { Check, Rocket, Info, Shield, Zap, Gift, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import ScrollReveal from '../ScrollReveal';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 67,
    yearlyPrice: 56,
    yearlyTotal: 672,
    savings: 132,
    badge: '7 dias grátis',
    features: [
      '1 aplicativo completo',
      '500 membros ativos',
      'Produtos e cursos ilimitados',
      'Comunidade + Feed',
      'Notificações Push ilimitadas',
      'Domínio personalizado',
      'Integrações (Hotmart, Kiwify)',
    ],
    cta: 'COMEÇAR GRÁTIS',
    highlighted: false,
    extraInfo: 'Sem cartão para testar'
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 127,
    yearlyPrice: 106,
    yearlyTotal: 1272,
    savings: 252,
    badge: 'Mais Popular',
    features: [
      '3 aplicativos completos',
      '2.000 membros ativos',
      'Produtos e cursos ilimitados',
      'Comunidade + Feed',
      'Notificações Push ilimitadas',
      'Domínio personalizado',
      'Integrações (Hotmart, Kiwify)',
      'Suporte prioritário (2h)',
    ],
    cta: 'ESCOLHER PROFESSIONAL',
    highlighted: true,
    extraInfo: 'R$ 0,15 por membro extra'
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 247,
    yearlyPrice: 206,
    yearlyTotal: 2472,
    savings: 492,
    badge: null,
    features: [
      '10 aplicativos completos',
      '10.000 membros ativos',
      'Produtos e cursos ilimitados',
      'Comunidade + Feed',
      'Notificações Push ilimitadas',
      'Domínio personalizado',
      'Integrações (Hotmart, Kiwify)',
      'Suporte VIP + Consultoria',
      'Onboarding personalizado',
    ],
    cta: 'FALAR COM CONSULTOR',
    highlighted: false,
    extraInfo: 'R$ 0,10 por membro extra'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    yearlyPrice: null,
    yearlyTotal: null,
    savings: null,
    badge: 'Sob medida',
    features: [
      'Apps ilimitados',
      'Membros ilimitados',
      'White-label total',
      'API dedicada',
      'SLA garantido 99.9%',
      'Servidor dedicado',
      'Gerente de conta exclusivo',
      'Desenvolvimento customizado',
      'Treinamento para equipe',
    ],
    cta: 'SOLICITAR PROPOSTA',
    highlighted: false,
    extraInfo: 'Para grandes operações'
  },
];

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  
  // Contador regressivo para urgência
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  
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
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="precos" className="py-20 relative overflow-hidden transition-colors">
      {/* Background */}
      <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-[2px]"></div>
      
      {/* Glow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/8 via-transparent to-transparent dark:from-brand-blue/15 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header com Ancoragem */}
        <ScrollReveal className="text-center mb-12">
          {/* Ancoragem de Valor */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
            <span className="text-slate-400 text-sm line-through">Desenvolver um app custa R$15.000+</span>
            <span className="text-brand-coral font-bold text-sm">Aqui começa em R$67/mês</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            Invista Menos Que Uma{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-coral">
              Pizza Por Semana
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6 font-medium">
            Menos de R$2,20 por dia para ter seu próprio app profissional. 
            Quanto você perdeu em reembolsos esse mês?
          </p>

          {/* Urgência com Contador */}
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-brand-coral/10 dark:bg-brand-coral/20 rounded-2xl border border-brand-coral/30">
            <Clock className="w-5 h-5 text-brand-coral" />
            <span className="text-brand-coral font-bold">
              Preço de lançamento acaba em: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </span>
          </div>

          {/* Toggle Mensal/Anual */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 shadow-inner mt-6 ml-4">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                !isAnnual
                  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 transform scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                isAnnual
                  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 transform scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Anual
            </button>
            <span className="ml-3 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-tighter">
              2 MESES GRÁTIS
            </span>
          </div>
        </ScrollReveal>

        {/* Grid de Planos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-8 transition-all duration-500 cursor-pointer
                ${plan.highlighted 
                  ? 'border-2 border-brand-blue shadow-2xl shadow-brand-blue/10 dark:shadow-brand-blue/20 scale-105' 
                  : 'border border-slate-100 dark:border-slate-800 shadow-sm'
                }
                hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-blue/20 hover:border-brand-blue/50
              `}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-blue text-white text-[10px] font-black rounded-full shadow-lg uppercase tracking-widest">
                    <Rocket className="w-3.5 h-3.5" />
                    Mais Popular
                  </span>
                </div>
              )}
              
              {plan.badge && !plan.highlighted && (
                <div className="mb-4">
                  <span className="px-3 py-1 bg-brand-coral/10 dark:bg-brand-coral/20 text-brand-coral text-[10px] font-black rounded-full uppercase tracking-tighter">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Nome do Plano */}
              <div className="mb-6">
                <h3 className={`text-xl font-black tracking-tight ${plan.highlighted ? 'text-brand-blue' : 'text-slate-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
              </div>

              {/* Preço */}
              <div className="mb-8">
                {plan.monthlyPrice ? (
                  <>
                    <div className="flex items-baseline">
                      <span className="text-lg font-bold text-slate-400 dark:text-slate-500">R$</span>
                      <span className="text-5xl font-black text-slate-900 dark:text-white mx-1 tracking-tighter">
                        {isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">/mês</span>
                    </div>
                    {isAnnual && plan.savings && (
                      <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-2 uppercase tracking-tighter">
                        Economia de R$ {plan.savings}/ano
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    Sob consulta
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className={cn(
                        "mt-0.5 p-0.5 rounded-full",
                        plan.highlighted ? "bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                    )}>
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Info Extra */}
              {plan.extraInfo && (
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6 pb-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <Info className="w-3.5 h-3.5" />
                  <span>{plan.extraInfo}</span>
                </div>
              )}

              {/* CTA */}
              <button
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300
                  ${plan.highlighted
                    ? 'bg-brand-blue text-white hover:bg-brand-blue-dark shadow-xl shadow-brand-blue/30 hover:shadow-2xl hover:shadow-brand-blue/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm'
                  }
                  active:scale-95
                `}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Garantia + Bônus */}
        <ScrollReveal>
          <div className="bg-gradient-to-r from-brand-blue/5 via-emerald-500/5 to-brand-coral/5 dark:from-brand-blue/10 dark:via-emerald-500/10 dark:to-brand-coral/10 rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              
              {/* Teste Grátis */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full mb-4">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">Teste Grátis</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  7 Dias Para Testar Tudo
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Crie seu app, configure tudo, veja funcionando. 
                  Se não for para você, cancele antes dos 7 dias e não paga nada.
                </p>
              </div>

              {/* Bônus */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-brand-coral" />
                  <span className="text-brand-coral font-bold">Bônus Exclusivos (R$497 em valor)</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span><strong>Templates prontos</strong> - Copie e cole (R$197)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span><strong>Guia de lançamento</strong> - Passo a passo (R$147)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span><strong>Checklist de configuração</strong> - Nada esquecido (R$97)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span><strong>Suporte prioritário</strong> - Resposta em até 2h (R$56)</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default PricingSection;