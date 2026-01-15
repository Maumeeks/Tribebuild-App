import React, { useState } from 'react';
import { Check, Info, Loader2, Crown, Zap, Building2, Rocket, AlertCircle } from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const PlansPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const location = useLocation();
  const state = location.state as { expired?: boolean; message?: string };

  const plans = {
    monthly: [
      {
        id: 'starter',
        name: 'Starter',
        price: 67,
        period: '/mês',
        description: 'Quem está dando os primeiros passos.',
        icon: Zap,
        color: 'brand-blue',
        features: [
          '1 Aplicativo',
          '500 membros ativos',
          'Produtos e cursos ilimitados',
          'Comunidade + Feed',
          'Notificações Push ilimitados',
          'Integração (Hotmart/Kiwify)',
          'Domínio Personalizado',
          'Acesso a Tutoriais (Sem suporte humano)',
        ],
        stripeLink: 'https://buy.stripe.com/test_9B68wP0Zu4qq1Aa6hH2wU00',
        popular: false,
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 127,
        period: '/mês',
        description: 'Criadores em crescimento constante.',
        icon: Crown,
        color: 'brand-coral',
        features: [
          '3 Aplicativos',
          '1.500 membros ativos',
          'Produtos e cursos ilimitados',
          'Comunidade + Feed',
          'Notificações Push ilimitados',
          'Integração (Hotmart/Kiwify)',
          'Domínio Personalizado',
          'Suporte via E-mail (48h)',
        ],
        stripeLink: 'https://buy.stripe.com/test_fZubJ1eQkf54gv4gWl2wU01',
        popular: true,
      },
      {
        id: 'business',
        name: 'Business',
        price: 197,
        period: '/mês',
        description: 'Operações escalando sem limites.',
        icon: Building2,
        color: 'purple-500',
        features: [
          '5 Aplicativos',
          '2.800 membros ativos',
          'Produtos e cursos ilimitados',
          'Comunidade + Feed',
          'Notificações Push ilimitados',
          'Integração (Hotmart/Kiwify)',
          'Domínio Personalizado',
          'Suporte via E-mail (48h)',
        ],
        stripeLink: 'LINK_STRIPE_BUSINESS_MENSAL',
        popular: false,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 397,
        period: '/mês',
        description: 'Máxima potência e exclusividade.',
        icon: Rocket,
        color: 'indigo-500',
        features: [
          '10 Aplicativos',
          '6.000 membros ativos',
          'Produtos e cursos ilimitados',
          'Comunidade + Feed',
          'Notificações Push ilimitados',
          'Integração (Hotmart/Kiwify)',
          'Domínio Personalizado',
          'Suporte via E-mail (prioritário)',
          'White Label (sem marca TribeBuild)',
        ],
        stripeLink: 'LINK_STRIPE_ENTERPRISE_MENSAL',
        popular: false,
      },
    ],
    annual: [
      {
        id: 'starter',
        name: 'Starter',
        price: 56,
        originalPrice: 67,
        period: '/mês',
        billedAs: 'R$ 672/ano',
        description: 'Quem está dando os primeiros passos.',
        icon: Zap,
        color: 'brand-blue',
        features: [
          '1 Aplicativo',
          '500 membros ativos',
          'Produtos e cursos ilimitados',
          'Comunidade + Feed',
          'Notificações Push ilimitados',
          'Integração (Hotmart/Kiwify)',
          'Domínio Personalizado',
          'Acesso a Tutoriais (Sem suporte humano)',
        ],
        stripeLink: 'https://buy.stripe.com/test_28E14n8rWbSS5Qq7lL2wU03',
        popular: false,
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 106,
        originalPrice: 127,
        period: '/mês',
        billedAs: 'R$ 1.272/ano',
        description: 'Criadores em crescimento constante.',
        icon: Crown,
        color: 'brand-coral',
        features: [
          '3 Aplicativos',
          '1.500 membros ativos',
          'Produtos e cursos ilimitados',
          'Comunidade + Feed',
          'Notificações Push ilimitados',
          'Integração (Hotmart/Kiwify)',
          'Domínio Personalizado',
          'Suporte via E-mail (48h)',
        ],
        stripeLink: 'https://buy.stripe.com/test_fZucN537C9KK2Ee7lL2wU04',
        popular: true,
      },
      {
        id: 'business',
        name: 'Business',
        price: 164,
        originalPrice: 197,
        period: '/mês',
        billedAs: 'R$ 1.970/ano',
        description: 'Operações escalando sem limites.',
        icon: Building2,
        color: 'purple-500',
        features: [
          '5 Aplicativos',
          '2.800 membros ativos',
          'Produtos e cursos ilimitados',
          'Comunidade + Feed',
          'Notificações Push ilimitados',
          'Integração (Hotmart/Kiwify)',
          'Domínio Personalizado',
          'Suporte via E-mail (48h)',
        ],
        stripeLink: 'LINK_STRIPE_BUSINESS_ANUAL',
        popular: false,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 330,
        originalPrice: 397,
        period: '/mês',
        billedAs: 'R$ 3.970/ano',
        description: 'Máxima potência e exclusividade.',
        icon: Rocket,
        color: 'indigo-500',
        features: [
          '10 Aplicativos',
          '6.000 membros ativos',
          'Produtos e cursos ilimitados',
          'Comunidade + Feed',
          'Notificações Push ilimitados',
          'Integração (Hotmart/Kiwify)',
          'Domínio Personalizado',
          'Suporte via E-mail (prioritário)',
          'White Label (sem marca TribeBuild)',
        ],
        stripeLink: 'LINK_STRIPE_ENTERPRISE_ANUAL',
        popular: false,
      },
    ],
  };

  const currentPlans = plans[billingPeriod];

  const handleSelectPlan = (baseLink: string, planId: string) => {
    if (baseLink.includes('LINK_STRIPE')) {
      alert('Este plano estará disponível em breve. Por favor, entre em contato para liberar seu acesso.');
      return;
    }
    setLoadingPlan(planId);

    let fullLink = baseLink;

    if (user?.id) {
      fullLink += (fullLink.includes('?') ? '&' : '?') + `client_reference_id=${user.id}`;
    }

    if (user?.email) {
      fullLink += (fullLink.includes('?') ? '&' : '?') + `prefilled_email=${encodeURIComponent(user.email)}`;
    }

    const baseUrl = window.location.origin;
    fullLink +=
      (fullLink.includes('?') ? '&' : '?') +
      `success_url=${encodeURIComponent(baseUrl + '/subscription/success?session_id={CHECKOUT_SESSION_ID}')}` +
      `&cancel_url=${encodeURIComponent(baseUrl + '/subscription/cancel')}`;

    window.location.href = fullLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden font-['Inter']">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-20 right-[10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-brand-coral/10 dark:bg-brand-coral/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <TribeBuildLogo size="lg" showText={true} />
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            Escolha seu plano
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-2 font-medium">
            Desbloqueie todo o potencial da sua comunidade
          </p>
          {user?.email && (
            <p className="text-sm text-slate-500 dark:text-slate-500 font-bold">
              Conta atual: <span className="text-brand-blue">{user.email}</span>
            </p>
          )}
        </div>

        {/* Toggle Mensal/Anual */}
        <div className="flex justify-center mb-10">
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 inline-flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-brand-blue text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-brand-blue text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Anual
              <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mb-10 space-y-4">
          {state?.expired && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-shake">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl text-orange-600 shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-orange-900 dark:text-orange-100 text-sm uppercase tracking-wide">
                  Acesso restrito
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1 font-medium">
                  {state?.message || 'Para continuar usando o painel, por favor escolha um plano.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Plans Grid Responsivo */}
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentPlans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col ${
                  isPopular
                    ? 'border-brand-coral dark:border-brand-coral z-10 scale-105 shadow-brand-coral/10'
                    : 'border-slate-100 dark:border-slate-700 hover:border-brand-blue/30 dark:hover:border-brand-blue/30'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 w-max">
                    <span className="bg-brand-coral text-white text-[10px] font-black px-6 py-2 rounded-full shadow-lg shadow-brand-coral/30 uppercase tracking-widest border-4 border-slate-50 dark:border-slate-900">
                      Mais Escolhido
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col h-full">
                  {/* Plan Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-${plan.color}/10 dark:bg-slate-700/50 flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          plan.color === 'brand-blue'
                            ? 'text-blue-600'
                            : plan.color === 'brand-coral'
                            ? 'text-orange-500'
                            : plan.color === 'purple-500'
                            ? 'text-purple-500'
                            : 'text-indigo-500'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {plan.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-white">
                      <span className="text-xs font-bold text-slate-400">R$</span>
                      <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                      <span className="text-xs font-bold text-slate-400 self-end mb-1">{plan.period}</span>
                    </div>

                    {billingPeriod === 'annual' && 'originalPrice' in plan && (
                      <div className="mt-2 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Economia de 17%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 group">
                        <div className="mt-0.5 p-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex-shrink-0">
                          <Check className="w-3 h-3 stroke-[3px]" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-300 text-xs font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.stripeLink, plan.id)}
                    disabled={loadingPlan !== null}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-auto transform hover:-translate-y-1 active:scale-95 ${
                      isPopular
                        ? 'bg-brand-coral hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30'
                        : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white shadow-lg'
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </span>
                    ) : (
                      'Assinar Agora'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="max-w-4xl mx-auto mt-16 text-center pb-8">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
              <Check className="w-3 h-3 text-green-500" />
              Pagamento Seguro
            </span>
            <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
              <Check className="w-3 h-3 text-green-500" />
              Cancele quando quiser
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;