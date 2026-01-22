import React, { useState, useEffect } from 'react';
import {
  Search,
  MoreHorizontal,
  Filter,
  Shield,
  ShieldOff,
  Trash2,
  Eye,
  X,
  UserPlus,
  Download,
  Loader2,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  Mail,
  Calendar,
  Users // ✅ Adicionado aqui para corrigir o erro
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApps } from '../../contexts/AppsContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';

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
    if (apps.length > 0) fetchClients();
    else setIsLoading(false);
  }, [apps]);

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

  const handleAddClient = async () => {
    if (!newClient.email || !newClient.appId) return;
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
        .select().single();

      if (error) throw error;
      if (data) {
        setClients([data, ...clients]);
        setNewClient({ email: '', name: '', appId: '' });
        setIsAddModalOpen(false);
      }
    } catch (error) {
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
    } catch (error) { console.error(error); }
    setActionMenuOpen(null);
  };

  const handleRemoveClient = async (clientId: string) => {
    if (!confirm('Remover cliente permanentemente?')) return;
    try {
      await supabase.from('clients').delete().eq('id', clientId);
      setClients(clients.filter(c => c.id !== clientId));
    } catch (error) { console.error(error); }
    setActionMenuOpen(null);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-8 font-sans pb-20 animate-fade-in">
      {/* Header Enterprise */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Gerenciamento de Alunos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Controle acessos, bloqueios e visualize o engajamento da sua tribo.</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          disabled={apps.length === 0}
          className="font-bold uppercase tracking-widest text-xs px-6"
          leftIcon={UserPlus}
        >
          Novo Cliente
        </Button>
      </div>

      {/* Toolbar Robusta */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, email ou ID..."
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue transition-all shadow-sm placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              className="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-black text-slate-600 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors uppercase tracking-widest"
            >
              <option value="all">Filtro por App</option>
              {apps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative min-w-[160px]">
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
              filterStatus === 'active' ? 'bg-emerald-500' : filterStatus === 'blocked' ? 'bg-red-500' : 'bg-slate-300'
            )} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-black text-slate-600 dark:text-slate-300 focus:outline-none appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors uppercase tracking-widest"
            >
              <option value="all">Status: Todos</option>
              <option value="active">Ativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabela Enterprise */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto text-nowrap">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Identificação do Cliente</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Aplicativo Vinculado</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Status de Acesso</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Cadastro</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-brand-blue mx-auto animate-spin opacity-50" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 tracking-widest">Sincronizando Alunos...</p>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700/50">
                      <Users className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Nenhum aluno na base</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Sua lista está vazia. Comece adicionando manualmente ou via Webhook.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-[13px] font-black text-white dark:text-slate-900 shadow-sm transition-transform group-hover:scale-105">
                          {client.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none truncate mb-1.5 uppercase tracking-tight">
                            {client.name || 'Usuário Sem Nome'}
                          </p>
                          <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        {getAppName(client.app_id)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {client.status === 'active' ? (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Acesso Ativo
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-[11px] font-bold uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Bloqueado
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{formatDate(client.created_at)}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{client.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === client.id ? null : client.id)}
                        className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {actionMenuOpen === client.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                          <div className="absolute right-8 top-12 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-20 overflow-hidden animate-slide-up origin-top-right">
                            <button
                              onClick={() => { setSelectedClient(client); setIsDetailModalOpen(true); setActionMenuOpen(null); }}
                              className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
                            >
                              <Eye className="w-4 h-4 text-brand-blue" /> Perfil Completo
                            </button>
                            <button
                              onClick={() => handleToggleStatus(client)}
                              className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3"
                            >
                              {client.status === 'active' ? (
                                <><ShieldOff className="w-4 h-4 text-red-500" /> Bloquear Acesso</>
                              ) : (
                                <><Shield className="w-4 h-4 text-emerald-500" /> Ativar Acesso</>
                              )}
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                            <button
                              onClick={() => handleRemoveClient(client.id)}
                              className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3"
                            >
                              <Trash2 className="w-4 h-4" /> Remover Aluno
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

        <div className="px-6 py-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Base de dados: {filteredClients.length} Registros Encontrados
          </p>
          <button className="text-[10px] font-black text-brand-blue hover:text-blue-700 uppercase tracking-[0.2em] flex items-center gap-2 transition-all group">
            <Download className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
            Extrair Relatório CSV
          </button>
        </div>
      </div>

      {/* MODAL ADICIONAR */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-widest">Registrar Acesso</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail do Aluno</label>
                <input
                  autoFocus
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all"
                  placeholder="exemplo@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all"
                  placeholder="Nome do aluno"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destino (App)</label>
                <div className="relative">
                  <select
                    value={newClient.appId}
                    onChange={(e) => setNewClient({ ...newClient, appId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all appearance-none uppercase tracking-tight"
                  >
                    <option value="">Selecione o Aplicativo</option>
                    {apps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <Button
                onClick={handleAddClient}
                disabled={isSubmitting}
                className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 mt-2"
                isLoading={isSubmitting}
              >
                Conceder Acesso
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHES */}
      {isDetailModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsDetailModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
            <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl font-black text-slate-900 shadow-2xl relative z-10">
                {selectedClient.email[0].toUpperCase()}
              </div>
              <h3 className="text-lg font-black text-white mb-1 relative z-10 uppercase tracking-tight leading-none">{selectedClient.name || 'Usuário Sem Nome'}</h3>
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-[0.2em] relative z-10">{selectedClient.email}</p>
            </div>
            <div className="p-8 space-y-5">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Status</span>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                  selectedClient.status === 'active' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                )}>{selectedClient.status === 'active' ? 'Ativo' : 'Bloqueado'}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">App Vinculado</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{getAppName(selectedClient.app_id)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Origem de Registro</span>
                <span className="text-[10px] font-black text-brand-blue bg-brand-blue/5 px-2 py-1 rounded-md uppercase tracking-widest">{selectedClient.source}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Data de Ingresso</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{formatDate(selectedClient.created_at)}</span>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleToggleStatus(selectedClient)}
                  className={cn(
                    "w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95",
                    selectedClient.status === 'active'
                      ? 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white'
                  )}
                >
                  {selectedClient.status === 'active' ? 'Bloquear Acesso' : 'Desbloquear Aluno'}
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