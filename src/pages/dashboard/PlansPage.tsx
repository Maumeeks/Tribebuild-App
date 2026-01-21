import React, { useState } from 'react';
import { Check, X, Crown, Zap, Building2, Rocket, Calendar, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

// --- CONFIGURAÇÃO DE TIPOS ---
interface Plan {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
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
      color: 'brand-blue',
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
      description: 'Quem está dando os primeiros passos.',
      popular: false,
    },
    {
      id: 'professional',
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
        { name: '3 Aplicativos PWA', included: true },
        { name: 'Até 1.500 membros ativos', included: true },
        { name: 'Produtos e cursos ilimitados', included: true },
        { name: 'Comunidade + Feed', included: true },
        { name: 'Domínio Personalizado', included: true },
        { name: 'Suporte via E-mail (48h)', included: true },
        { name: 'White Label', included: false },
      ],
      description: 'Criadores em crescimento constante.',
      popular: true,
    },
    {
      id: 'business',
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
        { name: '5 Aplicativos PWA', included: true },
        { name: 'Até 2.800 membros ativos', included: true },
        { name: 'Produtos e cursos ilimitados', included: true },
        { name: 'Comunidade + Feed', included: true },
        { name: 'Domínio Personalizado', included: true },
        { name: 'Suporte via E-mail (24h)', included: true },
        { name: 'White Label', included: false },
      ],
      description: 'Operações escalando sem limites.',
      popular: false,
    },
    {
      id: 'enterprise',
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
        { name: '10 Aplicativos PWA', included: true },
        { name: 'Até 6.000 membros ativos', included: true },
        { name: 'Produtos e cursos ilimitados', included: true },
        { name: 'Comunidade + Feed', included: true },
        { name: 'Domínio Personalizado', included: true },
        { name: 'Suporte Prioritário', included: true },
        { name: 'White Label (Sem marca)', included: true },
      ],
      description: 'Máxima potência e exclusividade.',
      popular: false,
    },
  ];

  // --- LÓGICA DE SELEÇÃO DO PLANO ---
  const rawPlanId = profile?.plan || 'starter';
  let currentPlanId = rawPlanId.toLowerCase();

  // Tratamento visual para free/trial aparecerem como starter
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
    <div className="space-y-10 font-['Inter']">
      {/* Header */}
      <div className="space-y-3 animate-slide-up">
        <h1 className="text-3xl font-black text-brand-blue tracking-tighter leading-tight">Meu Plano</h1>
        <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
          Escale sua operação com risco zero. Todos os planos possuem garantia de 7 dias.
        </p>
      </div>

      {/* Plano Atual Card */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="p-8 md:p-10 bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-800/50 dark:to-slate-800 border-b border-slate-50 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-lg",
                currentPlan.id === 'starter' ? 'bg-slate-500' :
                  currentPlan.id === 'professional' ? 'bg-blue-600' :
                    currentPlan.id === 'business' ? 'bg-purple-600' : 'bg-slate-900'
              )}>
                <currentPlan.icon className="w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded">
                    Plano Ativo
                  </span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentPlan.name}</h2>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                {formatCurrency(currentPlan.monthlyPrice)}
                <span className="text-lg font-bold text-slate-400">/mês</span>
              </p>
              <div className="flex items-center md:justify-end gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                <Calendar className="w-3.5 h-3.5" />
                Renovação Mensal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Mensal/Anual */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Escolha seu Upgrade</h2>
          </div>

          <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-full inline-flex self-center">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                billingPeriod === 'monthly'
                  ? "bg-white text-brand-blue shadow-md"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                billingPeriod === 'annual'
                  ? "bg-white text-brand-blue shadow-md"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              Anual
              <span className="bg-green-100 text-green-600 text-[9px] px-1.5 py-0.5 rounded-full">-15%</span>
            </button>
          </div>
        </div>

        {/* Lista de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plansData.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan.id;
            const displayPrice = billingPeriod === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);
            const periodLabel = billingPeriod === 'monthly' ? '/mês' : '/ano';

            return (
              <div
                key={plan.id}
                className={cn(
                  "bg-white dark:bg-slate-800 rounded-[2rem] border-2 p-6 relative transition-all duration-500 flex flex-col group",
                  isCurrentPlan
                    ? "border-brand-blue shadow-2xl shadow-blue-500/10"
                    : "border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-xl"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-full text-center px-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue text-white text-[9px] font-black rounded-full shadow-lg shadow-blue-500/30 uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" />
                      Recomendado
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 mt-2">
                  <div className={cn(
                    "w-12 h-12 rounded-[1rem] flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500",
                    plan.id === 'starter' ? 'bg-slate-500' :
                      plan.id === 'professional' ? 'bg-blue-600' :
                        plan.id === 'business' ? 'bg-purple-600' : 'bg-slate-900'
                  )}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-sm font-bold text-slate-400">R$</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mx-1">
                      {displayPrice}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{periodLabel}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {feature.included ? (
                        <div className="w-4 h-4 bg-blue-50 dark:bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-brand-blue stroke-[4px]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <X className="w-2.5 h-2.5 text-slate-300 dark:text-slate-500 stroke-[4px]" />
                        </div>
                      )}
                      <span className={cn(
                        "text-[10px] font-bold transition-colors leading-tight",
                        feature.included ? "text-slate-600 dark:text-slate-300" : "text-slate-300 dark:text-slate-600 line-through"
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
                    "w-full py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all active:scale-95",
                    isCurrentPlan
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-brand-blue text-white hover:bg-brand-blue-dark shadow-lg shadow-blue-500/20"
                  )}
                >
                  {isCurrentPlan ? 'Plano Atual' : 'Assinar Agora'}
                </button>

                {/* SELO DE GARANTIA ADICIONADO AQUI */}
                {!isCurrentPlan && (
                  <div className="flex items-center justify-center gap-1.5 mt-3 opacity-60">
                    <ShieldCheck className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">7 Dias de Garantia</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico e Cancelamento */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Histórico de Pagamentos</h2>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm p-16 text-center">
          <CreditCard className="w-16 h-16 text-slate-100 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">Nenhuma fatura registrada ainda.</p>
        </div>
      </div>

      <div className="text-center pt-8 border-t border-slate-100 mt-8 animate-slide-up">
        <button onClick={() => setRetentionModalOpen(true)} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline transition-colors uppercase tracking-widest">
          Gerenciar Assinatura ou Cancelar
        </button>
      </div>

      {/* Modais (Mantidos iguais, apenas ajustando visual se necessário) */}
      {retentionModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRetentionModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 text-center animate-slide-up">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Poxa, vai embora? 😢</h3>
            <p className="text-slate-500 mb-6">Seus apps serão desativados imediatamente.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setRetentionModalOpen(false)} className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase">Vou ficar!</button>
              <button onClick={() => { setRetentionModalOpen(false); setCancelModalOpen(true); }} className="text-slate-400 text-xs font-bold uppercase">Continuar Cancelamento</button>
            </div>
          </div>
        </div>
      )}

      {cancelModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCancelModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 text-center animate-slide-up">
            <h3 className="text-2xl font-black text-red-500 mb-2">Tem certeza?</h3>
            <p className="text-slate-500 mb-6">Essa ação não pode ser desfeita.</p>
            <button onClick={() => alert('Para cancelar, use o Portal do Cliente Stripe.')} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase mb-3">Sim, Cancelar</button>
            <button onClick={() => setCancelModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase">Voltar</button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {upgradeModalOpen && selectedPlanToUpgrade && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setUpgradeModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up overflow-hidden">
            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl",
              selectedPlanToUpgrade.id === 'starter' ? 'bg-slate-500' :
                selectedPlanToUpgrade.id === 'professional' ? 'bg-blue-600' :
                  selectedPlanToUpgrade.id === 'business' ? 'bg-purple-600' : 'bg-slate-900'
            )}>
              <selectedPlanToUpgrade.icon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Upgrade para {selectedPlanToUpgrade.name}
            </h3>
            <p className="text-slate-500 text-center mb-6 font-medium leading-relaxed">
              Pagamento 100% seguro com <br /> <strong>Garantia de 7 Dias Incondicional</strong>.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-10 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor a pagar:</span>
                <span className="text-2xl font-black text-brand-blue tracking-tighter">
                  {formatCurrency(billingPeriod === 'monthly' ? selectedPlanToUpgrade.monthlyPrice : selectedPlanToUpgrade.yearlyPrice)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmUpgrade}
                className="w-full py-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Ir para Pagamento Seguro
              </button>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
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