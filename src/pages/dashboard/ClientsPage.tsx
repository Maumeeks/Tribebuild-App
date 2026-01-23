import React, { useState, useEffect } from 'react';
import {
  Search, MoreHorizontal, Filter, Shield, ShieldOff, Trash2, Eye, X,
  UserPlus, Download, Loader2, Smartphone, ChevronDown, Mail, Users, Package
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApps } from '../../contexts/AppsContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/Button';

// Interface atualizada com suporte a Array de Produtos (Upsells)
interface Client {
  id: string;
  email: string;
  name: string | null;
  app_id: string;
  status: 'active' | 'blocked';
  created_at: string;
  source: string;
  products: string[]; // ✅ Nova coluna para Upsells
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

  const [newClient, setNewClient] = useState({ email: '', name: '', appId: '' });

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const appIds = apps.map(app => app.id);
      if (appIds.length === 0) { setClients([]); return; }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .in('app_id', appIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apps.length > 0) fetchClients();
    else setIsLoading(false);
  }, [apps]);

  // Função de Exportação Real (CSV)
  const handleExportCSV = () => {
    const headers = ['Nome', 'Email', 'App', 'Status', 'Data', 'Produtos'];
    const rows = filteredClients.map(c => [
      c.name || 'Sem Nome',
      c.email,
      apps.find(a => a.id === c.app_id)?.name || 'N/A',
      c.status,
      new Date(c.created_at).toLocaleDateString(),
      (c.products || []).join(' | ')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `relatorio_alunos_tribebuild.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesApp = filterApp === 'all' || client.app_id === filterApp;
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesApp && matchesStatus;
  });

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
          products: [] // Inicializa vazio
        }])
        .select().single();

      if (error) throw error;
      setClients([data, ...clients]);
      setNewClient({ email: '', name: '', appId: '' });
      setIsAddModalOpen(false);
    } catch (error) {
      alert('Erro ao adicionar. Verifique se o e-mail já existe neste App.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Gerenciamento de Alunos</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie acessos e visualize os Upsells da sua tribo.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} leftIcon={UserPlus}>Novo Cliente</Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar aluno..."
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
          />
        </div>
        <Button onClick={handleExportCSV} variant="outline" leftIcon={Download}>Exportar CSV</Button>
      </div>

      {/* Tabela Alunos */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">App / Upsells</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-blue" /></td></tr>
              ) : filteredClients.map((client) => (
                <tr key={client.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{client.name || 'S/N'}</p>
                    <p className="text-[11px] text-slate-500">{client.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded w-fit">{apps.find(a => a.id === client.app_id)?.name}</span>
                      {client.products?.length > 0 && (
                        <span className="text-[9px] font-bold text-brand-blue flex items-center gap-1 uppercase">
                          <Package className="w-3 h-3" /> {client.products.length} Produto(s)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      client.status === 'active' ? 'text-emerald-500' : 'text-red-500'
                    )}>{client.status === 'active' ? '● Ativo' : '● Bloqueado'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setSelectedClient(client); setIsDetailModalOpen(true); }} className="p-2 hover:bg-slate-100 rounded-lg"><Eye className="w-4 h-4 text-slate-400" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ... Modais de Add e Detalhes seguem a mesma lógica ... */}
    </div>
  );
};

export default ClientsPage;