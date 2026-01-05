
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
  ExternalLink,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Pause,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Tipos
interface Plan {
  id: string;
  name: string;
  price: number;
  icon: React.ElementType;
  color: string;
  textColor: string;
  features: { name: string; included: boolean }[];
  limits: {
    apps: number | 'unlimited';
    clients: number | 'unlimited';
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

// Planos disponíveis
const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 47,
    icon: Rocket,
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    features: [
      { name: '1 Aplicativo PWA', included: true },
      { name: 'Até 100 clientes ativos', included: true },
      { name: 'Suporte por Email', included: true },
      { name: 'Notificações Push', included: true },
      { name: 'Domínio Personalizado', included: false },
      { name: 'Remover marca TribeBuild', included: false },
    ],
    limits: { apps: 1, clients: 100 }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 97,
    icon: Crown,
    color: 'bg-indigo-600',
    textColor: 'text-indigo-600',
    popular: true,
    features: [
      { name: '3 Aplicativos PWA', included: true },
      { name: 'Até 500 clientes ativos', included: true },
      { name: 'Suporte Prioritário', included: true },
      { name: 'Notificações Push', included: true },
      { name: 'Domínio Personalizado', included: true },
      { name: 'Remover marca TribeBuild', included: false },
    ],
    limits: { apps: 3, clients: 500 }
  },
  {
    id: 'business',
    name: 'Business',
    price: 197,
    icon: Building2,
    color: 'bg-slate-900',
    textColor: 'text-slate-900',
    features: [
      { name: 'Apps Ilimitados', included: true },
      { name: 'Clientes Ilimitados', included: true },
      { name: 'Suporte VIP (WhatsApp)', included: true },
      { name: 'Notificações Push', included: true },
      { name: 'Domínio Personalizado', included: true },
      { name: 'Remover marca TribeBuild', included: true },
    ],
    limits: { apps: 'unlimited', clients: 'unlimited' }
  }
];

// Mock de dados do usuário
const currentUserPlan = {
  planId: 'basic',
  startDate: '2025-04-14',
  nextBillingDate: '2025-05-14',
  status: 'active' as const
};

// Mock de faturas
const invoices: Invoice[] = [
  { id: '1', date: '2025-04-14', plan: 'Basic', amount: 47, status: 'paid', downloadUrl: '#' },
  { id: '2', date: '2025-03-14', plan: 'Basic', amount: 47, status: 'paid', downloadUrl: '#' },
  { id: '3', date: '2025-02-14', plan: 'Basic', amount: 47, status: 'paid', downloadUrl: '#' },
];

