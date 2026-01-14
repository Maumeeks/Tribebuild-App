import React, { useState } from 'react';
import { Check, Info, Loader2, Crown, Zap, Building2 } from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

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
        description: 'Perfeito para começar',
        icon: Zap,
        color: 'brand-blue',
        features: [
          '1 aplicativo',
          '500 usuários ativos',
          'Produtos ilimitados',
          'Conteúdos ilimitados',
          'Posts no feed ilimitados',
          'Notificações Push',
          'Comunidade',
          'Suporte WhatsApp',
        ],
        stripeLink: 'https://buy.stripe.com/test_9B68wP0Zu4qq1Aa6hH2wU00',
        popular: false,
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 127,
        period: '/mês',
        description: 'Para criadores em crescimento',
        icon: Crown,
        color: 'brand-coral',
        features: [
          '3 aplicativos',
          '2.000 usuários ativos',
          'Produtos ilimitados',
          'Conteúdos ilimitados',
          'Posts no feed ilimitados',
          'Notificações Push',
          'Comunidade',
          'Suporte WhatsApp',
          'Domínio personalizado',
          'Relatórios avançados',
        ],
        stripeLink: 'https://buy.stripe.com/test_fZubJ1eQkf54gv4gWl2wU01',
        popular: true,
      },
      {
        id: 'business',
        name: 'Business',
        price: 247,
        period: '/mês',
        description: 'Para operações em escala',
        icon: Building2,
        color: 'purple-500',
        features: [
          '10 aplicativos',
          '10.000 usuários ativos',
          'Produtos ilimitados',
          'Conteúdos ilimitados',
          'Posts no feed ilimitados',
          'Notificações Push',
          'Comunidade',
          'Suporte prioritário',
          'Domínio personalizado',
          'Relatórios avançados',
          'API access',
          'Consultoria mensal',
        ],
        stripeLink: 'https://buy.stripe.com/test_9B63cv0Zu8GGdiSbC12wU02',
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
        description: 'Perfeito para começar',
        icon: Zap,
        color: 'brand-blue',
        features: [
          '1 aplicativo',
          '500 usuários ativos',
          'Produtos ilimitados',
          'Conteúdos ilimitados',
          'Posts no feed ilimitados',
          'Notificações Push',
          'Comunidade',
          'Suporte WhatsApp',
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
        description: 'Para criadores em crescimento',
        icon: Crown,
        color: 'brand-coral',
        features: [
          '3 aplicativos',
          '2.000 usuários ativos',
          'Produtos ilimitados',
          'Conteúdos ilimitados',
          'Posts no feed ilimitados',
          'Notificações Push',
          'Comunidade',
          'Suporte WhatsApp',
          'Domínio personalizado',
          'Relatórios avançados',
        ],
        stripeLink: 'https://buy.stripe.com/test_fZucN537C9KK2Ee7lL2wU04',
        popular: true,
      },
      {
        id: 'business',
        name: 'Business',
        price: 206,
        originalPrice: 247,
        period: '/mês',
        billedAs: 'R$ 2.472/ano',
        description: 'Para operações em escala',
        icon: Building2,
        color: 'purple-500',
        features: [
          '10 aplicativos',
          '10.000 usuários ativos',
          'Produtos ilimitados',
          'Conteúdos ilimitados',
          'Posts no feed ilimitados',
          'Notificações Push',
          'Comunidade',
          'Suporte prioritário',
          'Domínio personalizado',
          'Relatórios avançados',
          'API access',
          'Consultoria mensal',
        ],
        stripeLink: 'https://buy.stripe.com/test_14A14n23yaOOdiSaxX2wU05',
        popular: false,
      },
    ],
  };

  const currentPlans = plans[billingPeriod];

  const handleSelectPlan = (baseLink: string, planId: string) => {
    setLoadingPlan(planId);

    let fullLink = baseLink;

    // 1. Passa o ID do usuário
    if (user?.id) {
      fullLink += (fullLink.includes('?') ? '&' : '?') + `client_reference_id=${user.id}`;
    }

    // 2. Prefill do email
    if (user?.email) {
      fullLink += (fullLink.includes('?') ? '&' : '?') + `prefilled_email=${encodeURIComponent(user.email)}`;
    }

    // 3. URLs de retorno
    const baseUrl = window.location.origin; // Removi o /# pois estamos usando BrowserRouter agora
    fullLink += (fullLink.includes('?') ? '&' : '?') +
      `success_url=${encodeURIComponent(baseUrl + '/subscription/success?session_id={CHECKOUT_SESSION_ID}')}` + // Adicionei a query session_id
      `&cancel_url=${encodeURIComponent(baseUrl + '/subscription/cancel')}`;

    // Redireciona
    window.location.href = fullLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-20 right-[10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-brand-coral/10 dark:bg-brand-coral/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <TribeBuildLogo size="lg" showText={true} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 dark:text-white mb-3">
            Escolha seu plano
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">
            Selecione o plano que melhor atende às suas necessidades
          </p>
          {user?.email && (
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Assinando como: <span className="font-semibold text-brand-blue">{user.email}</span>
            </p>
          )}
        </div>

        {/* Toggle Mensal/Anual */}
        <div className="flex justify-center mb-10">
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 inline-flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Anual
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mb-10 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-300">7 dias grátis para testar</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Experimente todos os recursos sem compromisso. Cancele quando quiser.
              </p>
            </div>
          </div>
          
          {/* Mensagem se foi redirecionado por falta de plano */}
          {state?.expired && (
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-300">
                  Acesso restrito ao dashboard
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  {state?.message || 'Para acessar o dashboard completo, escolha um plano abaixo.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {currentPlans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-2 transition-all hover:scale-[1.02] hover:shadow-2xl flex flex-col ${
                  isPopular
                    ? 'border-brand-coral dark:border-brand-coral'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-brand-coral text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      RECOMENDADO
                    </span>
                  </div>
                )}

                <div className="p-6 md:p-8 flex flex-col h-full">
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-${plan.color}/10 dark:bg-${plan.color}/20 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${plan.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-slate-500 dark:text-slate-400">R$</span>
                      <span className="text-5xl font-display font-extrabold text-slate-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
                    </div>
                    {billingPeriod === 'annual' && 'originalPrice' in plan && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm text-slate-400 line-through">
                          R$ {plan.originalPrice}/mês
                        </span>
                        <span className="text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
                          Economia de 17%
                        </span>
                      </div>
                    )}
                    {billingPeriod === 'annual' && 'billedAs' in plan && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Cobrado como {plan.billedAs}
                      </p>
                    )}
                  </div>

                  {/* Features (Com flex-1 para empurrar botão) */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.stripeLink, plan.id)}
                    disabled={loadingPlan !== null}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-auto ${
                      isPopular
                        ? 'bg-brand-coral hover:bg-brand-coral/90 text-white shadow-lg shadow-brand-coral/25'
                        : 'bg-brand-blue hover:bg-brand-blue-dark text-white shadow-lg shadow-brand-blue/25'
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirecionando...
                      </span>
                    ) : (
                      'Começar agora'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Você será redirecionado para o checkout seguro do{' '}
            <span className="font-semibold">Stripe</span>
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Pagamento seguro
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Cancele quando quiser
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Suporte em português
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;