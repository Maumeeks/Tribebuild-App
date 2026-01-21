import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Copy,
  Check,
  X,
  Shield,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Trash2,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Server
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Tipos
interface Domain {
  id: string;
  domain: string;
  appId: string;
  appName: string;
  status: 'pending' | 'verifying' | 'active' | 'error';
  sslActive: boolean;
  createdAt: string;
  lastChecked: string | null;
  errorMessage?: string;
}

// Mock do domínio padrão
const defaultDomain = {
  subdomain: 'meuapp',
  fullDomain: 'meuapp.tribebuild.app'
};

// Mock de domínios
const initialDomains: Domain[] = [
  {
    id: '1',
    domain: 'app.academiafit.com.br',
    appId: '1',
    appName: 'Academia Fit',
    status: 'active',
    sslActive: true,
    createdAt: '2025-04-20',
    lastChecked: '2025-04-26T10:30:00'
  },
  {
    id: '2',
    domain: 'curso.joaosilva.com',
    appId: '1',
    appName: 'Academia Fit',
    status: 'pending',
    sslActive: false,
    createdAt: '2025-04-25',
    lastChecked: null
  }
];

// Configurações DNS
const dnsConfig = {
  cname: {
    type: 'CNAME',
    name: 'app',
    value: 'proxy.tribebuild.app',
    ttl: '3600'
  },
  aRecord: {
    type: 'A',
    name: '@',
    value: '76.76.21.21',
    ttl: '3600'
  }
};

