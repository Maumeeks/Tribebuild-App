import React, { useState } from 'react';
import { Check, Loader2, Crown, Zap, Building2, Rocket, AlertCircle, ShieldCheck } from 'lucide-react';
// ✅ CORREÇÃO 1: Ajuste dos caminhos de importação (apenas um nível '../')
import TribeBuildLogo from '../components/TribeBuildLogo';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';

const PlansPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { user } = useAuth();
  const location = useLocation();
  const state = location.state as { expired?: boolean; message?: string };

  const getPlanColors = (color: string) => {
    switch (color) {
      case 'brand-blue': return { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200' };
      case 'brand-coral': return { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200' };
      case 'purple-500': return { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200' };
      case 'indigo-500': return { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    }
  };

  const plansData = [
    {
      name: 'Starter',
      monthlyPrice: 67,
      yearlyPrice: 672,
      icon: Zap,
      color: 'brand-blue',
      stripeUrls: {
        monthly: 'https://buy.stripe.com/test_9B68wP0Zu4qq1Aa6hH2wU00',
        yearly: 'https://buy.stripe.com/test_28E14n8rWbSS5Qq7lL2wU03',
      },
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
      description: 'Quem está dando os primeiros passos.',
      popular: false,
    },
    {
      name: 'Professional',
      monthlyPrice: 127,
      yearlyPrice: 1272,
      icon: Crown,
      color: 'brand-coral',
      stripeUrls: {
        monthly: 'https://buy.stripe.com/test_fZubJ1eQkf54gv4gWl2wU01',
        yearly: 'https://buy.stripe.com/test_fZucN537C9KK2Ee7lL2wU04',
      },
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
      description: 'Criadores em crescimento constante.',
      popular: true,
    },
    {
      name: 'Business',
      monthlyPrice: 247,
      yearlyPrice: 2472,
      icon: Building2,
      color: 'purple-500',
      stripeUrls: {
        monthly: 'https://buy.stripe.com/test_9B63cv0Zu8GGdiSbC12wU02',
        yearly: 'https://buy.stripe.com/test_14A14n23yaOOdiSaxX2wU05',
      },
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
      description: 'Operações escalando sem limites.',
      popular: false,
    },
    {
      name: 'Enterprise',
      monthlyPrice: 397,
      yearlyPrice: 3970,
      icon: Rocket,
      color: 'indigo-500',
      stripeUrls: {
        monthly: 'https://buy.stripe.com/test_9B68wP9w07CC3Ii49z2wU06',
        yearly: 'https://buy.stripe.com/test_00waEX23y0aa0w6cG52wU07',
      },
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
      description: 'Máxima potência e exclusividade.',
      popular: false,
    },
  ];

  const handleSelectPlan = (plan: typeof plansData[0]) => {
    setLoadingPlan(plan.name.toLowerCase());

    let checkoutUrl = billingPeriod === 'monthly'
      ? plan.stripeUrls.monthly
      : plan.stripeUrls.yearly;

    if (user) {
      const separator = checkoutUrl.includes('?') ? '&' : '?';
      checkoutUrl = `${checkoutUrl}${separator}client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email || '')}`;
    }

    window.location.href = checkoutUrl;
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
          <Link to="/" className="inline-block mb-6">
            <TribeBuildLogo size="lg" showText={true} />
          </Link>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            Escolha seu plano
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-2 font-medium">
            Desbloqueie todo o potencial da sua comunidade
          </p>
          {/* Atualizado para Garantia */}
          <p className="text-sm text-green-600 dark:text-green-400 font-bold">
            ✨ 7 dias de garantia incondicional • Risco Zero
          </p>
          {user?.email && (
            <p className="text-sm text-slate-500 dark:text-slate-500 font-bold mt-2">
              Conta: <span className="text-brand-blue">{user.email}</span>
            </p>
          )}
        </div>

        {/* ✅ CORREÇÃO 2: Toggle Mensal/Anual com MUITO MAIS ESPAÇO (mb-24) */}
        <div className="flex justify-center mb-24">
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 inline-flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${billingPeriod === 'monthly'
                ? 'bg-brand-blue text-white shadow-lg'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${billingPeriod === 'annual'
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

        {/* Info Box - Expirado */}
        {state?.expired && (
          <div className="max-w-4xl mx-auto mb-10">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
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
          </div>
        )}

        {/* Plans Grid */}
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plansData.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            const colors = getPlanColors(plan.color);
            const displayPrice = billingPeriod === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);

            return (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col ${isPopular
                  ? 'border-brand-coral dark:border-brand-coral z-10 lg:scale-105 shadow-brand-coral/10'
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
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
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

                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-white">
                      <span className="text-xs font-bold text-slate-400">R$</span>
                      <span className="text-4xl font-black tracking-tighter">{displayPrice}</span>
                      <span className="text-xs font-bold text-slate-400 self-end mb-1">/mês</span>
                    </div>

                    {billingPeriod === 'annual' && (
                      <div className="mt-2 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400 line-through">
                          R$ {plan.monthlyPrice}/mês
                        </span>
                        <span className="text-[10px] font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Economia de 17%
                        </span>
                      </div>
                    )}
                  </div>

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

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loadingPlan !== null}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-auto transform hover:-translate-y-1 active:scale-95 ${isPopular
                      ? 'bg-brand-coral hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30'
                      : 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white shadow-lg'
                      }`}
                  >
                    {loadingPlan === plan.name.toLowerCase() ? (
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
        <div className="max-w-4xl mx-auto mt-16 text-center pb-8 border-t border-slate-200 dark:border-slate-800 pt-10">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-3 h-3 text-green-500" />
              7 dias de garantia
            </span>
            <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
              <Check className="w-3 h-3 text-green-500" />
              Pagamento Seguro
            </span>
            <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
              <Check className="w-3 h-3 text-green-500" />
              Cancele quando quiser
            </span>
          </div>

          <p className="mt-8 text-sm text-slate-400">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-brand-blue font-bold hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;