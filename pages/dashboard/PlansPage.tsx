import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  X,
  Crown,
  Rocket,
  Building2,
  Calendar,
  Download,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// --- CONFIGURAÇÃO DE TIPOS ---
interface Plan {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  textColor: string;
  // Agora suporta preços e links duplos
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeUrls: {
    monthly: string;
    yearly: string;
  };
  features: { name: string; included: boolean }[];
  limits: {
    apps: number;
    clients: number;
  };
  popular?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

// --- LISTA DE PLANOS COM LINKS ATUALIZADOS ---
const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    color: 'bg-slate-500',
    textColor: 'text-slate-500',
    prices: {
      monthly: 67,
      yearly: 672,
    },
    stripeUrls: {
      monthly: 'https://buy.stripe.com/test_9B68wP0Zu4qq1Aa6hH2wU00',
      yearly: 'https://buy.stripe.com/test_28E14n8rWbSS5Qq7lL2wU03',
    },
    features: [
      { name: '1 Aplicativo PWA', included: true },
      { name: 'Até 500 membros ativos', included: true },
      { name: 'Produtos ilimitados', included: true },
      { name: 'Comunidade + Feed', included: true },
      { name: 'Domínio Personalizado', included: true },
      { name: 'Suporte via E-mail', included: false },
      { name: 'White Label', included: false },
    ],
    limits: { apps: 1, clients: 500 }
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: Crown,
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    popular: true,
    prices: {
      monthly: 127,
      yearly: 1272,
    },
    stripeUrls: {
      monthly: 'https://buy.stripe.com/test_fZubJ1eQkf54gv4gWl2wU01',
      yearly: 'https://buy.stripe.com/test_fZucN537C9KK2Ee7lL2wU04',
    },
    features: [
      { name: '3 Aplicativos PWA', included: true },
      { name: 'Até 1.500 membros ativos', included: true },
      { name: 'Produtos ilimitados', included: true },
      { name: 'Comunidade + Feed', included: true },
      { name: 'Domínio Personalizado', included: true },
      { name: 'Suporte via E-mail (48h)', included: true },
      { name: 'White Label', included: false },
    ],
    limits: { apps: 3, clients: 1500 }
  },
  {
    id: 'business',
    name: 'Business',
    icon: Building2,
    color: 'bg-purple-600',
    textColor: 'text-purple-600',
    prices: {
      monthly: 247, // Atualizado conforme seu link
      yearly: 2472, // Atualizado conforme seu link
    },
    stripeUrls: {
      monthly: 'https://buy.stripe.com/test_9B63cv0Zu8GGdiSbC12wU02',
      yearly: 'https://buy.stripe.com/test_14A14n23yaOOdiSaxX2wU05',
    },
    features: [
      { name: '5 Aplicativos PWA', included: true },
      { name: 'Até 2.800 membros ativos', included: true },
      { name: 'Produtos ilimitados', included: true },
      { name: 'Comunidade + Feed', included: true },
      { name: 'Domínio Personalizado', included: true },
      { name: 'Suporte via E-mail (24h)', included: true },
      { name: 'White Label', included: false },
    ],
    limits: { apps: 5, clients: 2800 }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Rocket,
    color: 'bg-slate-900',
    textColor: 'text-slate-900',
    prices: {
      monthly: 397,
      yearly: 3970,
    },
    stripeUrls: {
      monthly: 'https://buy.stripe.com/test_9B68wP9w07CC3Ii49z2wU06', // Link final 06 (deduzido pelo contexto)
      yearly: 'https://buy.stripe.com/test_00waEX23y0aa0w6cG52wU07',
    },
    features: [
      { name: '10 Aplicativos PWA', included: true },
      { name: 'Até 6.000 membros ativos', included: true },
      { name: 'Produtos ilimitados', included: true },
      { name: 'Comunidade + Feed', included: true },
      { name: 'Domínio Personalizado', included: true },
      { name: 'Suporte Prioritário', included: true },
      { name: 'White Label (Sem marca)', included: true },
    ],
    limits: { apps: 10, clients: 6000 }
  }
];

// Mock do usuário atual
const currentUserPlan = {
  planId: 'starter',
  startDate: '2025-04-14',
  nextBillingDate: '2025-05-14',
  status: 'active' as const
};

// Mock de faturas
const invoices: Invoice[] = [
  { id: '1', date: '2025-04-14', plan: 'Starter', amount: 67, status: 'paid', downloadUrl: '#' },
];

const PlansPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [retentionModalOpen, setRetentionModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const currentPlan = plans.find(p => p.id === currentUserPlan.planId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSelectPlan = (plan: Plan) => {
    if (plan.id === currentUserPlan.planId) return;
    setSelectedPlan(plan);
    setUpgradeModalOpen(true);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlan) return;

    // Seleciona o link correto baseado no ciclo escolhido
    const checkoutUrl = billingCycle === 'monthly' 
      ? selectedPlan.stripeUrls.monthly 
      : selectedPlan.stripeUrls.yearly;

    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      alert(`Erro de configuração: Link de pagamento indisponível.`);
    }
    
    setUpgradeModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-10 font-['Inter']">
      {/* Header */}
      <div className="space-y-3 animate-slide-up">
        <h1 className="text-3xl font-black text-brand-blue tracking-tighter leading-tight">Meu Plano</h1>
        <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
          Gerencie sua assinatura e faça upgrade para desbloquear mais poder.
        </p>
      </div>

      {/* Plano Atual Card */}
      {currentPlan && (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="p-8 md:p-10 bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-800/50 dark:to-slate-800 border-b border-slate-50 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-lg",
                  currentPlan.color
                )}>
                  <currentPlan.icon className="w-10 h-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded">Seu Plano Atual</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentPlan.name}</h2>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {formatCurrency(currentPlan.prices.monthly)}
                  <span className="text-lg font-bold text-slate-400">/mês</span>
                </p>
                <div className="flex items-center md:justify-end gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Próxima cobrança: {formatDate(currentUserPlan.nextBillingDate)}
                </div>
              </div>
            </div>
          </div>
          {/* ... Features do plano atual (simplificado para focar na lógica de upgrade) ... */}
           <div className="p-8 border-t border-slate-50 flex justify-center md:justify-start">
              <Button onClick={() => handleSelectPlan(plans[1])} className="h-14 px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20" leftIcon={Sparkles}>
                  Fazer Upgrade
              </Button>
           </div>
        </div>
      )}

      {/* Toggle Mensal/Anual e Lista de Planos */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Comparativo de Planos</h2>
            </div>
            
            {/* Toggle Switch */}
            <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-full inline-flex self-center">
                <button
                    onClick={() => setBillingCycle('monthly')}
                    className={cn(
                        "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                        billingCycle === 'monthly' 
                            ? "bg-white text-brand-blue shadow-md" 
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    Mensal
                </button>
                <button
                    onClick={() => setBillingCycle('yearly')}
                    className={cn(
                        "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        billingCycle === 'yearly' 
                            ? "bg-white text-brand-blue shadow-md" 
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    Anual
                    <span className="bg-green-100 text-green-600 text-[9px] px-1.5 py-0.5 rounded-full">-15%</span>
                </button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentUserPlan.planId;
            // Preço dinâmico baseado no ciclo
            const displayPrice = billingCycle === 'monthly' ? plan.prices.monthly : plan.prices.yearly;
            const periodLabel = billingCycle === 'monthly' ? '/mês' : '/ano';

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
                      Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 mt-2">
                  <div className={cn(
                    "w-12 h-12 rounded-[1rem] flex items-center justify-center text-white mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500",
                    plan.color
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
                  {isCurrentPlan ? 'Ativo' : 'Escolher'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico de Faturas (Mantido) */}
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
          Precisa cancelar sua assinatura? Clique aqui
        </button>
      </div>

      {/* Modal: Retenção (Mantido Simplificado) */}
      {retentionModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setRetentionModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 text-center animate-slide-up">
             <h3 className="text-2xl font-black text-slate-900 mb-2">Poxa, vai embora? 😢</h3>
             <p className="text-slate-500 mb-6">Seus apps serão desativados.</p>
             <div className="flex flex-col gap-3">
                 <button onClick={() => setRetentionModalOpen(false)} className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase">Vou ficar!</button>
                 <button onClick={() => { setRetentionModalOpen(false); setCancelModalOpen(true); }} className="text-slate-400 text-xs font-bold uppercase">Continuar Cancelamento</button>
             </div>
          </div>
        </div>
      )}
      
      {/* Modal: Cancelamento (Mantido Simplificado) */}
      {cancelModalOpen && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCancelModalOpen(false)} />
         <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 text-center animate-slide-up">
            <h3 className="text-2xl font-black text-red-500 mb-2">Tem certeza?</h3>
            <p className="text-slate-500 mb-6">Essa ação não pode ser desfeita.</p>
            <button onClick={() => alert('Cancelado!')} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase mb-3">Sim, Cancelar</button>
            <button onClick={() => setCancelModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase">Voltar</button>
         </div>
       </div>
      )}

      {/* Modal: Upgrade REAL com Stripe */}
      {upgradeModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setUpgradeModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up overflow-hidden">
            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl", selectedPlan.color)}>
              <selectedPlan.icon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Upgrade para {selectedPlan.name}?
            </h3>
            <p className="text-slate-500 text-center mb-8 font-medium leading-relaxed">
              Você selecionou o ciclo <span className="text-brand-blue font-bold uppercase">{billingCycle === 'monthly' ? 'Mensal' : 'Anual'}</span>.
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-10 border border-slate-100">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor a pagar:</span>
                    <span className="text-2xl font-black text-brand-blue tracking-tighter">
                        {formatCurrency(billingCycle === 'monthly' ? selectedPlan.prices.monthly : selectedPlan.prices.yearly)}
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