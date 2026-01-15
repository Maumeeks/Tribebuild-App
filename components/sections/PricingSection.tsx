import React, { useState } from 'react';
import { Check, Sparkles, Zap, Crown, Building2, Rocket, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: isAnnual ? 672 : 67,
      monthlyEquivalent: isAnnual ? 56 : 67,
      description: 'Quem está dando os primeiros passos.',
      icon: Zap,
      color: 'blue',
      highlight: false,
      features: [
        '1 Aplicativo',
        '500 membros ativos',
        'Produtos e cursos ilimitados',
        'Comunidade + Feed ',
        'Notificações Push ilimitados',
        'Integração (Hotmart/Kiwify)',
        'Domínio Personalizado',
        'Acesso a Tutoriais'
      ],
      cta: 'Começar Grátis',
      overage: ''
    },
    {
      name: 'Professional',
      price: isAnnual ? 1272 : 127,
      monthlyEquivalent: isAnnual ? 106 : 127,
      description: 'Criadores em crescimento constante.',
      icon: Crown,
      color: 'coral',
      highlight: true,
      features: [
        '3 Aplicativos',
        '1.500 membros ativos',
        'Produtos e cursos ilimitados',
        'Comunidade + Feed ',
        'Notificações Push ilimitados',
        'Integração (Hotmart/Kiwify)',
        'Domínio Personalizado',
        'Suporte via E-mail (48h)',
      ],
      cta: 'Escolher Professional',
      overage: 'R$ 0,40 por membro extra'
    },
    {
      name: 'Business',
      price: isAnnual ? 1970 : 197,
      monthlyEquivalent: isAnnual ? 164 : 197,
      description: 'Operações escalando sem limites.',
      icon: Building2,
      color: 'purple',
      highlight: false,
      features: [
        '5 Aplicativos',
        '2.800 membros ativos',
        'Produtos e cursos ilimitados',
        'Comunidade + Feed ',
        'Notificações Push ilimitados',
        'Integração (Hotmart/Kiwify)',
        'Domínio Personalizado',
        'Suporte via E-mail (48h)',
      ],
      cta: 'Selecionar Business',
      overage: 'R$ 0,40 por membro extra'
    },
    {
      name: 'Enterprise',
      price: isAnnual ? 3970 : 397,
      monthlyEquivalent: isAnnual ? 330 : 397,
      description: 'Máxima potência e exclusividade.',
      icon: Rocket,
      color: 'indigo',
      highlight: false,
      features: [
        '10 Aplicativos',
        '6.000 membros ativos',
        'Produtos e cursos ilimitados',
        'Comunidade + Feed ',
        'Notificações Push ilimitados',
        'Integração (Hotmart/Kiwify)',
        'Domínio Personalizado',
        'Suporte via E-mail (prioritário)',
        'White Label (sem marca TribeBuild)',
      ],
      cta: 'Selecionar Enterprise',
      overage: 'R$ 0,30 por membro extra (desconto especial)'
    }
  ];

  return (
    <section id="precos" className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-coral/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4" />
            Investimento Inteligente
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Escolha o plano ideal para sua escala
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Comece grátis por 7 dias. Cancele a qualquer momento.
            <br />
            Sem contratos de fidelidade ou taxas escondidas.
          </p>
        </div>

        {/* Toggle Mensal/Anual */}
        <div className="flex justify-center mb-16">
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 inline-flex relative">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all relative z-10 ${
                !isAnnual
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all relative z-10 flex items-center gap-2 ${
                isAnnual
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Anual
              <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border-2 transition-all duration-300 hover:-translate-y-2 flex flex-col ${
                  plan.highlight
                    ? 'border-brand-coral shadow-2xl shadow-brand-coral/20 scale-105 z-10'
                    : 'border-slate-100 dark:border-slate-700 shadow-xl hover:shadow-2xl hover:border-brand-blue/30'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-coral text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-widest border-4 border-slate-50 dark:border-slate-900">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      plan.color === 'blue'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : plan.color === 'coral'
                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                        : plan.color === 'purple'
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    }`}
                  >
                    <Icon size={28} />
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-white">
                    <span className="text-sm font-bold text-slate-400">R$</span>
                    <span className="text-5xl font-black tracking-tighter">
                      {isAnnual ? plan.monthlyEquivalent : plan.price}
                    </span>
                    <span className="text-sm font-bold text-slate-400 self-end mb-1">/mês</span>
                  </div>
                  {isAnnual && (
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-2 uppercase tracking-wide">
                      Cobrado R$ {plan.price.toLocaleString('pt-BR')}/ano
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 group">
                      <div className="mt-0.5 p-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Custo por membro extra discreto */}
                {plan.overage && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4 text-center">
                    {plan.overage}
                  </p>
                )}

                <Button
                  onClick={() => navigate('/register')}
                  className={`w-full py-4 text-xs font-black uppercase tracking-widest shadow-xl ${
                    plan.highlight
                      ? 'bg-brand-coral hover:bg-orange-600 shadow-orange-500/20'
                      : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600'
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;