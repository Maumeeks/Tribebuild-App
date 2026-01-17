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
  HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext'; // <--- Adicionado para pegar o ID real

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

// Dados ricos das plataformas
const initialPlatforms: Platform[] = [
  {
    id: 'hotmart',
    name: 'Hotmart',
    logo: '🔥',
    color: 'bg-orange-500',
    connected: false,
    description: 'A maior plataforma de produtos digitais da América Latina.',
    webhookEvents: ['Compra aprovada', 'Compra cancelada', 'Reembolso', 'Assinatura cancelada']
  },
  {
    id: 'kiwify',
    name: 'Kiwify',
    logo: '🥝',
    color: 'bg-green-500',
    connected: false,
    description: 'Plataforma completa para vender produtos digitais.',
    webhookEvents: ['Compra aprovada', 'Compra cancelada', 'Reembolso']
  },
  {
    id: 'eduzz',
    name: 'Eduzz',
    logo: '📘',
    color: 'bg-blue-600',
    connected: false,
    description: 'Ecossistema completo para infoprodutores.',
    webhookEvents: ['Compra aprovada', 'Compra cancelada', 'Reembolso', 'Carrinho abandonado']
  },
  {
    id: 'monetizze',
    name: 'Monetizze',
    logo: '💰',
    color: 'bg-green-600',
    connected: false,
    description: 'Plataforma de vendas e afiliados.',
    webhookEvents: ['Compra aprovada', 'Compra cancelada', 'Reembolso']
  },
  {
    id: 'braip',
    name: 'Braip',
    logo: '🚀',
    color: 'bg-purple-600',
    connected: false,
    description: 'Plataforma de checkout e gestão de vendas.',
    webhookEvents: ['Compra aprovada', 'Reembolso', 'Chargeback']
  },
  {
    id: 'perfectpay',
    name: 'PerfectPay',
    logo: '✨',
    color: 'bg-indigo-600',
    connected: false,
    description: 'Checkout de alta conversão.',
    webhookEvents: ['Compra aprovada', 'Compra cancelada', 'Reembolso']
  }
];

const IntegrationsPage: React.FC = () => {
  const { user } = useAuth(); // <--- Pegando usuário real
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disconnectModal, setDisconnectModal] = useState<{ open: boolean; platformId: string | null }>({
    open: false,
    platformId: null
  });

  // URL Dinâmica baseada no ID do usuário
  const userWebhookUrl = user?.id 
    ? `https://api.tribebuild.com/webhook/${user.id}`
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-10 font-['Inter'] pb-20">
      {/* Header */}
      <div className="space-y-3 animate-slide-up">
        <h1 className="text-3xl font-black text-brand-blue tracking-tighter leading-tight">Integrações</h1>
        <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
          Conecte seu app com plataformas de vendas para liberar acesso automático aos compradores.
        </p>
      </div>

      {/* Webhook URL Card */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 md:p-10 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Link2 className="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Seu Webhook URL</h2>
              <p className="text-slate-500 text-sm mt-1 font-medium">Use esta URL para configurar o webhook na sua plataforma de vendas.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-80 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-2xl p-4 font-mono text-sm text-slate-600 truncate">
              {userWebhookUrl}
            </div>
            <Button
              onClick={handleCopyWebhook}
              className={cn(
                "h-14 px-8 font-black uppercase tracking-widest text-xs transition-all whitespace-nowrap",
                copied ? "bg-green-500 hover:bg-green-600 shadow-green-500/20" : "shadow-blue-500/20"
              )}
              leftIcon={copied ? Check : Copy}
            >
              {copied ? 'Copiado!' : 'Copiar URL'}
            </Button>
          </div>
        </div>

        <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-brand-blue">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-black text-brand-blue uppercase tracking-tight">Como funciona?</p>
            <p className="text-sm text-blue-800 font-medium leading-relaxed">
              Configure este webhook na sua plataforma de vendas. Quando uma compra for aprovada, o acesso será liberado automaticamente no seu app.
            </p>
          </div>
        </div>
      </div>

      {/* Plataformas Grid */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Plataformas Disponíveis</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={cn(
                "bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 p-8 transition-all duration-300 relative group overflow-hidden",
                platform.connected
                  ? "border-green-200 bg-green-50/20 shadow-sm"
                  : "border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5"
              )}
            >
              {/* Connected Badge Overlay */}
              {platform.connected && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-green-500 text-white p-1 rounded-full shadow-lg">
                    <Check className="w-3 h-3 stroke-[4px]" />
                  </div>
                </div>
              )}

              {/* Logo e Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110",
                  platform.color
                )}>
                  {platform.logo}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-lg">{platform.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {platform.connected ? (
                      <div className="flex items-center gap-1 text-green-600 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Conectado
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <div className="w-2 h-2 bg-slate-300 rounded-full" />
                        Não conectado
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 min-h-[48px]">
                {platform.description}
              </p>

              {platform.connected && platform.connectedAt && (
                <div className="mb-8 pt-6 border-t border-green-100 flex items-center gap-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conectado em {formatDate(platform.connectedAt)}</span>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-auto">
                {platform.connected ? (
                  <>
                    <button
                      onClick={() => openConfigModal(platform)}
                      className="flex-1 h-12 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 text-slate-600 border border-slate-200 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest shadow-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Configurar
                    </button>
                    <button
                      onClick={() => setDisconnectModal({ open: true, platformId: platform.id })}
                      className="w-12 h-12 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-all shadow-sm border border-red-100"
                      title="Desconectar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Button
                    onClick={() => openConfigModal(platform)}
                    className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10"
                    leftIcon={Link2}
                  >
                    Conectar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Configuração / Conexão */}
      {isModalOpen && selectedPlatform && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm", selectedPlatform.color)}>
                  {selectedPlatform.logo}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedPlatform.connected ? 'Configurar' : 'Conectar'} {selectedPlatform.name}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">Siga os passos abaixo</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Instruções Detalhadas */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   Como configurar:
                </h4>
                <div className="space-y-4">
                  {[
                    `Acesse sua conta no ${selectedPlatform.name}`,
                    "Vá em Configurações → Webhooks (ou Integrações)",
                    "Cole a URL do webhook abaixo",
                    "Selecione os eventos desejados e salve"
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <span className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm">
                        {idx + 1}
                      </span>
                      <span className="text-slate-600 text-sm font-medium leading-relaxed group-hover:text-slate-900 dark:text-white transition-colors">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Webhook URL Cópia Rápida */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Webhook URL</label>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-2xl p-4">
                  <code className="flex-1 text-xs text-slate-700 font-mono break-all font-bold">
                    {userWebhookUrl}
                  </code>
                  <button
                    onClick={handleCopyWebhook}
                    className="p-2.5 bg-white text-slate-400 hover:text-brand-blue rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all"
                    title="Copiar URL"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Eventos Necessários */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Eventos suportados</label>
                <div className="flex flex-wrap gap-2">
                  {selectedPlatform.webhookEvents.map((event, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-tight rounded-xl shadow-sm"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botão Externo */}
              <a
                href={`https://${selectedPlatform.name.toLowerCase()}.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
              >
                Acessar painel do {selectedPlatform.name}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 sticky bottom-0">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              {!selectedPlatform.connected && (
                <Button
                  onClick={handleConnect}
                  className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
                  leftIcon={CheckCircle2}
                >
                  Marcar como Conectado
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Desconectar */}
      {disconnectModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setDisconnectModal({ open: false, platformId: null })} />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Desconectar integração?
            </h3>
            <p className="text-slate-500 text-center mb-10 font-medium leading-relaxed">
              Os novos compradores não terão acesso liberado automaticamente até que você reconecte.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDisconnect}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 transition-all active:scale-95"
              >
                Sim, desconectar
              </button>
              <button
                onClick={() => setDisconnectModal({ open: false, platformId: null })}
                className="w-full py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;