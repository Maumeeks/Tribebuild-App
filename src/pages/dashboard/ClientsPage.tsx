import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MoreVertical,
  Calendar,
  Shield,
  ShieldOff,
  Trash2,
  Eye,
  X,
  UserPlus,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { useApps } from '../../contexts/AppsContext';
import { supabase } from '../../lib/supabase';

// Tipos
interface Client {
  id: string;
  email: string;
  name: string | null;
  app_id: string; // No banco geralmente é snake_case
  status: 'active' | 'blocked';
  created_at: string;
  last_access: string | null;
  source: 'webhook' | 'manual' | 'import';
}

const ClientsPage: React.FC = () => {
  const { apps } = useApps(); // ✅ Pegando os apps reais do usuário
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

  // --- BUSCAR CLIENTES REAIS DO SUPABASE ---
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      // Busca clientes que pertencem aos apps deste usuário
      // Precisamos dos IDs dos apps para filtrar
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
      // Não trava a tela, apenas loga o erro (pode ser que a tabela não exista ainda)
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

  // --- LÓGICA DE FILTRO ---
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Mapeando app_id do banco
    const matchesApp = filterApp === 'all' || client.app_id === filterApp;
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;

    return matchesSearch && matchesApp && matchesStatus;
  });

  // --- HELPER PARA PEGAR NOME DO APP ---
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
        alert('Cliente adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      alert('Erro ao adicionar cliente. Verifique se o e-mail já existe neste app.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    const newStatus = client.status === 'active' ? 'blocked' : 'active';

    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', client.id);

      if (error) throw error;

      // Atualiza UI Otimista
      setClients(clients.map(c =>
        c.id === client.id ? { ...c, status: newStatus } : c
      ));

      // Se estiver no modal de detalhes, atualiza ele também
      if (selectedClient && selectedClient.id === client.id) {
        setSelectedClient({ ...selectedClient, status: newStatus });
      }

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Não foi possível atualizar o status.');
    }
    setActionMenuOpen(null);
  };

  const handleRemoveClient = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja remover o acesso deste cliente? O histórico dele será perdido.')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      setClients(clients.filter(c => c.id !== clientId));
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      alert('Erro ao remover cliente.');
    }
    setActionMenuOpen(null);
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
    setActionMenuOpen(null);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'webhook': return 'Automático (Webhook)';
      case 'manual': return 'Manual';
      case 'import': return 'Importado';
      default: return source;
    }
  };

  return (
    <div className="space-y-10 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-slide-up">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-brand-blue tracking-tighter">Gestão de Clientes</h1>
          <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
            Monitore quem tem acesso aos seus aplicativos, gerencie bloqueios e adicione novos usuários manualmente quando necessário.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
          leftIcon={UserPlus}
          disabled={apps.length === 0}
        >
          Adicionar Cliente
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Buscar Usuário</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300">
                <Search className="w-5 h-5 group-focus-within:text-brand-blue transition-colors" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Email ou nome do cliente..."
                className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filtrar por App</label>
            <select
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
            >
              <option value="all">Todos os Aplicativos</option>
              {apps.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status de Acesso</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Total: <span className="text-slate-900 dark:text-white">{filteredClients.length}</span> clientes encontrados
            </p>
          </div>
          <button className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-2">
            <Download className="w-3 h-3" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aplicativo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cadastrado em</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-brand-blue mx-auto animate-spin" />
                    <p className="text-slate-400 font-bold mt-4">Carregando clientes...</p>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Users className="w-16 h-16 text-slate-100 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Nenhum cliente encontrado.</p>
                    {apps.length === 0 && <p className="text-xs text-slate-400 mt-2">Crie um aplicativo primeiro para adicionar clientes.</p>}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-brand-blue group-hover:bg-white dark:group-hover:bg-slate-600 shadow-sm transition-colors">
                          {client.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white tracking-tight leading-tight">{client.email}</p>
                          {client.name && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{client.name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-600">
                        {getAppName(client.app_id)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {client.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          Bloqueado
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {formatDate(client.created_at)}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === client.id ? null : client.id)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {actionMenuOpen === client.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                            <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-20 animate-slide-up origin-top-right">
                              <button
                                onClick={() => handleViewDetails(client)}
                                className="flex items-center gap-3 w-full px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-brand-blue hover:bg-blue-50 transition-all"
                              >
                                <Eye className="w-4 h-4" />
                                Ver detalhes
                              </button>
                              <button
                                onClick={() => handleToggleStatus(client)}
                                className="flex items-center gap-3 w-full px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-all"
                              >
                                {client.status === 'active' ? (
                                  <>
                                    <ShieldOff className="w-4 h-4" />
                                    Bloquear
                                  </>
                                ) : (
                                  <>
                                    <Shield className="w-4 h-4" />
                                    Desbloquear
                                  </>
                                )}
                              </button>
                              <div className="h-px bg-slate-50 my-2 mx-5" />
                              <button
                                onClick={() => handleRemoveClient(client.id)}
                                className="flex items-center gap-3 w-full px-5 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remover
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

      {/* Modal: Adicionar Cliente */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Novo Cliente</h3>
                <p className="text-sm text-slate-400 font-medium">Liberação manual de acesso</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email do Cliente <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="cliente@email.com"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nome Completo (Opcional)</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Ex: João das Neves"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vincular ao App <span className="text-red-400">*</span></label>
                <select
                  value={newClient.appId}
                  onChange={(e) => setNewClient({ ...newClient, appId: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:outline-none font-bold transition-all"
                >
                  <option value="">Selecione o aplicativo</option>
                  {apps.map(app => (
                    <option key={app.id} value={app.id}>{app.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-5 rounded-[1.5rem] bg-blue-50 border border-blue-100 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-brand-blue">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Importante</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                    Ao adicionar o cliente, ele terá acesso imediato. O envio de e-mail automático será configurado nas Integrações.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col md:flex-row gap-4">
              <Button
                variant="ghost"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddClient}
                isLoading={isSubmitting}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
                leftIcon={CheckCircle2}
              >
                Confirmar Liberação
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Cliente */}
      {isDetailModalOpen && selectedClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsDetailModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
            <div className="p-10 text-center bg-slate-900 text-white relative">
              <div className="absolute top-4 right-4">
                <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl font-black">{selectedClient.email[0].toUpperCase()}</span>
              </div>
              <h3 className="text-xl font-black tracking-tight">{selectedClient.name || 'Sem nome cadastrado'}</h3>
              <p className="text-white/60 text-sm font-medium mt-1">{selectedClient.email}</p>

              <div className="mt-6 flex justify-center">
                <span className={cn(
                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                  selectedClient.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}>
                  {selectedClient.status === 'active' ? '● Usuário Ativo' : '○ Usuário Bloqueado'}
                </span>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aplicativo</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{getAppName(selectedClient.app_id)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cadastrado em</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(selectedClient.created_at)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Último Acesso</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedClient.last_access ? formatDate(selectedClient.last_access) : 'Nunca acessou'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem da Liberação</span>
                  <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest px-2 py-1 bg-blue-50 rounded-lg">{getSourceLabel(selectedClient.source)}</span>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex-1 font-black text-[10px] uppercase tracking-widest py-4"
                >
                  Fechar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    handleToggleStatus(selectedClient);
                    // Não fecha o modal, apenas atualiza o status visualmente
                  }}
                  className="flex-1 font-black text-[10px] uppercase tracking-widest py-4"
                >
                  {selectedClient.status === 'active' ? 'Bloquear Acesso' : 'Desbloquear'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;