
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter,
  Eye,
  MoreHorizontal,
  Mail,
  Phone,
  Ban,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Download,
  Smartphone,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Mock estendido de produtores
const allUsers = [
  { id: '1', name: 'Maria Silva', email: 'maria@email.com', phone: '11999999999', plan: 'Professional', status: 'active', apps: 2, createdAt: '2025-04-26' },
  { id: '2', name: 'João Santos', email: 'joao@email.com', phone: '21988888888', plan: 'Basic', status: 'active', apps: 1, createdAt: '2025-04-26' },
  { id: '3', name: 'Ana Costa', email: 'ana@email.com', phone: null, plan: 'Basic', status: 'trial', apps: 1, createdAt: '2025-04-25' },
  { id: '4', name: 'Pedro Henrique', email: 'pedro@email.com', phone: '31977777777', plan: 'Professional', status: 'canceled', apps: 0, createdAt: '2025-04-25' },
  { id: '5', name: 'Carla Lima', email: 'carla@email.com', phone: '41966666666', plan: 'Business', status: 'active', apps: 5, createdAt: '2025-04-24' },
  { id: '6', name: 'Lucas Oliveira', email: 'lucas@email.com', phone: '51955555555', plan: 'Professional', status: 'active', apps: 3, createdAt: '2025-04-23' },
  { id: '7', name: 'Fernanda Souza', email: 'fernanda@email.com', phone: null, plan: 'Basic', status: 'trial', apps: 1, createdAt: '2025-04-22' },
  { id: '8', name: 'Ricardo Mendes', email: 'ricardo@email.com', phone: '61944444444', plan: 'Business', status: 'active', apps: 8, createdAt: '2025-04-20' },
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
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100">● Ativo</span>;
      case 'trial':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-100">○ Trial</span>;
      case 'canceled':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-100">✕ Cancelado</span>;
      case 'blocked':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-200">🚫 Bloqueado</span>;
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
      <span className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border shadow-sm", colors[plan])}>
        {plan}
      </span>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Gerenciar Usuários</h1>
          <p className="text-slate-500 mt-1 font-medium text-lg">Controle total sobre produtores e aplicativos</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-3 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-slate-100 shadow-sm">
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <Button
            className="h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
            leftIcon={UserPlus}
          >
            Novo Produtor
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Buscar por Identidade</label>
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                <input
                  type="text"
                  placeholder="Nome, e-mail ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-5 py-4.5 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all shadow-inner"
                />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Filtro por Plano</label>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full px-5 py-4.5 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
            >
              <option value="all">Todos os Planos</option>
              <option value="Basic">Basic</option>
              <option value="Professional">Professional</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Status Global</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-5 py-4.5 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="trial">Trial</option>
              <option value="canceled">Cancelado</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identidade do Produtor</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp / Celular</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assinatura</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Apps</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Search className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Nenhum produtor localizado.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-brand-blue group-hover:bg-white shadow-sm transition-colors relative">
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            <div className={cn(
                                "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                                user.status === 'active' ? "bg-green-500" : "bg-slate-300"
                            )} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 tracking-tight leading-none truncate">{user.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {user.phone ? (
                        <a 
                          href={`https://wa.me/55${user.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-4 py-2 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white border border-green-100 rounded-xl transition-all font-black uppercase tracking-widest text-[9px] shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic ml-2">Sem Telefone</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        {renderStatus(user.status)}
                        <div className="flex">
                            {renderPlan(user.plan)}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900">{user.apps}</span>
                          <Smartphone className="w-4 h-4 text-slate-300" />
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="relative inline-block">
                        <button 
                          onClick={() => setMenuOpenId(menuOpenId === user.id ? null : user.id)}
                          className="p-3 bg-slate-50 hover:bg-white text-slate-400 hover:text-slate-900 border border-slate-100 rounded-xl shadow-sm transition-all"
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {menuOpenId === user.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-20 animate-slide-up origin-top-right overflow-hidden">
                              <p className="px-5 py-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Ações Administrativas</p>
                              <button className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-brand-blue transition-all">
                                <Eye className="w-4 h-4" />
                                Detalhes & Apps
                              </button>
                              <button className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 hover:text-brand-blue transition-all">
                                <Mail className="w-4 h-4" />
                                Notificar por E-mail
                              </button>
                              <div className="h-px bg-slate-50 my-2 mx-5" />
                              {user.status === 'blocked' ? (
                                <button className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-green-600 hover:bg-green-50 transition-all">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Ativar Produtor
                                </button>
                              ) : (
                                <button className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 transition-all">
                                  <Ban className="w-4 h-4" />
                                  Suspender Acesso
                                </button>
                              )}
                              <button className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">
                                <Trash2 className="w-4 h-4" />
                                Deletar permanentemente
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

        {/* Pagination Design */}
        <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Exibindo <span className="text-slate-900">{filteredUsers.length}</span> de {allUsers.length} produtores
          </p>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white text-slate-300 rounded-xl border border-slate-100 disabled:opacity-30" disabled>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 px-2">
                <span className="w-10 h-10 flex items-center justify-center bg-brand-blue text-white rounded-xl font-black text-sm shadow-lg shadow-blue-500/20">1</span>
                <span className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-slate-900 rounded-xl font-black text-sm border border-slate-100 cursor-pointer transition-all">2</span>
                <span className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-slate-900 rounded-xl font-black text-sm border border-slate-100 cursor-pointer transition-all">3</span>
            </div>
            <button className="p-3 bg-white text-slate-400 hover:text-brand-blue rounded-xl border border-slate-100 shadow-sm transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
