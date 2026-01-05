
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  Smartphone,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Calendar,
  Phone,
  Sparkles,
  ArrowRight
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
    color: 'brand-blue'
  },
  { 
    label: 'Assinaturas Ativas', 
    value: '142', 
    change: '+8%', 
    changeType: 'positive',
    icon: CreditCard,
    color: '#10B981'
  },
  { 
    label: 'MRR (Mensal Recorrente)', 
    value: 'R$ 14.280', 
    change: '+15%', 
    changeType: 'positive',
    icon: DollarSign,
    color: '#F59E0B'
  },
  { 
    label: 'Total PWAs Criados', 
    value: '89', 
    change: '+23%', 
    changeType: 'positive',
    icon: Smartphone,
    color: '#8B5CF6'
  },
];

// Mock de últimos cadastros de produtores
const recentUsers = [
  { id: '1', name: 'Maria Silva', email: 'maria@email.com', phone: '11999999999', plan: 'Professional', status: 'active', createdAt: '2025-04-26T14:00:00' },
  { id: '2', name: 'João Santos', email: 'joao@email.com', phone: '21988888888', plan: 'Basic', status: 'active', createdAt: '2025-04-26T10:00:00' },
  { id: '3', name: 'Ana Costa', email: 'ana@email.com', phone: null, plan: 'Basic', status: 'trial', createdAt: '2025-04-25T18:00:00' },
  { id: '4', name: 'Pedro Henrique', email: 'pedro@email.com', phone: '31977777777', plan: 'Professional', status: 'canceled', createdAt: '2025-04-25T09:00:00' },
  { id: '5', name: 'Carla Lima', email: 'carla@email.com', phone: '41966666666', plan: 'Business', status: 'active', createdAt: '2025-04-24T15:00:00' },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Agora mesmo';
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    return `Há ${diffDays} dias`;
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100">● Ativo</span>;
      case 'trial':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-100">○ Trial</span>;
      case 'canceled':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-100">✕ Cancelado</span>;
      default:
        return null;
    }
  };

  const renderPlan = (plan: string) => {
    const colors: Record<string, string> = {
      'Basic': 'bg-slate-50 text-slate-500 border-slate-200',
      'Professional': 'bg-blue-50 text-blue-600 border-blue-100',
      'Business': 'bg-purple-50 text-purple-700 border-purple-100',
    };
    return (
      <span className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border", colors[plan])}>
        {plan}
      </span>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Painel Mestre</h1>
          <p className="text-slate-500 mt-1 font-medium text-lg">Visão geral do ecossistema TribeBuild SaaS</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Admin" />
                    </div>
                ))}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipe Tribe Online</span>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundColor: `${metric.color}15` }}
              >
                <metric.icon className="w-7 h-7" style={{ color: metric.color }} />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-black">
                <TrendingUp className="w-3.5 h-3.5" />
                {metric.change}
              </div>
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">{metric.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Charts / Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Últimos Cadastros - Tabela Estilizada */}
          <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-brand-blue" />
                        Novos Produtores
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Últimos registros na plataforma</p>
                </div>
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-brand-blue rounded-xl font-black uppercase tracking-widest text-[10px] transition-all"
                >
                    Gerenciar Todos
                    <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produtor</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato / Whats</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cadastro</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {recentUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-blue-50/20 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white shadow-sm transition-all">
                                            <span className="font-black text-sm">{user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-slate-900 tracking-tight leading-none truncate">{user.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1.5 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    {user.phone ? (
                                        <a 
                                            href={`https://wa.me/55${user.phone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            WhatsApp
                                        </a>
                                    ) : (
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Não informado</span>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1.5">
                                        {renderStatus(user.status)}
                                        {renderPlan(user.plan)}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {formatRelativeTime(user.createdAt)}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button 
                                        onClick={() => navigate(`/admin/users/${user.id}`)}
                                        className="p-3 bg-white text-slate-400 hover:text-brand-blue border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
          </div>

          {/* Activity / System Status */}
          <div className="space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                  <h3 className="text-xl font-black tracking-tight mb-8">Status do Sistema</h3>
                  
                  <div className="space-y-6">
                      {[
                        { label: 'API Gateway', status: 'Operacional', color: 'bg-green-500' },
                        { label: 'DB Cluster', status: 'Operacional', color: 'bg-green-500' },
                        { label: 'PWA Renderer', status: 'Operacional', color: 'bg-green-500' },
                        { label: 'Push Service', status: 'Delay (2ms)', color: 'bg-amber-400' },
                      ].map((svc, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{svc.label}</span>
                            <div className="flex items-center gap-2">
                                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", svc.color)} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{svc.status}</span>
                            </div>
                        </div>
                      ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/10">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] text-center">Uptime 99.98% • TribeCore v3</p>
                  </div>
              </div>

              {/* Crescimento Rápido Info */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Taxa de Conversão</h3>
                  <div className="flex items-end gap-3 mb-8">
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">8.4%</span>
                      <span className="text-green-600 font-black text-sm mb-1">+1.2%</span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-brand-blue rounded-full w-[84%] transition-all duration-1000 shadow-[0_0_10px_rgba(36,94,227,0.3)]"></div>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Média de conversão Trial para Pro</p>
              </div>
          </div>
      </div>
    </div>
  );
}
