import React, { useState } from 'react';
import {
  Link2,
  Check,
  Copy,
  ExternalLink,
  X,
  AlertCircle,
  CheckCircle2,
  Settings,
  Trash2,
  Zap,
  ShieldCheck,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

// Tipos
interface Platform {
  id: string;
  name: string;
  logo: string;
  color: string;
  connected: boolean;
  connectedAt?: string;
  description: string;
  webhookEvents: string[];
}

const initialPlatforms: Platform[] = [
  {
    id: 'hotmart',
    name: 'Hotmart',
    logo: '🔥',
    color: 'orange',
    connected: false,
    description: 'Maior plataforma de produtos digitais da América Latina.',
    webhookEvents: ['Compra aprovada', 'Cancelamento', 'Reembolso']
  },
  {
    id: 'kiwify',
    name: 'Kiwify',
    logo: '🥝',
    color: 'emerald',
    connected: false,
    description: 'Checkout de alta conversão para produtos digitais.',
    webhookEvents: ['Order Approved', 'Order Refunded']
  },
  {
    id: 'eduzz',
    name: 'Eduzz',
    logo: '📘',
    color: 'blue',
    connected: false,
    description: 'Ecossistema completo para infoprodutores.',
    webhookEvents: ['Fatura Paga', 'Fatura Cancelada']
  },
  {
    id: 'monetizze',
    name: 'Monetizze',
    logo: '💰',
    color: 'green',
    connected: false,
    description: 'Vendas de produtos físicos e digitais.',
    webhookEvents: ['Venda Finalizada', 'Reembolso']
  },
  {
    id: 'braip',
    name: 'Braip',
    logo: '🚀',
    color: 'purple',
    connected: false,
    description: 'Focada em produtos físicos e encapsulados.',
    webhookEvents: ['Venda Aprovada', 'Chargeback']
  },
  {
    id: 'perfectpay',
    name: 'PerfectPay',
    logo: '💎',
    color: 'indigo',
    connected: false,
    description: 'Plataforma robusta para alta escala.',
    webhookEvents: ['Venda Aprovada', 'Cancelamento']
  }
];

const IntegrationsPage: React.FC = () => {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disconnectModal, setDisconnectModal] = useState<{ open: boolean; platformId: string | null }>({
    open: false,
    platformId: null
  });

  const userWebhookUrl = user?.id
    ? `https://api.tribebuild.pro/webhook/${user.id}`
    : 'https://api.tribebuild.pro/webhook/loading...';

  const handleCopyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(userWebhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const openConfigModal = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  };

  const handleConnect = () => {
    if (!selectedPlatform) return;
    setPlatforms(platforms.map(p =>
      p.id === selectedPlatform.id
        ? { ...p, connected: true, connectedAt: new Date().toISOString().split('T')[0] }
        : p
    ));
    setIsModalOpen(false);
    setSelectedPlatform(null);
  };

  const handleDisconnect = () => {
    if (!disconnectModal.platformId) return;
    setPlatforms(platforms.map(p =>
      p.id === disconnectModal.platformId
        ? { ...p, connected: false, connectedAt: undefined }
        : p
    ));
    setDisconnectModal({ open: false, platformId: null });
  };

  return (
    <div className="space-y-8 font-['Inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Integrações</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Conecte suas plataformas e automatize o acesso dos alunos.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Webhooks Criptografados
          </span>
        </div>
      </div>

      {/* Webhook Card - Visual Técnico */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-lg flex items-center justify-center text-brand-blue">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Configuração de Webhook</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cole esta URL na sua plataforma de vendas (ex: Kiwify, Hotmart).</p>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex items-center group relative overflow-hidden">
              <code className="text-xs md:text-sm text-blue-400 font-mono truncate">{userWebhookUrl}</code>
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-900 pointer-events-none group-hover:from-slate-800 transition-colors"></div>
            </div>
            <button
              onClick={handleCopyWebhook}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm border",
                copied
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-blue hover:text-brand-blue"
              )}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar URL'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Plataformas */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Plataformas Suportadas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={cn(
                "group bg-white dark:bg-slate-900 rounded-xl border p-5 transition-all duration-300 flex flex-col hover:shadow-md",
                platform.connected
                  ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-500/5 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
                  <span className="grayscale-[0.5] group-hover:grayscale-0 transition-all">{platform.logo}</span>
                </div>
                {platform.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wide border border-emerald-200 dark:border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[9px] font-bold uppercase tracking-wide border border-slate-100 dark:border-slate-700">
                    Offline
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{platform.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {platform.description}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex gap-2">
                {platform.connected ? (
                  <>
                    <button
                      onClick={() => openConfigModal(platform)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      <Settings className="w-3.5 h-3.5" /> Ajustes
                    </button>
                    <button
                      onClick={() => setDisconnectModal({ open: true, platformId: platform.id })}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                      title="Desconectar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openConfigModal(platform)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-brand-blue dark:hover:bg-brand-blue rounded-lg transition-all shadow-sm"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Conectar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Configuração */}
      {isModalOpen && selectedPlatform && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  {selectedPlatform.logo}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {selectedPlatform.connected ? 'Configurar Integração' : 'Conectar Plataforma'}
                  </h3>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">01</span>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Acesse seu painel no <strong>{selectedPlatform.name}</strong> e procure por "Webhooks" ou "Postback".
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">02</span>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Cole esta URL no campo de destino:</p>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                      <code className="flex-1 text-[11px] text-brand-blue font-mono truncate">{userWebhookUrl}</code>
                      <button onClick={handleCopyWebhook} className="text-slate-400 hover:text-brand-blue transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">03</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Selecione os eventos de venda:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlatform.webhookEvents.map((evt, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-bold text-slate-500 uppercase">
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent">
                  Cancelar
                </button>
                {!selectedPlatform.connected && (
                  <button
                    onClick={handleConnect}
                    className="flex-1 py-2.5 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-md"
                  >
                    Confirmar Conexão
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Desconectar */}
      {disconnectModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setDisconnectModal({ open: false, platformId: null })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-slide-up border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Desconectar Integração?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Novos acessos não serão liberados automaticamente até que você conecte novamente.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDisconnectModal({ open: false, platformId: null })} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase">
                  Voltar
                </button>
                <button onClick={handleDisconnect} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase shadow-lg">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;