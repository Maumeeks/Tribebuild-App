
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
  ExternalLink,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Info
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

// Mock do domínio padrão (baseado no app)
const defaultDomain = {
  subdomain: 'meuapp',
  fullDomain: 'meuapp.tribebuild.app'
};

// Mock de domínios personalizados
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

// Configurações DNS para mostrar no modal
const dnsConfig = {
  cname: {
    type: 'CNAME',
    name: 'app (ou seu subdomínio)',
    value: 'proxy.tribebuild.app',
    ttl: '3600'
  },
  aRecord: {
    type: 'A',
    name: '@ (ou deixe vazio)',
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
    if (!newDomain.trim()) {
      alert('Digite um domínio');
      return;
    }
    if (!isValidDomain(newDomain)) {
      alert('Formato de domínio inválido. Ex: app.seusite.com.br');
      return;
    }
    if (domains.some(d => d.domain === newDomain)) {
      alert('Este domínio já foi adicionado');
      return;
    }

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
            errorMessage: success ? undefined : 'DNS não configurado corretamente'
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStatusBadge = (status: Domain['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ativo
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">
            <Clock className="w-3.5 h-3.5" />
            Pendente DNS
          </span>
        );
      case 'verifying':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Verificando
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100">
            <AlertTriangle className="w-3.5 h-3.5" />
            Erro
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-slide-up">
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-brand-blue tracking-tighter leading-tight">Domínios Personalizados</h1>
          <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
            Remova a marca TribeBuild da URL e conecte seu próprio endereço exclusivo para fortalecer sua identidade visual e profissionalismo.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
          leftIcon={Plus}
        >
          Adicionar Domínio
        </Button>
      </div>

      {/* Domínio Padrão */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 md:p-10 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Domínio Padrão (Gratuito)</h2>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 group transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl hover:shadow-blue-500/5">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Globe className="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white dark:text-white tracking-tight">{defaultDomain.fullDomain}</p>
              <p className="text-sm text-slate-400 font-medium mt-1">Este é o endereço principal fixo do seu aplicativo</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 shadow-sm">
              Ativo
            </span>
            <span className="px-4 py-1.5 bg-white dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100 shadow-sm">
              Gratuito
            </span>
            <button
              onClick={() => copyToClipboard(`https://${defaultDomain.fullDomain}`, 'default')}
              className={cn(
                "p-4 rounded-2xl transition-all shadow-sm flex items-center gap-3 font-black text-[10px] uppercase tracking-widest",
                copied === 'default'
                  ? "bg-green-500 text-white shadow-green-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-400 hover:text-brand-blue border border-slate-100"
              )}
            >
              {copied === 'default' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === 'default' ? 'Link Copiado' : 'Copiar Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Domínios Personalizados */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Domínios Personalizados</h2>
        </div>
        
        {domains.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Nenhum domínio próprio</h3>
            <p className="text-slate-500 mb-10 max-w-md mx-auto font-medium leading-relaxed">
              Adicione um domínio personalizado para reforçar sua autoridade e facilitar o acesso dos seus alunos.
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="h-14 px-10 font-black uppercase tracking-widest text-xs"
              leftIcon={Plus}
            >
              Configurar Primeiro Domínio
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {domains.map((domain) => (
              <div key={domain.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-6 md:p-8 shadow-sm group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                      domain.status === 'active' ? 'bg-green-50' : domain.status === 'error' ? 'bg-red-50' : 'bg-amber-50'
                    )}>
                      {domain.sslActive ? (
                        <ShieldCheck className="w-8 h-8 text-green-600" />
                      ) : domain.status === 'error' ? (
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      ) : (
                        <Shield className="w-8 h-8 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xl font-black text-slate-900 dark:text-white dark:text-white tracking-tight leading-none">{domain.domain}</p>
                        {renderStatusBadge(domain.status)}
                        {domain.sslActive && (
                          <span className="px-3 py-1 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-green-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> SSL Protegido
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs font-bold mt-2",
                        domain.status === 'error' ? "text-red-500 uppercase tracking-widest" : "text-slate-400"
                      )}>
                        {domain.status === 'error' && domain.errorMessage
                          ? domain.errorMessage
                          : domain.lastChecked
                          ? `Última verificação: ${formatDate(domain.lastChecked)}`
                          : 'Aguardando configuração de DNS'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 border-t lg:border-t-0 pt-6 lg:pt-0">
                    <button
                      onClick={() => { setSelectedDomain(domain); setShowDnsModal(true); }}
                      className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100"
                    >
                      Instruções DNS
                    </button>
                    <button
                      onClick={() => handleVerify(domain)}
                      disabled={verifying === domain.id}
                      className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-brand-blue bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all border border-blue-100 disabled:opacity-50 flex items-center gap-2"
                    >
                      {verifying === domain.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Verificar Agora
                    </button>
                    <button
                      onClick={() => { setSelectedDomain(domain); setShowDeleteModal(true); }}
                      className="p-3.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Informativo Tribe Style */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-12 text-white overflow-hidden relative group animate-slide-up" style={{ animationDelay: '300ms' }}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-start gap-10">
            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
                <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-6">Por que usar um domínio próprio?</h3>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                    {[
                        { title: 'Autoridade de Marca', desc: 'Fortalece o branding e aumenta a confiança do comprador.' },
                        { title: 'Profissionalismo', desc: 'Sua plataforma deixa de ser um "link genérico" para ser seu site.' },
                        { title: 'SEO Otimizado', desc: 'Ajuda no ranqueamento orgânico da sua página em buscadores.' },
                        { title: 'SSL Incluso', desc: 'Certificado de segurança gratuito renovado automaticamente.' }
                    ].map((benefit, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-primary-400" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase tracking-tight text-white/90">{benefit.title}</h4>
                                <p className="text-white/50 text-xs font-medium leading-relaxed mt-1">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         </div>
      </div>

      {/* Modal: Adicionar Domínio */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Novo Domínio</h3>
                <p className="text-sm text-slate-400 font-medium">Configure seu endereço exclusivo</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nome do Domínio</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300">
                        <Globe className="w-5 h-5 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        placeholder="Ex: app.seusite.com.br"
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                    />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Dica: Use subdomínios como "app" ou "membros".
                </p>
              </div>

              <div className="p-6 rounded-[1.5rem] bg-amber-50 border border-amber-100 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Requer Configuração DNS</p>
                    <p className="text-[10px] text-amber-700 font-medium mt-1 leading-relaxed">
                        Após adicionar, você receberá os registros CNAME ou A para apontar em seu provedor (Cloudflare, GoDaddy, Hostgator, etc).
                    </p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col md:flex-row gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddDomain}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
              >
                Continuar para DNS
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Configuração DNS */}
      {showDnsModal && selectedDomain && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDnsModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Apontamento DNS</h3>
                <p className="text-sm text-slate-400 font-black uppercase tracking-widest mt-1">{selectedDomain.domain}</p>
              </div>
              <button onClick={() => setShowDnsModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-10">
              <p className="text-slate-500 font-medium leading-relaxed">
                Acesse o painel do seu provedor de domínio e adicione um dos registros abaixo para ativar seu domínio personalizado:
              </p>

              {/* Registro CNAME */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 overflow-hidden shadow-inner">
                <div className="bg-blue-600 px-6 py-3 flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Opção Recomendada (CNAME)</h4>
                    <span className="text-[8px] font-black text-blue-200 uppercase tracking-widest">Melhor para subdomínios</span>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo</span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-600 shadow-sm">CNAME</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nome (Host)</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{dnsConfig.cname.name}</span>
                            <button onClick={() => copyToClipboard(dnsConfig.cname.name, 'c-name')} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                {copied === 'c-name' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor (Destino)</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{dnsConfig.cname.value}</span>
                            <button onClick={() => copyToClipboard(dnsConfig.cname.value, 'c-val')} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                {copied === 'c-val' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                </div>
              </div>

              {/* Registro A */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 overflow-hidden shadow-inner">
                <div className="bg-slate-800 px-6 py-3 flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Opção para Domínio Raiz (A Record)</h4>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ex: seusite.com</span>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo</span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-600 shadow-sm">A</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nome (Host)</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">@</span>
                            <button onClick={() => copyToClipboard('@', 'a-name')} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                {copied === 'a-name' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor (IP)</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{dnsConfig.aRecord.value}</span>
                            <button onClick={() => copyToClipboard(dnsConfig.aRecord.value, 'a-val')} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                {copied === 'a-val' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-black text-blue-900 uppercase tracking-tight">Tempo de Propagação</p>
                    <p className="text-[10px] text-blue-700 font-medium mt-1 leading-relaxed">
                        Alterações de DNS podem levar de 30 minutos a 48 horas para serem propagadas mundialmente.
                    </p>
                </div>
              </div>

              <a href="#" className="flex items-center justify-center gap-3 w-full py-4 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 rounded-2xl transition-all border-2 border-dashed border-blue-200">
                <HelpCircle className="w-4 h-4" />
                Não sabe configurar? Ver tutorial completo
              </a>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col md:flex-row gap-4 sticky bottom-0">
              <Button
                variant="ghost"
                onClick={() => setShowDnsModal(false)}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px]"
              >
                Configurar Depois
              </Button>
              <Button
                onClick={() => {
                  setShowDnsModal(false);
                  handleVerify(selectedDomain);
                }}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
                leftIcon={RefreshCw}
              >
                Verificar Conexão
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão */}
      {showDeleteModal && selectedDomain && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
              Remover domínio?
            </h3>
            <p className="text-slate-900 font-bold font-mono text-sm mb-4 bg-slate-50 py-2 px-4 rounded-xl border border-slate-100 inline-block">
              {selectedDomain.domain}
            </p>
            <p className="text-slate-500 mb-10 font-medium leading-relaxed">
              Seu aplicativo deixará de funcionar neste endereço instantaneamente. O domínio padrão <span className="text-slate-900 font-bold">{defaultDomain.fullDomain}</span> continuará ativo.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteDomain}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 transition-all active:scale-95"
              >
                Sim, remover agora
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Cancelar e Manter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainsPage;
