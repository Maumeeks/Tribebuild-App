import React, { useState } from 'react';
import { Check, X, Crown, Zap, Building2, Rocket, Calendar, Sparkles, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { ExternalLink, Loader2 } from 'lucide-react';
import Button from '../../components/Button';

// --- CONFIGURAÇÃO DE TIPOS ---
interface Plan {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string; // Usado para ícones/detalhes, não fundo total
  monthlyPrice: number;
  yearlyPrice: number;
  stripeUrls: {
    monthly: string;
    yearly: string;
  };
  features: { name: string; included: boolean }[];
  description: string;
  popular?: boolean;
}

const PlansPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [retentionModalOpen, setRetentionModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<Plan | null>(null);

  const { user, profile } = useAuth();

  const plansData: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 67,
      yearlyPrice: 672,
      icon: Zap,
      color: 'text-blue-500',
      stripeUrls: {
        monthly: 'https://buy.stripe.com/test_9B68wP0Zu4qq1Aa6hH2wU00',
        yearly: 'https://buy.stripe.com/test_28E14n8rWbSS5Qq7lL2wU03',
      },
      features: [
        { name: '1 Aplicativo PWA', included: true },
        { name: 'Até 500 membros ativos', included: true },
        { name: 'Produtos e cursos ilimitados', included: true },
        { name: 'Comunidade + Feed', included: true },
        { name: 'Domínio Personalizado', included: true },
        { name: 'Suporte via E-mail', included: false },
        { name: 'White Label', included: false },
      ],
      description: 'Para quem está começando.',
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 127,
      yearlyPrice: 1272,
      icon: Crown,
      color: 'text-brand-coral', // Usando sua cor de marca
      stripeUrls: {
        monthly: 'https://buy.stripe.com/test_fZubJ1eQkf54gv4gWl2wU01',
        yearly: 'https://buy.stripe.com/test_fZucN537C9KK2Ee7lL2wU04',
      },
      features: [
        { name: '3 Aplicativos PWA', included: true },
        { name: 'Até 1.500 membros ativos', included: true },
        { name: 'Produtos e cursos ilimitados', included: true },
        { name: 'Comunidade + Feed', included: true },
        { name: 'Domínio Personalizado', included: true },
        { name: 'Suporte via E-mail (48h)', included: true },
        { name: 'White Label', included: false },
      ],
      description: 'Crescimento constante.',
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      monthlyPrice: 247,
      yearlyPrice: 2472,
      icon: Building2,
      color: 'text-purple-500',
      stripeUrls: {
        monthly: 'https://buy.stripe.com/test_9B63cv0Zu8GGdiSbC12wU02',
        yearly: 'https://buy.stripe.com/test_14A14n23yaOOdiSaxX2wU05',
      },
      features: [
        { name: '5 Aplicativos PWA', included: true },
        { name: 'Até 2.800 membros ativos', included: true },
        { name: 'Produtos e cursos ilimitados', included: true },
        { name: 'Comunidade + Feed', included: true },
        { name: 'Domínio Personalizado', included: true },
        { name: 'Suporte via E-mail (24h)', included: true },
        { name: 'White Label', included: false },
      ],
      description: 'Operações em escala.',
      popular: false,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 397,
      yearlyPrice: 3970,
      icon: Rocket,
      color: 'text-indigo-500',
      stripeUrls: {
        monthly: 'https://buy.stripe.com/test_9B68wP9w07CC3Ii49z2wU06',
        yearly: 'https://buy.stripe.com/test_00waEX23y0aa0w6cG52wU07',
      },
      features: [
        { name: '10 Aplicativos PWA', included: true },
        { name: 'Até 6.000 membros ativos', included: true },
        { name: 'Produtos e cursos ilimitados', included: true },
        { name: 'Comunidade + Feed', included: true },
        { name: 'Domínio Personalizado', included: true },
        { name: 'Suporte Prioritário', included: true },
        { name: 'White Label (Sem marca)', included: true },
      ],
      description: 'Máxima exclusividade.',
      popular: false,
    },
  ];

  // --- LÓGICA ---
  const rawPlanId = profile?.plan || 'starter';
  let currentPlanId = rawPlanId.toLowerCase();
  if (currentPlanId === 'free' || currentPlanId === 'trial') {
    currentPlanId = 'starter';
  }
  const currentPlan = plansData.find(p => p.id === currentPlanId) || plansData[0];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === currentPlan.id) return;
    setSelectedPlanToUpgrade(plan);
    setUpgradeModalOpen(true);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlanToUpgrade) return;
    setLoadingPlan(selectedPlanToUpgrade.name.toLowerCase());
    let checkoutUrl = billingPeriod === 'monthly'
      ? selectedPlanToUpgrade.stripeUrls.monthly
      : selectedPlanToUpgrade.stripeUrls.yearly;

    if (user) {
      const separator = checkoutUrl.includes('?') ? '&' : '?';
      checkoutUrl = `${checkoutUrl}${separator}client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email || '')}`;
    }
    window.location.href = checkoutUrl;
  };

  return (
    <div className="space-y-10 font-['Inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Meu Plano</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gerencie sua assinatura e limites. Garantia de 7 dias em qualquer upgrade.
          </p>
        </div>

        {/* Toggle Mensal/Anual Moderno */}
        <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl inline-flex self-start md:self-center border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              billingPeriod === 'monthly'
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              billingPeriod === 'annual'
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Anual
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">-15%</span>
          </button>
        </div>
      </div>

      {/* Plano Atual - Estilo Dashboard Card */}
      <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/10 shadow-inner",
              currentPlan.color
            )}>
              <currentPlan.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-bold text-2xl tracking-tight">{currentPlan.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-green-500 text-white">
                  Ativo
                </span>
              </div>
              <p className="text-slate-400 text-sm">Renovação automática mensal</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="flex items-baseline justify-center md:justify-end gap-1">
              <span className="text-sm font-medium text-slate-400">R$</span>
              <span className="text-4xl font-black text-white tracking-tighter">{formatCurrency(currentPlan.monthlyPrice).replace('R$', '').trim()}</span>
              <span className="text-sm font-medium text-slate-400">/mês</span>
            </div>
            <button className="text-xs text-brand-blue font-bold mt-2 hover:text-white transition-colors flex items-center justify-end gap-1 ml-auto">
              Gerenciar Faturas <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plansData.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan.id;
          const displayPrice = billingPeriod === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);

          return (
            <div
              key={plan.id}
              className={cn(
                "group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border transition-all duration-300 flex flex-col",
                plan.popular
                  ? "border-brand-blue/50 shadow-lg shadow-brand-blue/5 ring-1 ring-brand-blue/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50",
                isCurrentPlan && "opacity-75 grayscale-[0.5]"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  Recomendado
                </div>
              )}

              <div className="mb-6">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700", plan.color)}>
                  <plan.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 h-8">{plan.description}</p>
              </div>

              <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-400">R$</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{displayPrice}</span>
                  <span className="text-xs font-medium text-slate-400">/mês</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={cn(
                      "text-xs font-medium leading-tight",
                      feature.included ? "text-slate-600 dark:text-slate-300" : "text-slate-400 line-through decoration-slate-300"
                    )}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrentPlan}
                className={cn(
                  "w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95",
                  isCurrentPlan
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-blue dark:hover:bg-brand-blue hover:text-white dark:hover:text-white shadow-md"
                )}
              >
                {isCurrentPlan ? 'Plano Atual' : 'Upgrade'}
              </button>

              {!isCurrentPlan && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">7 Dias de Garantia</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
        <button onClick={() => setRetentionModalOpen(true)} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
          Cancelar Assinatura
        </button>
      </div>

      {/* Modais Clean */}
      {retentionModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRetentionModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-slide-up">
            <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😢</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Vai mesmo?</h3>
            <p className="text-sm text-slate-500 mb-6">Seus apps ficarão indisponíveis imediatamente.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setRetentionModalOpen(false)} className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold text-xs uppercase">Manter Plano</button>
              <button onClick={() => { setRetentionModalOpen(false); setCancelModalOpen(true); }} className="text-slate-400 text-xs font-bold hover:text-slate-600">Continuar Cancelamento</button>
            </div>
          </div>
        </div>
      )}

      {cancelModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCancelModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-slide-up">
            <h3 className="text-lg font-bold text-red-500 mb-2">Atenção</h3>
            <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
            <button onClick={() => alert('Para cancelar, use o Portal do Cliente Stripe.')} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs uppercase mb-3 transition-colors">Confirmar Cancelamento</button>
            <button onClick={() => setCancelModalOpen(false)} className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase transition-colors">Voltar</button>
          </div>
        </div>
      )}

      {/* Upgrade Modal Clean */}
      {upgradeModalOpen && selectedPlanToUpgrade && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setUpgradeModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-slate-50 dark:bg-slate-700", selectedPlanToUpgrade.color)}>
              <selectedPlanToUpgrade.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-1">
              Mudar para {selectedPlanToUpgrade.name}
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Cobrança proporcional imediata com garantia de 7 dias.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Total:</span>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(billingPeriod === 'monthly' ? selectedPlanToUpgrade.monthlyPrice : selectedPlanToUpgrade.yearlyPrice)}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmUpgrade}
                className="w-full py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Ir para Pagamento
              </button>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold uppercase tracking-wider text-xs transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;