const DomainsPage: React.FC = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<Domain[]>(initialDomains);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDnsModal, setShowDnsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const isValidDomain = (domain: string) => {
    const regex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return regex.test(domain);
  };

  const handleAddDomain = () => {
    if (!newDomain.trim()) return alert('Digite um domínio');
    if (!isValidDomain(newDomain)) return alert('Formato inválido. Ex: app.site.com');
    if (domains.some(d => d.domain === newDomain)) return alert('Domínio já existe');

    const domain: Domain = {
      id: Math.random().toString(36).substr(2, 9),
      domain: newDomain.toLowerCase(),
      appId: '1',
      appName: 'Meu App',
      status: 'pending',
      sslActive: false,
      createdAt: new Date().toISOString().split('T')[0],
      lastChecked: null
    };

    setDomains([...domains, domain]);
    setNewDomain('');
    setShowAddModal(false);
    setSelectedDomain(domain);
    setShowDnsModal(true);
  };

  const handleVerify = async (domain: Domain) => {
    setVerifying(domain.id);
    setTimeout(() => {
      setDomains(domains.map(d => {
        if (d.id === domain.id) {
          const success = Math.random() > 0.3;
          return {
            ...d,
            status: success ? 'active' : 'error',
            sslActive: success,
            lastChecked: new Date().toISOString(),
            errorMessage: success ? undefined : 'DNS não propagado'
          };
        }
        return d;
      }));
      setVerifying(null);
    }, 2000);
  };

  const handleDeleteDomain = () => {
    if (!selectedDomain) return;
    setDomains(domains.filter(d => d.id !== selectedDomain.id));
    setShowDeleteModal(false);
    setSelectedDomain(null);
  };

  const renderStatusBadge = (status: Domain['status']) => {
    const styles = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      verifying: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
    };

    const icons = {
      active: CheckCircle2,
      pending: Clock,
      verifying: Loader2,
      error: AlertTriangle
    };

    const labels = {
      active: 'Ativo',
      pending: 'Pendente DNS',
      verifying: 'Verificando',
      error: 'Erro DNS'
    };

    const Icon = icons[status];

    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border", styles[status])}>
        <Icon className={cn("w-3.5 h-3.5", status === 'verifying' && "animate-spin")} />
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-8 font-['Inter'] pb-20 animate-fade-in">

      {/* Header Clean */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Domínios</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gerencie os endereços de acesso dos seus aplicativos.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Adicionar Domínio
        </button>
      </div>

      {/* Domínio Padrão - Estilo Card Técnico */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Domínio Padrão (Gratuito)</h3>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">{defaultDomain.fullDomain}</p>
                <div className="w-2 h-2 rounded-full bg-green-500" title="Online"></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(`https://${defaultDomain.fullDomain}`, 'default')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2",
              copied === 'default'
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            {copied === 'default' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied === 'default' ? 'Copiado' : 'Copiar Link'}
          </button>
        </div>
      </div>

      {/* Lista de Domínios Personalizados */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
          Domínios Personalizados
        </h3>

        {domains.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <Server className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum domínio configurado</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Conecte seu próprio domínio (ex: app.suaempresa.com) para remover a marca TribeBuild.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-6 text-brand-blue font-bold text-sm hover:underline"
            >
              Configurar agora
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-all hover:border-slate-300 dark:hover:border-slate-600 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                      domain.status === 'active' ? "bg-green-100 dark:bg-green-900/20 text-green-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    )}>
                      {domain.status === 'active' ? <ShieldCheck className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* CORREÇÃO AQUI: Removido o dark:text-white duplicado */}
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white font-mono">{domain.domain}</h4>
                        {renderStatusBadge(domain.status)}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>Criado em {new Date(domain.createdAt).toLocaleDateString('pt-BR')}</span>
                        {domain.sslActive && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <ShieldCheck className="w-3 h-3" /> SSL Ativo
                            </span>
                          </>
                        )}
                        {domain.status === 'error' && (
                          <>
                            <span>•</span>
                            <span className="text-red-500 font-bold">{domain.errorMessage}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => { setSelectedDomain(domain); setShowDnsModal(true); }}
                      className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      Configurar DNS
                    </button>

                    <button
                      onClick={() => handleVerify(domain)}
                      disabled={verifying === domain.id}
                      className="px-4 py-2 text-xs font-bold text-brand-blue bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {verifying === domain.id && <Loader2 className="w-3 h-3 animate-spin" />}
                      Verificar
                    </button>

                    <button
                      onClick={() => { setSelectedDomain(domain); setShowDeleteModal(true); }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remover domínio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card - Estilo Banner Sutil */}
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="p-3 bg-brand-blue/10 rounded-lg text-brand-blue">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Por que conectar um domínio?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-2xl">
              Usar um domínio próprio (ex: app.suamarca.com) aumenta a confiança dos seus alunos e fortalece sua marca. Além disso, incluímos certificado SSL gratuito para todos os domínios conectados.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Certificado SSL (HTTPS) Automático
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                CDN Global Ultra-rápida
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Proteção DDoS Integrada
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                SEO Otimizado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Adicionar Domínio (Clean) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Novo Domínio</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Domínio ou Subdomínio</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="Ex: app.suamarca.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-brand-blue outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Recomendamos usar subdomínios como <b>app</b>, <b>membros</b> ou <b>curso</b>.</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  Você precisará ter acesso ao painel de DNS do seu domínio (Cloudflare, GoDaddy, Registro.br, etc) para concluir a configuração.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddDomain}
                  className="flex-1 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold uppercase hover:bg-slate-800 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: DNS (Técnico e Clean) */}
      {showDnsModal && selectedDomain && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDnsModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Configuração DNS</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedDomain.domain}</p>
              </div>
              <button onClick={() => setShowDnsModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Adicione <strong>um</strong> dos registros abaixo no seu provedor de domínio:
              </p>

              {/* CNAME Card */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Opção 1: CNAME (Recomendado)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Subdomínios</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                    <div className="text-slate-400">Type</div>
                    <div className="col-span-2 font-bold text-slate-900 dark:text-white">CNAME</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs font-mono items-center">
                    <div className="text-slate-400">Name</div>
                    <div className="col-span-2 flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-2 rounded">
                      <span className="font-bold text-slate-900 dark:text-white">{dnsConfig.cname.name}</span>
                      <button onClick={() => copyToClipboard(dnsConfig.cname.name, 'c-name')} className="text-brand-blue hover:text-blue-700">
                        {copied === 'c-name' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs font-mono items-center">
                    <div className="text-slate-400">Value</div>
                    <div className="col-span-2 flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-2 rounded">
                      <span className="font-bold text-slate-900 dark:text-white truncate pr-2">{dnsConfig.cname.value}</span>
                      <button onClick={() => copyToClipboard(dnsConfig.cname.value, 'c-val')} className="text-brand-blue hover:text-blue-700">
                        {copied === 'c-val' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* A Record Card */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Opção 2: A Record</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Domínio Raiz</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                    <div className="text-slate-400">Type</div>
                    <div className="col-span-2 font-bold text-slate-900 dark:text-white">A</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs font-mono items-center">
                    <div className="text-slate-400">Name</div>
                    <div className="col-span-2 flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-2 rounded">
                      <span className="font-bold text-slate-900 dark:text-white">{dnsConfig.aRecord.value}</span>
                      <button onClick={() => copyToClipboard(dnsConfig.aRecord.value, 'a-val')} className="text-brand-blue hover:text-blue-700">
                        {copied === 'a-val' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg flex gap-3 text-xs text-blue-700 dark:text-blue-300">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>A propagação do DNS pode levar de 1 hora até 24 horas.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDnsModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Configurar Depois
                </button>
                <button
                  onClick={() => { setShowDnsModal(false); handleVerify(selectedDomain); }}
                  className="flex-1 py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Verificar Conexão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete (Clean) */}
      {showDeleteModal && selectedDomain && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up text-center">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Remover domínio?</h3>
            <p className="text-sm text-slate-500 mb-6">
              O endereço <strong>{selectedDomain.domain}</strong> deixará de funcionar imediatamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteDomain}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase shadow-lg shadow-red-500/20"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainsPage;