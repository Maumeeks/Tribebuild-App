import React, { useState } from 'react';
import {
  Search,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Ban,
  Gift,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Download,
  X,
  Info,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Tipo atualizado
interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'Starter' | 'Professional' | 'Business' | 'Enterprise';
  price: number;
  status: 'active' | 'trial' | 'canceled' | 'past_due' | 'paused';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  trialEndsAt: string | null;
  createdAt: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

// Mock atualizado
const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_1',
    userId: '1',
    userName: 'Maria Silva',
    userEmail: 'maria@email.com',
    plan: 'Professional',
    price: 127,
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2025-04-01',
    currentPeriodEnd: '2025-05-01',
    canceledAt: null,
    trialEndsAt: null,
    createdAt: '2025-01-15',
    stripeCustomerId: 'cus_xxx1',
    stripeSubscriptionId: 'sub_xxx1'
  },
  {
    id: 'sub_2',
    userId: '2',
    userName: 'João Santos',
    userEmail: 'joao@email.com',
    plan: 'Starter',
    price: 67,
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2025-04-10',
    currentPeriodEnd: '2025-05-10',
    canceledAt: null,
    trialEndsAt: null,
    createdAt: '2025-02-20',
    stripeCustomerId: 'cus_xxx2',
    stripeSubscriptionId: 'sub_xxx2'
  },
  {
    id: 'sub_3',
    userId: '3',
    userName: 'Ana Costa',
    userEmail: 'ana@email.com',
    plan: 'Starter',
    price: 0,
    status: 'trial',
    billingCycle: 'monthly',
    currentPeriodStart: '2025-04-25',
    currentPeriodEnd: '2025-05-02',
    canceledAt: null,
    trialEndsAt: '2025-05-02',
    createdAt: '2025-04-25',
    stripeCustomerId: 'cus_xxx3',
    stripeSubscriptionId: 'sub_xxx3'
  },
  {
    id: 'sub_4',
    userId: '4',
    userName: 'Pedro Henrique',
    userEmail: 'pedro@email.com',
    plan: 'Professional',
    price: 127,
    status: 'canceled',
    billingCycle: 'monthly',
    currentPeriodStart: '2025-03-15',
    currentPeriodEnd: '2025-04-15',
    canceledAt: '2025-04-10',
    trialEndsAt: null,
    createdAt: '2024-12-01',
    stripeCustomerId: 'cus_xxx4',
    stripeSubscriptionId: 'sub_xxx4'
  },
  {
    id: 'sub_5',
    userId: '5',
    userName: 'Carla Lima',
    userEmail: 'carla@email.com',
    plan: 'Business',
    price: 197,
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2025-04-05',
    currentPeriodEnd: '2025-05-05',
    canceledAt: null,
    trialEndsAt: null,
    createdAt: '2024-10-10',
    stripeCustomerId: 'cus_xxx5',
    stripeSubscriptionId: 'sub_xxx5'
  },
  {
    id: 'sub_6',
    userId: '6',
    userName: 'Grandes Negócios Ltda',
    userEmail: 'ceo@bigcorp.com',
    plan: 'Enterprise',
    price: 397,
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2025-04-01',
    currentPeriodEnd: '2025-05-01',
    canceledAt: null,
    trialEndsAt: null,
    createdAt: '2024-01-10',
    stripeCustomerId: 'cus_xxx6',
    stripeSubscriptionId: 'sub_xxx6'
  }
];

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Filtragem
  const filteredSubscriptions = mockSubscriptions.filter(sub => {
    const matchesSearch =
      sub.userName.toLowerCase().includes(search.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const mrr = mockSubscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + s.price, 0);

  const renderStatus = (status: Subscription['status']) => {
    const styles = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      trial: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      canceled: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      past_due: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
      paused: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
    };

    const icons = {
      active: CheckCircle,
      trial: Clock,
      canceled: XCircle,
      past_due: AlertTriangle,
      paused: Clock
    };

    const labels = {
      active: 'Ativa',
      trial: 'Trial',
      canceled: 'Cancelada',
      past_due: 'Inadimplente',
      paused: 'Pausada'
    };

    const Icon = icons[status];

    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border", styles[status])}>
        <Icon className="w-3.5 h-3.5" />
        {labels[status]}
      </span>
    );
  };

  const renderPlan = (plan: string) => {
    const styles: Record<string, string> = {
      'Starter': 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      'Professional': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30',
      'Business': 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900/30',
      'Enterprise': 'text-white bg-slate-900 dark:bg-slate-700 border-slate-700 dark:border-slate-600',
    };
    return (
      <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border", styles[plan] || styles['Starter'])}>
        {plan}
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-8 font-['Outfit'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Assinaturas</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gestão financeira e controle de planos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Geral</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockSubscriptions.length}</p>
            <CreditCard className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ativas</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{mockSubscriptions.filter(s => s.status === 'active').length}</p>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Trial</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{mockSubscriptions.filter(s => s.status === 'trial').length}</p>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Churn (Canceladas)</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{mockSubscriptions.filter(s => s.status === 'canceled').length}</p>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
        </div>
        <div className="bg-slate-900 dark:bg-slate-800 rounded-xl border border-slate-800 p-5 shadow-lg text-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">MRR Mensal</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold tracking-tight">{formatCurrency(mrr)}</p>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <div className="relative min-w-[140px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos Planos</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
              <option value="Business">Business</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div className="relative min-w-[140px]">
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${filterStatus === 'active' ? 'bg-green-500' : 'bg-slate-300'}`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-8 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos Status</option>
              <option value="active">Ativa</option>
              <option value="trial">Trial</option>
              <option value="canceled">Cancelada</option>
              <option value="past_due">Inadimplente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Assinaturas */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assinante</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {sub.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{sub.userName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{sub.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      {renderPlan(sub.plan)}
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{sub.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(sub.price)}</p>
                  </td>
                  <td className="px-6 py-4">
                    {renderStatus(sub.status)}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === sub.id ? null : sub.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpenId === sub.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-8 top-8 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-20 overflow-hidden animate-slide-up origin-top-right">
                          <button
                            onClick={() => { setSelectedSubscription(sub); setShowDetailModal(true); setMenuOpenId(null); }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver Detalhes
                          </button>
                          <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                            <ExternalLink className="w-3.5 h-3.5" /> Stripe Dashboard
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                          {sub.status === 'active' && (
                            <button className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                              <Ban className="w-3.5 h-3.5" /> Cancelar
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Detalhes da Assinatura (Clean) */}
      {showDetailModal && selectedSubscription && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white">Detalhes da Assinatura</h3>
              <button onClick={() => setShowDetailModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
                  {selectedSubscription.userName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-none">{selectedSubscription.userName}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedSubscription.userEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plano Atual</p>
                  <div className="flex items-center gap-2">
                    {renderPlan(selectedSubscription.plan)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {renderStatus(selectedSubscription.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Valor Recorrente</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(selectedSubscription.price)}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Ciclo de Cobrança</span>
                  <span className="font-medium text-slate-900 dark:text-white capitalize">{selectedSubscription.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}</span>
                </div>
                <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Próxima Renovação</span>
                  <span className="font-medium text-brand-blue">{formatDate(selectedSubscription.currentPeriodEnd)}</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-slate-500">Stripe ID</span>
                  <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{selectedSubscription.stripeSubscriptionId}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setShowDetailModal(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Fechar
                </button>
                <button className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase hover:bg-slate-800 transition-colors shadow-lg">
                  Gerenciar no Stripe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}