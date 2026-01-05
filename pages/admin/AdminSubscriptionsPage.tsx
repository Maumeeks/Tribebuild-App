
import React, { useState } from 'react';
import { 
  Search, 
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Ban,
  Gift,
  Receipt,
  DollarSign,
  TrendingUp,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Sparkles,
  ArrowRight,
  // Added Info to imports
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Tipo para assinatura
interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'Basic' | 'Pro' | 'Business';
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

// Mock de assinaturas para o painel mestre
const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_1',
    userId: '1',
    userName: 'Maria Silva',
    userEmail: 'maria@email.com',
    plan: 'Pro',
    price: 97,
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
    plan: 'Basic',
    price: 47,
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
    plan: 'Basic',
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
    plan: 'Pro',
    price: 97,
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
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100">● Ativa</span>;
      case 'trial':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-100">○ Trial</span>;
      case 'canceled':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-100">✕ Cancelada</span>;
      case 'past_due':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-orange-100">△ Inadimplente</span>;
      default:
        return null;
    }
  };

  const renderPlan = (plan: string) => {
    const colors: Record<string, string> = {
      'Basic': 'bg-slate-50 text-slate-500 border-slate-200',
      'Pro': 'bg-blue-50 text-blue-600 border-blue-100',
      'Business': 'bg-purple-50 text-purple-700 border-purple-100',
    };
    return (
      <span className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border", colors[plan])}>
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
    <div className="space-y-10 animate-fade-in font-['Inter']">
      {/* Header Estilizado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Gestão de Assinaturas</h1>
          <p className="text-slate-500 mt-1 font-medium text-lg">Controle de faturamento e planos do ecossistema</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-3 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-slate-100 shadow-sm">
            <Download className="w-4 h-4" />
            Exportar Faturamento
          </button>
        </div>
      </div>

      {/* Metrics Row - Tribe Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Geral</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-slate-900 leading-none">{mockSubscriptions.length}</p>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <CreditCard size={20} />
                </div>
              </div>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ativas</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-green-600 leading-none">{mockSubscriptions.filter(s => s.status === 'active').length}</p>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                    <CheckCircle size={20} />
                </div>
              </div>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Trial</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-amber-600 leading-none">{mockSubscriptions.filter(s => s.status === 'trial').length}</p>
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                    <Clock size={20} />
                </div>
              </div>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Canceladas</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-red-600 leading-none">{mockSubscriptions.filter(s => s.status === 'canceled').length}</p>
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                    <XCircle size={20} />
                </div>
              </div>
          </div>
          <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl text-white">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">MRR Mensal</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-black tracking-tighter leading-none">{formatCurrency(mrr)}</p>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-brand-blue">
                    <DollarSign size={20} />
                </div>
              </div>
          </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Localizar Assinante</label>
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                <input
                  type="text"
                  placeholder="Nome ou e-mail do assinante..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-5 py-4.5 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Filtrar por Plano</label>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full px-5 py-4.5 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
            >
              <option value="all">Todos os Planos</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Status da Fatura</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-5 py-4.5 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativa</option>
              <option value="trial">Trial</option>
              <option value="canceled">Cancelada</option>
              <option value="past_due">Inadimplente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assinante</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano & Ciclo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Atual</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Fatura</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-white shadow-sm transition-colors">
                          {sub.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 tracking-tight leading-none truncate">{sub.userName}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 truncate uppercase tracking-widest">{sub.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex">{renderPlan(sub.plan)}</div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{sub.billingCycle === 'monthly' ? 'Cobrança Mensal' : 'Cobrança Anual'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-base font-black text-slate-900 tracking-tight">{sub.price === 0 ? 'R$ 0,00' : formatCurrency(sub.price)}</p>
                  </td>
                  <td className="px-8 py-6">
                    {renderStatus(sub.status)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="relative inline-block">
                      <button 
                        onClick={() => setMenuOpenId(menuOpenId === sub.id ? null : sub.id)}
                        className="p-3 bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-900 border border-slate-100 rounded-xl shadow-sm transition-all"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {menuOpenId === sub.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                          <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-20 animate-slide-up origin-top-right overflow-hidden">
                            <p className="px-5 py-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Operações Financeiras</p>
                            <button 
                              onClick={() => { setSelectedSubscription(sub); setShowDetailModal(true); setMenuOpenId(null); }}
                              className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-brand-blue transition-all"
                            >
                              <Eye className="w-4 h-4" />
                              Histórico & Detalhes
                            </button>
                            <button className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-brand-blue transition-all">
                              <ExternalLink className="w-4 h-4" />
                              Gerenciar no Stripe
                            </button>
                            <div className="h-px bg-slate-50 my-2 mx-5" />
                            {sub.status === 'trial' && (
                              <button className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 transition-all">
                                <Gift className="w-4 h-4" />
                                Estender Período Trial
                              </button>
                            )}
                            {sub.status === 'active' && (
                              <button className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all">
                                <RefreshCw className="w-4 h-4" />
                                Processar Reembolso
                              </button>
                            )}
                            <button className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">
                              <Ban className="w-4 h-4" />
                              Encerrar Assinatura
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Exibindo <span className="text-slate-900">{filteredSubscriptions.length}</span> assinantes de {mockSubscriptions.length}
          </p>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white text-slate-300 rounded-xl border border-slate-100 disabled:opacity-30" disabled>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
                <span className="w-10 h-10 flex items-center justify-center bg-brand-blue text-white rounded-xl font-black text-sm shadow-lg shadow-blue-500/20">1</span>
                <span className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-slate-900 rounded-xl font-black text-sm border border-slate-100 cursor-pointer transition-all">2</span>
            </div>
            <button className="p-3 bg-white text-slate-400 hover:text-brand-blue rounded-xl border border-slate-100 shadow-sm transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MRR Snapshot Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <DollarSign size={16} className="text-blue-400" />
                </div>
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Receita Recorrente Global</h3>
            </div>
            <p className="text-5xl font-black tracking-tighter mb-2">{formatCurrency(mrr)}</p>
            <p className="text-sm font-medium text-white/50">Baseado em {mockSubscriptions.filter(s => s.status === 'active').length} contratos vigentes este mês.</p>
          </div>
          
          <div className="flex flex-col items-end gap-4 w-full md:w-auto">
             <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 w-full">
                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/20">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <p className="text-xl font-black tracking-tight">+15.2%</p>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Crescimento Mensal</p>
                </div>
             </div>
             <button className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                 Relatório Gerencial Completo
                 <ArrowRight size={16} />
             </button>
          </div>
        </div>
      </div>

      {/* Modal: Detalhes da Assinatura Estilizado */}
      {showDetailModal && selectedSubscription && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Receipt size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Extrato da Conta</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {selectedSubscription.id}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-3 hover:bg-white rounded-2xl transition-colors shadow-sm">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-8 bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                <div className="w-24 h-24 bg-brand-blue rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-white">
                  {selectedSubscription.userName[0]}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{selectedSubscription.userName}</h4>
                  <p className="text-slate-500 font-bold mb-6 truncate">{selectedSubscription.userEmail}</p>
                  <div className="flex flex-wrap gap-3">
                    {renderPlan(selectedSubscription.plan)}
                    {renderStatus(selectedSubscription.status)}
                    <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                      {selectedSubscription.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billing Info Table */}
              <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 mb-6">Detalhamento Técnico (Stripe Connect)</h5>
                  
                  <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden divide-y divide-slate-50">
                     <div className="p-6 flex justify-between items-center group hover:bg-slate-50/50 transition-colors">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Contrato</span>
                        <span className="text-sm font-black text-slate-900">{formatCurrency(selectedSubscription.price)}</span>
                     </div>
                     <div className="p-6 flex justify-between items-center group hover:bg-slate-50/50 transition-colors">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Início do Ciclo</span>
                        <span className="text-sm font-bold text-slate-700">{formatDate(selectedSubscription.currentPeriodStart)}</span>
                     </div>
                     <div className="p-6 flex justify-between items-center group hover:bg-slate-50/50 transition-colors">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próxima Renovação</span>
                        <span className="text-sm font-bold text-brand-blue">{formatDate(selectedSubscription.currentPeriodEnd)}</span>
                     </div>
                     {selectedSubscription.trialEndsAt && (
                        <div className="p-6 flex justify-between items-center bg-amber-50/30">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Término do Trial</span>
                            <span className="text-sm font-black text-amber-700">{formatDate(selectedSubscription.trialEndsAt)}</span>
                        </div>
                     )}
                     <div className="p-6 flex justify-between items-center group hover:bg-slate-50/50 transition-colors">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer ID</span>
                        <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">{selectedSubscription.stripeCustomerId}</span>
                     </div>
                  </div>
              </div>

              {/* Note / System Alert */}
              <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500">
                    <Info size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-900 uppercase tracking-tight">Gestão Automatizada</p>
                    <p className="text-[10px] text-blue-700 font-medium leading-relaxed mt-1">
                        Qualquer alteração feita aqui será refletida instantaneamente no acesso do produtor ao Builder e seus respectivos PWAs.
                    </p>
                  </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-4">
                <Button variant="ghost" onClick={() => setShowDetailModal(false)} className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px]">Fechar</Button>
                <button className="flex-1 h-14 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95">
                    Forçar Cancelamento
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
