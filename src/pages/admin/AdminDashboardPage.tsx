import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  DollarSign,
  Smartphone,
  TrendingUp,
  ArrowRight,
  Eye,
  MoreHorizontal,
  Activity,
  Server,
  Database,
  Smartphone as PhoneIcon,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Mock de métricas mestras
const metrics = [
  {
    label: 'Total de Produtores',
    value: '156',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    label: 'Assinaturas Ativas',
    value: '142',
    change: '+8%',
    changeType: 'positive',
    icon: CreditCard,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20'
  },
  {
    label: 'MRR (Recorrente)',
    value: 'R$ 14.280',
    change: '+15%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20'
  },
  {
    label: 'PWAs Criados',
    value: '89',
    change: '+23%',
    changeType: 'positive',
    icon: Smartphone,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20'
  },
];

// Mock de últimos cadastros
const recentUsers = [
  { id: '1', name: 'Maria Silva', email: 'maria@email.com', phone: '11999999999', plan: 'Professional', status: 'active', createdAt: '2025-04-26T14:00:00' },
  { id: '2', name: 'João Santos', email: 'joao@email.com', phone: '21988888888', plan: 'Starter', status: 'active', createdAt: '2025-04-26T10:00:00' },
  { id: '3', name: 'Ana Costa', email: 'ana@email.com', phone: null, plan: 'Starter', status: 'trial', createdAt: '2025-04-25T18:00:00' },
  { id: '4', name: 'Pedro Henrique', email: 'pedro@email.com', phone: '31977777777', plan: 'Professional', status: 'canceled', createdAt: '2025-04-25T09:00:00' },
  { id: '5', name: 'Carla Lima', email: 'carla@email.com', phone: '41966666666', plan: 'Business', status: 'active', createdAt: '2025-04-24T15:00:00' },
  { id: '6', name: 'Big Corp Ltda', email: 'contact@bigcorp.com', phone: '11988887777', plan: 'Enterprise', status: 'active', createdAt: '2025-04-23T11:00:00' },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Agora';
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    return `${diffDays}d atrás`;
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">Ativo</span>;
      case 'trial':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">Trial</span>;
      case 'canceled':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Cancelado</span>;
      default:
        return null;
    }
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

  return (
    <div className="space-y-8 font-['Inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitoramento em tempo real do ecossistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
            Admin Mode
          </span>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2.5 rounded-lg", metric.bg)}>
                <metric.icon className={cn("w-5 h-5", metric.color)} />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                <TrendingUp className="w-3 h-3" /> {metric.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{metric.value}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Tabela de Usuários */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Novos Clientes
            </h2>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Ver Todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plano / Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Data</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                          <p className="text-xs text-slate-500 mt-1 truncate max-w-[120px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        {renderPlan(user.plan)}
                        {renderStatus(user.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.phone ? (
                        <a
                          href={`https://wa.me/55${user.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600 italic">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-medium text-slate-500">
                      {formatRelativeTime(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status - Estilo Dashboard Técnico */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4" /> System Health
            </h3>

            <div className="space-y-4">
              {[
                { label: 'API Gateway', status: 'Online', icon: Server, color: 'text-emerald-400' },
                { label: 'Database', status: 'Online', icon: Database, color: 'text-emerald-400' },
                { label: 'PWA Render', status: 'Processing', icon: PhoneIcon, color: 'text-blue-400' },
              ].map((svc, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <svc.icon className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-300">{svc.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse bg-current", svc.color)} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", svc.color)}>{svc.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>v3.2.0-stable</span>
              <span>Uptime 99.99%</span>
            </div>
          </div>

          {/* Mini Card de Conversão */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Conversão (Trial → Pro)</h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">8.4%</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">+1.2%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-brand-blue rounded-full w-[8.4%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}