import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Mail,
  Ban,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Download,
  Smartphone,
  MessageCircle,
  XCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Mock estendido de produtores
const allUsers = [
  { id: '1', name: 'Maria Silva', email: 'maria@email.com', phone: '11999999999', plan: 'Professional', status: 'active', apps: 2, createdAt: '2025-04-26' },
  { id: '2', name: 'João Santos', email: 'joao@email.com', phone: '21988888888', plan: 'Starter', status: 'active', apps: 1, createdAt: '2025-04-26' },
  { id: '3', name: 'Ana Costa', email: 'ana@email.com', phone: null, plan: 'Starter', status: 'trial', apps: 1, createdAt: '2025-04-25' },
  { id: '4', name: 'Pedro Henrique', email: 'pedro@email.com', phone: '31977777777', plan: 'Professional', status: 'canceled', apps: 0, createdAt: '2025-04-25' },
  { id: '5', name: 'Carla Lima', email: 'carla@email.com', phone: '41966666666', plan: 'Business', status: 'active', apps: 5, createdAt: '2025-04-24' },
  { id: '6', name: 'Lucas Oliveira', email: 'lucas@email.com', phone: '51955555555', plan: 'Professional', status: 'active', apps: 3, createdAt: '2025-04-23' },
  { id: '7', name: 'Fernanda Souza', email: 'fernanda@email.com', phone: null, plan: 'Starter', status: 'trial', apps: 1, createdAt: '2025-04-22' },
  { id: '8', name: 'Ricardo Mendes', email: 'ricardo@email.com', phone: '61944444444', plan: 'Business', status: 'active', apps: 8, createdAt: '2025-04-20' },
  { id: '9', name: 'Holding Global', email: 'admin@holding.com', phone: '11977776666', plan: 'Enterprise', status: 'active', apps: 12, createdAt: '2025-04-19' },
];

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Filtragem multi-critério
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.phone && user.phone.includes(search));
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const renderStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold uppercase tracking-wide rounded-md"><CheckCircle2 className="w-3 h-3" /> Ativo</span>;
      case 'trial':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[10px] font-bold uppercase tracking-wide rounded-md"><Clock className="w-3 h-3" /> Trial</span>;
      case 'canceled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wide rounded-md"><XCircle className="w-3 h-3" /> Cancelado</span>;
      case 'blocked':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-[10px] font-bold uppercase tracking-wide rounded-md"><ShieldAlert className="w-3 h-3" /> Bloqueado</span>;
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
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Usuários</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie produtores e acessos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <Button size="sm" leftIcon={UserPlus} className="text-xs font-bold uppercase tracking-wide">
            Novo Produtor
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
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
              <option value="active">Ativo</option>
              <option value="trial">Trial</option>
              <option value="canceled">Cancelado</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Produtor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assinatura</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Apps</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Nenhum produtor encontrado.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-brand-blue border border-slate-200 dark:border-slate-700 relative">
                          {user.name.charAt(0)}
                          <div className={cn(
                            "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900",
                            user.status === 'active' ? "bg-emerald-500" : "bg-slate-300"
                          )} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[150px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.phone ? (
                        <a
                          href={`https://wa.me/55${user.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600 italic">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        {renderStatus(user.status)}
                        {renderPlan(user.plan)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Smartphone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold">{user.apps}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === user.id ? null : user.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {menuOpenId === user.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                            <div className="absolute right-8 top-0 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-20 animate-slide-up origin-top-right overflow-hidden">
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <Eye className="w-3.5 h-3.5" /> Ver Detalhes
                              </button>
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <Mail className="w-3.5 h-3.5" /> Enviar Email
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                              {user.status === 'blocked' ? (
                                <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Desbloquear
                                </button>
                              ) : (
                                <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors">
                                  <Ban className="w-3.5 h-3.5" /> Suspender
                                </button>
                              )}
                              <button className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" /> Deletar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination (Estilo Clean) */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Mostrando <span className="font-bold text-slate-900 dark:text-white">{filteredUsers.length}</span> resultados
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}