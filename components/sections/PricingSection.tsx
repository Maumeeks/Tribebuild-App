import React, { useState } from 'react';
import { Check, Sparkles, Zap, Crown, Building2, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: isAnnual ? 56 : 67,
      originalPrice: 67,
      description: 'Perfeito para começar sua jornada.',
      icon: Zap,
      color: 'brand-blue', // Azul
      highlight: false,
      features: [
        '1 Aplicativo',
        'Até 500 usuários ativos',
        'Produtos ilimitados',
        'Feed + Comunidade',
        'Notificações Push ilimitadas',
        'Integração Hotmart/Kiwify',
        'Domínio Personalizado',
        'Acesso a Tutoriais (Sem suporte humano)'
      ]
    },
    {
      name: 'Professional',
      price: isAnnual ? 106 : 127,
      originalPrice: 127,
      description: 'Para criadores em crescimento constante.',
      icon: Crown,
      color: 'brand-coral', // Coral
      highlight: true, // Destaque
      features: [
        '3 Aplicativos',
        'Até 1.500 usuários ativos',
        'R$ 0,40 por usuário extra',
        'Tudo do plano Starter',
        'Suporte via E-mail (48h)',
        'Relatórios de Engajamento',
        'Prioridade na fila de build'
      ]
    },
    {
      name: 'Business',
      price: isAnnual ? 164 : 197,
      originalPrice: 197,
      description: 'Para escalar sua operação sem limites.',
      icon: Building2,
      color: 'purple-500', // Roxo
      highlight: false,
      features: [
        '5 Aplicativos',
        'Até 2.800 usuários ativos',
        'R$ 0,40 por usuário extra',
        'Tudo do plano Professional',
        'Suporte via E-mail (24h)',
        'Múltiplos Administradores',
        'Gestão de Equipe'
      ]
    },
    {
      name: 'Enterprise',
      price: isAnnual ? 330 : 397,
      originalPrice: 397,
      description: 'Máxima potência e exclusividade.',
      icon: Rocket,
      color: 'indigo-500', // Indigo
      highlight: false,
      features: [
        '10 Aplicativos',
        'Até 10.000 usuários ativos',
        'R$ 0,30 por usuário extra (Desconto)',
        'Tudo do plano Business',
        'Suporte Prioritário VIP',
        'White Label (Sem marca Tribe)',
        'Gerente de Conta Dedicado'
      ]
    }
  ];

  return (
    <section id="precos" className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors relative overflow-hidden font-['Inter']">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-coral/5 dark:bg-brand-coral/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-300 text-xs font-black uppercase tracking-widest mb-4 border border-brand-blue/20">
            <Sparkles className="w-4 h-4" />
            Investimento Inteligente
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Escolha o plano ideal para sua escala
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Comece grátis por 7 dias. Cancele a qualquer momento. <br className="hidden md:block" />
            Sem contratos de fidelidade ou taxas escondidas.
          </p>
        </div>

        {/* Toggle Mensal/Anual */}
        <div className="flex justify-center mb-16">
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 inline-flex relative">
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
              <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            
            // Definição de cores dinâmicas para os ícones
            const iconBgColor = 
                plan.color === 'brand-blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                plan.color === 'brand-coral' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                plan.color === 'purple-500' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';

            return (
              <div 
                key={plan.name}
                className={`relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border-2 transition-all duration-300 hover:-translate-y-2 flex flex-col ${
                  plan.highlight 
                    ? 'border-brand-coral shadow-2xl shadow-brand-coral/20 scale-105 z-10' 
                    : 'border-slate-100 dark:border-slate-700 shadow-xl hover:shadow-2xl hover:border-brand-blue/30 dark:hover:border-brand-blue/30'
                }`}
              >
                {/* Badge de Popular */}
                {plan.highlight && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-max">
                    <span className="bg-brand-coral text-white text-[10px] font-black px-6 py-2 rounded-full shadow-lg shadow-brand-coral/30 uppercase tracking-widest border-4 border-slate-50 dark:border-slate-900">
                      Mais Popular
                    </span>
                  </div>
                )}

                {/* Header do Card */}
                <div className="mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${iconBgColor}`}>
                    <Icon size={28} />
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{plan.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium min-h-[40px] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Preço */}
                <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-white">
                    <span className="text-sm font-bold text-slate-400">R$</span>
                    <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                    <span className="text-sm font-bold text-slate-400 self-end mb-1">/mês</span>
                  </div>
                  {isAnnual && (
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-black mt-2 uppercase tracking-wide">
                      Cobrado R$ {(plan.price * 12).toLocaleString('pt-BR')}/ano
                    </p>
                  )}
                </div>

                {/* Lista de Features */}
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 group">
                      <div className="mt-0.5 p-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Botão de Ação */}
                <button 
                  onClick={() => navigate('/register')}
                  className={`w-full py-4 text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all transform active:scale-95 ${
                    plan.highlight 
                      ? 'bg-brand-coral hover:bg-orange-600 text-white shadow-orange-500/20' 
                      : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white'
                  }`}
                >
                  Começar Teste Grátis
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;