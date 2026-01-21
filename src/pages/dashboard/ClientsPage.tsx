import React, { useState, useEffect } from 'react';
import {
  Search,
  MoreHorizontal, // Mais discreto que Vertical
  Filter,
  Shield,
  ShieldOff,
  Trash2,
  Eye,
  X,
  UserPlus,
  Download,
  Loader2,
  Calendar,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApps } from '../../contexts/AppsContext';
import { supabase } from '../../lib/supabase';

// Tipos
interface Client {
  id: string;
  email: string;
  name: string | null;
  app_id: string;
  status: 'active' | 'blocked';
  created_at: string;
  last_access: string | null;
  source: 'webhook' | 'manual' | 'import';
}

const ClientsPage: React.FC = () => {
  const { apps } = useApps();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterApp, setFilterApp] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const [newClient, setNewClient] = useState({
    email: '',
    name: '',
    appId: ''
  });

  // --- BUSCA DADOS ---
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const appIds = apps.map(app => app.id);

      if (appIds.length === 0) {
        setClients([]);
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .in('app_id', appIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apps.length > 0) {
      fetchClients();
    } else {
      setIsLoading(false);
    }
  }, [apps]);

  // --- FILTROS ---
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesApp = filterApp === 'all' || client.app_id === filterApp;
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesApp && matchesStatus;
  });

  const getAppName = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    return app ? app.name : 'App Desconhecido';
  };

  // --- AÇÕES ---
  const handleAddClient = async () => {
    if (!newClient.email || !newClient.appId) {
      alert('Preencha o email e selecione o app');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          email: newClient.email,
          name: newClient.name || null,
          app_id: newClient.appId,
          status: 'active',
          source: 'manual',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setClients([data, ...clients]);
        setNewClient({ email: '', name: '', appId: '' });
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      alert('Erro ao adicionar. Verifique se o e-mail já existe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    const newStatus = client.status === 'active' ? 'blocked' : 'active';
    try {
      await supabase.from('clients').update({ status: newStatus }).eq('id', client.id);
      setClients(clients.map(c => c.id === client.id ? { ...c, status: newStatus } : c));
      if (selectedClient?.id === client.id) setSelectedClient({ ...selectedClient, status: newStatus });
    } catch (error) {
      console.error('Erro status:', error);
    }
    setActionMenuOpen(null);
  };

  const handleRemoveClient = async (clientId: string) => {
    if (!confirm('Remover cliente permanentemente?')) return;
    try {
      await supabase.from('clients').delete().eq('id', clientId);
      setClients(clients.filter(c => c.id !== clientId));
    } catch (error) {
      console.error('Erro delete:', error);
    }
    setActionMenuOpen(null);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-8 font-['Inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gerencie o acesso dos usuários aos seus aplicativos.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={apps.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4" />
          Adicionar Cliente
        </button>
      </div>

      {/* Barra de Ferramentas (Busca e Filtros) */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              className="w-full pl-9 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm uppercase tracking-wide"
            >
              <option value="all">Todos os Apps</option>
              {apps.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[160px]">
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${filterStatus === 'active' ? 'bg-green-500' : filterStatus === 'blocked' ? 'bg-red-500' : 'bg-slate-300'}`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-8 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm uppercase tracking-wide"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela Clean */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">App</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-brand-blue mx-auto animate-spin" />
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Nenhum cliente encontrado</p>
                    <p className="text-xs text-slate-500 mt-1">Tente ajustar os filtros ou adicione um novo.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {client.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                            {client.name || 'Sem nome'}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        {getAppName(client.app_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-wide">
                          <ShieldOff className="w-3 h-3" /> Bloqueado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === client.id ? null : client.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {actionMenuOpen === client.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                          <div className="absolute right-8 top-8 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-20 overflow-hidden animate-slide-up origin-top-right">
                            <button
                              onClick={() => { setSelectedClient(client); setIsDetailModalOpen(true); setActionMenuOpen(null); }}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detalhes
                            </button>
                            <button
                              onClick={() => handleToggleStatus(client)}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                              {client.status === 'active' ? (
                                <><ShieldOff className="w-3.5 h-3.5" /> Bloquear</>
                              ) : (
                                <><Shield className="w-3.5 h-3.5" /> Desbloquear</>
                              )}
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                            <button
                              onClick={() => handleRemoveClient(client.id)}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remover
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer da Tabela */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">
            Mostrando {filteredClients.length} registro(s)
          </p>
          <button className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* MODAL ADICIONAR (Clean) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Novo Cliente</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email</label>
                <input
                  autoFocus
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-brand-blue outline-none"
                  placeholder="exemplo@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nome (Opcional)</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-brand-blue outline-none"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">App</label>
                <select
                  value={newClient.appId}
                  onChange={(e) => setNewClient({ ...newClient, appId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-brand-blue outline-none"
                >
                  <option value="">Selecione...</option>
                  {apps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
                </select>
              </div>
              <button
                onClick={handleAddClient}
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all active:scale-95 mt-2"
              >
                {isSubmitting ? 'Salvando...' : 'Adicionar Acesso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES (Clean) */}
      {isDetailModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsDetailModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up">
            <div className="bg-slate-900 p-8 text-center relative">
              <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white">
                {selectedClient.email[0].toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{selectedClient.name || 'Sem nome'}</h3>
              <p className="text-white/60 text-xs font-mono">{selectedClient.email}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-bold uppercase">Status</span>
                <span className={`text-xs font-bold uppercase ${selectedClient.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{selectedClient.status === 'active' ? 'Ativo' : 'Bloqueado'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-bold uppercase">App</span>
                <span className="text-xs font-medium text-slate-900 dark:text-white">{getAppName(selectedClient.app_id)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-bold uppercase">Origem</span>
                <span className="text-xs font-medium text-slate-900 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded capitalize">{selectedClient.source}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-xs text-slate-500 font-bold uppercase">Criado em</span>
                <span className="text-xs font-medium text-slate-900 dark:text-white">{formatDate(selectedClient.created_at)}</span>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => handleToggleStatus(selectedClient)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase border ${selectedClient.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                >
                  {selectedClient.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;