const PlansPage: React.FC = () => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [retentionModalOpen, setRetentionModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
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
    alert(`Upgrade para o plano ${selectedPlan?.name} realizado com sucesso!`);
    setUpgradeModalOpen(false);
    setSelectedPlan(null);
  };

  const handleCancelPlan = () => {
    alert('Assinatura cancelada. Você terá acesso até o final do período pago.');
    setCancelModalOpen(false);
  };

  return (
    <div className="space-y-10 font-['Inter']">
      {/* Header */}
      <div className="space-y-3 animate-slide-up">
        <h1 className="text-3xl font-black text-brand-blue tracking-tighter leading-tight">Meu Plano</h1>
        <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
          Gerencie sua assinatura, visualize faturas e faça upgrade para desbloquear novos recursos e limites para seus aplicativos.
        </p>
      </div>

      {/* Plano Atual */}
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
                  {formatCurrency(currentPlan.price)}
                  <span className="text-lg font-bold text-slate-400">/mês</span>
                </p>
                <div className="flex items-center md:justify-end gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Próxima cobrança: {formatDate(currentUserPlan.nextBillingDate)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  {feature.included ? (
                    <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-green-600 stroke-[3px]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <X className="w-3.5 h-3.5 text-slate-300 stroke-[3px]" />
                    </div>
                  )}
                  <span className={cn(
                    "text-sm font-bold",
                    feature.included ? "text-slate-700" : "text-slate-400"
                  )}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Botões do card - APENAS Upgrade */}
            <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-50 pt-8">
              {currentPlan.id !== 'business' ? (
                <Button
                  onClick={() => handleSelectPlan(plans[1])} // Default to Pro
                  className="h-14 px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
                  leftIcon={Sparkles}
                >
                  Fazer Upgrade do Plano
                </Button>
              ) : (
                <div className="flex items-center gap-3 text-green-600 bg-green-50 px-6 py-4 rounded-[1.5rem] border border-green-100 shadow-sm animate-fade-in">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Status VIP</p>
                    <p className="text-sm font-black tracking-tight">Você já está no melhor plano disponível!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Todos os Planos */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Comparativo de Planos</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentUserPlan.planId;
            return (
              <div
                key={plan.id}
                className={cn(
                  "bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 p-10 relative transition-all duration-500 flex flex-col group",
                  isCurrentPlan
                    ? "border-brand-blue shadow-2xl shadow-blue-500/10"
                    : "border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-xl"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-blue text-white text-[10px] font-black rounded-full shadow-lg shadow-blue-500/30 uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5" />
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-10">
                  <div className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500",
                    plan.color
                  )}>
                    <plan.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-lg font-bold text-slate-400">R$</span>
                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mx-1">{plan.price}</span>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 bg-blue-50 dark:bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-brand-blue stroke-[4px]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <X className="w-3 h-3 text-slate-300 dark:text-slate-500 stroke-[4px]" />
                        </div>
                      )}
                      <span className={cn(
                        "text-xs font-bold transition-colors",
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
                    "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95",
                    isCurrentPlan
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-brand-blue text-white hover:bg-brand-blue-dark shadow-xl shadow-blue-500/20"
                  )}
                >
                  {isCurrentPlan ? 'Plano Ativo' : 'Escolher este plano'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico de Faturas */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Histórico de Pagamentos</h2>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
          {invoices.length === 0 ? (
            <div className="p-16 text-center">
              <CreditCard className="w-16 h-16 text-slate-100 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">Nenhuma fatura registrada ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fatura</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-brand-blue shadow-sm transition-all">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white tracking-tight leading-tight">{formatDate(invoice.date)}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {invoice.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">TribeBuild {invoice.plan}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(invoice.amount)}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border",
                          invoice.status === 'paid'
                            ? "bg-green-50 text-green-600 border-green-100"
                            : invoice.status === 'pending'
                            ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        )}>
                          {invoice.status === 'paid' ? '● Pago' : invoice.status === 'pending' ? '○ Pendente' : '✕ Falhou'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <a
                          href={invoice.downloadUrl}
                          className="inline-flex p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-brand-blue border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all"
                          title="Baixar Nota Fiscal (PDF)"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Link discreto de cancelamento - NO FINAL DA PÁGINA */}
      <div className="text-center pt-8 border-t border-slate-100 mt-8 animate-slide-up">
        <button
          onClick={() => setRetentionModalOpen(true)}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 underline transition-colors uppercase tracking-widest"
        >
          Precisa cancelar sua assinatura? Clique aqui
        </button>
      </div>

      {/* Modal de Retenção (aparece ANTES do cancelamento) */}
      {retentionModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setRetentionModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 md:p-10 animate-slide-up overflow-hidden">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Heart className="w-10 h-10 text-brand-blue animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                Sentiremos sua falta! 😢
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Antes de ir, gostaríamos de oferecer algumas alternativas para ajudar você a continuar crescendo seu negócio.
              </p>
            </div>

            {/* Opções de Retenção */}
            <div className="space-y-4 mb-8">
              {/* Opção 1: Desconto */}
              <button
                onClick={() => {
                  alert('Parabéns! Você ganhou 30% de desconto nos próximos 3 meses! O desconto será aplicado automaticamente na próxima fatura.');
                  setRetentionModalOpen(false);
                }}
                className="w-full p-5 border-2 border-green-100 bg-green-50/30 rounded-[1.5rem] text-left hover:border-green-400 hover:bg-green-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                    <span className="text-white font-black text-xl">%</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">Ganhe 30% OFF</p>
                    <p className="text-xs text-slate-500 font-medium">Desconto garantido nos próximos 3 meses</p>
                  </div>
                </div>
              </button>

              {/* Opção 2: Pausar */}
              <button
                onClick={() => {
                  alert('Sua assinatura foi pausada por 30 dias. Você não será cobrado neste período e seus apps continuarão ativos como cortesia!');
                  setRetentionModalOpen(false);
                }}
                className="w-full p-5 border-2 border-blue-100 bg-blue-50/30 rounded-[1.5rem] text-left hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <Pause className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">Pausar por 30 dias</p>
                    <p className="text-xs text-slate-500 font-medium">Fique um mês inteiro sem nenhuma cobrança</p>
                  </div>
                </div>
              </button>

              {/* Opção 3: Falar com suporte */}
              <button
                onClick={() => {
                  window.open('https://wa.me/5561982199922', '_blank');
                  setRetentionModalOpen(false);
                }}
                className="w-full p-5 border-2 border-slate-100 bg-slate-50/30 rounded-[1.5rem] text-left hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">Falar com Consultor</p>
                    <p className="text-xs text-slate-500 font-medium">Podemos te ajudar com algum problema técnico?</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Motivo do cancelamento */}
            <div className="mb-8">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Pode nos contar o motivo? (opcional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all text-sm"
              >
                <option value="">Selecione um motivo...</option>
                <option value="expensive">Está muito caro para mim</option>
                <option value="not_using">Não estou usando no momento</option>
                <option value="missing_features">Faltam algumas funcionalidades</option>
                <option value="competitor">Vou usar outro serviço similar</option>
                <option value="temporary">É temporário, pretendo voltar</option>
                <option value="other">Outro motivo específico</option>
              </select>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setRetentionModalOpen(false)}
                className="w-full py-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                Vou ficar! 🎉
              </button>
              <button
                onClick={() => {
                  setRetentionModalOpen(false);
                  setCancelModalOpen(true);
                }}
                className="w-full py-4 text-slate-400 hover:text-red-500 font-black uppercase tracking-widest text-[9px] transition-colors"
              >
                Não quero os benefícios, cancelar assinatura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Final de Cancelamento */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setCancelModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Confirmar cancelamento?
            </h3>
            <p className="text-slate-500 text-center mb-10 font-medium leading-relaxed">
              Sua assinatura premium será encerrada no dia <span className="font-black text-slate-900">{formatDate(currentUserPlan.nextBillingDate)}</span>. Após esta data, seus aplicativos deixarão de funcionar para seus alunos.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCancelPlan}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 transition-all active:scale-95"
              >
                Sim, desejo cancelar agora
              </button>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Não, manter meu plano
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upgrade */}
      {upgradeModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setUpgradeModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up overflow-hidden">
            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl", selectedPlan.color)}>
              <selectedPlan.icon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Mudar para plano {selectedPlan.name}?
            </h3>
            <p className="text-slate-500 text-center mb-8 font-medium leading-relaxed">
              Você terá acesso imediato aos novos limites de {selectedPlan.limits.apps} apps e {selectedPlan.limits.clients} clientes.
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-10 border border-slate-100">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Novo Valor Mensal:</span>
                    <span className="text-2xl font-black text-brand-blue tracking-tighter">{formatCurrency(selectedPlan.price)}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmUpgrade}
                className="w-full py-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                Confirmar Upgrade Agora
              </button>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Não, manter atual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
