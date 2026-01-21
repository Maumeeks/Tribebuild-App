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
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

// Tipos
interface Platform {
  id: string;
  name: string;
  logo: string; // Emoji ou URL de icone
  color: string; // Cor da marca (para o icone)
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
    color: 'bg-orange-500',
    connected: false,
    description: 'Maior plataforma de produtos digitais da América Latina.',
    webhookEvents: ['Compra aprovada', 'Cancelamento', 'Reembolso']
  },
  {
    id: 'kiwify',
    name: 'Kiwify',
    logo: '🥝',
    color: 'bg-green-500',
    connected: false,
    description: 'Checkout de alta conversão para produtos digitais.',
    webhookEvents: ['Order Approved', 'Order Refunded']
  },
  {
    id: 'eduzz',
    name: 'Eduzz',
    logo: '📘',
    color: 'bg-blue-600',
    connected: false,
    description: 'Ecossistema completo para infoprodutores.',
    webhookEvents: ['Fatura Paga', 'Fatura Cancelada']
  },
  {
    id: 'monetizze',
    name: 'Monetizze',
    logo: '💰',
    color: 'bg-emerald-600',
    connected: false,
    description: 'Vendas de produtos físicos e digitais.',
    webhookEvents: ['Venda Finalizada', 'Reembolso']
  },
  {
    id: 'braip',
    name: 'Braip',
    logo: '🚀',
    color: 'bg-purple-600',
    connected: false,
    description: 'Focada em produtos físicos e encapsulados.',
    webhookEvents: ['Venda Aprovada', 'Chargeback']
  },
  {
    id: 'perfectpay',
    name: 'PerfectPay',
    logo: '💎',
    color: 'bg-indigo-600',
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

  // URL do Webhook
  const userWebhookUrl = user?.id
    ? `https://api.tribebuild.pro/webhook/${user.id}`
    : 'Carregando URL...';

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

      {/* Header Compacto e Profissional */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Integrações</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Automatize a liberação de acesso conectando suas plataformas de venda.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">
            Webhooks Seguros
          </span>
        </div>
      </div>

      {/* Webhook Card - Estilo "Code Snippet" */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Seu Link de Integração (Webhook)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Copie este endereço e cole nas configurações de "Webhook" ou "Postback" da sua plataforma de vendas.
              Assim que uma venda for aprovada, nós liberamos o app instantaneamente.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 font-mono text-xs md:text-sm text-slate-600 dark:text-slate-300 truncate flex items-center">
            {userWebhookUrl}
          </div>
          <button
            onClick={handleCopyWebhook}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm border",
              copied
                ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-blue hover:text-brand-blue"
            )}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar URL'}
          </button>
        </div>
      </div>

      {/* Grid de Plataformas */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
          Plataformas Disponíveis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={cn(
                "group bg-white dark:bg-slate-900 rounded-xl border p-6 transition-all duration-300 flex flex-col",
                platform.connected
                  ? "border-green-200 dark:border-green-900/50 bg-green-50/10"
                  : "border-slate-200 dark:border-slate-800 hover:border-brand-blue/30 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-sm",
                  platform.color + "/10" // Fundo suave com a cor da marca
                )}>
                  <span className="drop-shadow-sm">{platform.logo}</span>
                </div>
                {platform.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wide">
                    <CheckCircle2 className="w-3 h-3" /> Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wide group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Offline
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{platform.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-grow">
                {platform.description}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex gap-2">
                {platform.connected ? (
                  <>
                    <button
                      onClick={() => openConfigModal(platform)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      <Settings className="w-3.5 h-3.5" /> Configurar
                    </button>
                    <button
                      onClick={() => setDisconnectModal({ open: true, platformId: platform.id })}
                      className="w-10 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100"
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

      {/* Modal de Configuração (Clean Style) */}
      {isModalOpen && selectedPlatform && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-slate-200 dark:border-slate-700">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm bg-white dark:bg-slate-800")}>
                  {selectedPlatform.logo}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedPlatform.connected ? 'Configurações' : 'Nova Conexão'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Integração com {selectedPlatform.name}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Passo a Passo */}
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Acesse sua conta no <strong>{selectedPlatform.name}</strong> e vá para as configurações de <strong>Webhook / Postback</strong>.
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Cole a URL abaixo no campo de endereço:
                    </p>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                      <code className="flex-1 text-xs text-slate-600 dark:text-slate-400 font-mono truncate">{userWebhookUrl}</code>
                      <button onClick={handleCopyWebhook} className="text-brand-blue hover:text-blue-600" title="Copiar">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      Selecione os eventos de venda aprovada:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlatform.webhookEvents.map((evt, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-500 uppercase">
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão Ação Principal */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors"
                >
                  Fechar
                </button>
                {!selectedPlatform.connected && (
                  <button
                    onClick={handleConnect}
                    className="flex-1 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    Confirmar Conexão
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Desconectar (Clean Style) */}
      {disconnectModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setDisconnectModal({ open: false, platformId: null })} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Desconectar?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                A integração será pausada e novos alunos não receberão acesso automático.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDisconnectModal({ open: false, platformId: null })}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase shadow-lg shadow-red-500/20"
                >
                  Sim, Desconectar
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