import React, { useState, useEffect } from 'react';
import {
  Link2, Check, Copy, X, AlertCircle, CheckCircle2,
  Settings, Trash2, ShieldCheck, Loader2, Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Platform {
  id: string;
  name: string;
  logo: string;
  color: string;
  description: string;
  enabled: boolean;
  webhookEvents: string[];
}

interface Integration {
  id: string;
  platform: string;
  webhook_url: string;
  is_active: boolean;
  created_at: string;
}

const platformsConfig: Platform[] = [
  {
    id: 'hotmart',
    name: 'Hotmart',
    logo: '/images/integrations/b4you.png', // ✅ Ajuste depois para hotmart.png
    color: 'orange',
    description: 'Maior plataforma de produtos digitais da América Latina.',
    enabled: true,
    webhookEvents: ['Compra aprovada', 'Cancelamento', 'Reembolso']
  },
  {
    id: 'kiwify',
    name: 'Kiwify',
    logo: '/images/integrations/kiwify.png',
    color: 'emerald',
    description: 'Checkout de alta conversão para produtos digitais.',
    enabled: true,
    webhookEvents: ['Order Approved', 'Order Refunded']
  },
  {
    id: 'eduzz',
    name: 'Eduzz',
    logo: '/images/integrations/eduzz.png',
    color: 'blue',
    description: 'Ecossistema completo para infoprodutores.',
    enabled: false,
    webhookEvents: []
  },
  {
    id: 'perfectpay',
    name: 'PerfectPay',
    logo: '/images/integrations/perfectpay.png',
    color: 'indigo',
    description: 'Plataforma robusta para alta escala.',
    enabled: false,
    webhookEvents: []
  },
  {
    id: 'ticto',
    name: 'Ticto',
    logo: '/images/integrations/ticto.png',
    color: 'purple',
    description: 'Checkout moderno e rápido.',
    enabled: false,
    webhookEvents: []
  },
  {
    id: 'cartpanda',
    name: 'Cart Panda',
    logo: '/images/integrations/cartpanda.png',
    color: 'blue',
    description: 'Checkout otimizado para conversão.',
    enabled: false,
    webhookEvents: []
  }
];

const IntegrationsPage: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disconnectModal, setDisconnectModal] = useState<{ open: boolean; integrationId: string | null }>({
    open: false,
    integrationId: null
  });

  // ✅ BUSCAR INTEGRAÇÕES APENAS UMA VEZ (SEM RECARREGAR)
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: integrationsData, error: intError } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user.id);

        if (intError) throw intError;

        setIntegrations(integrationsData || []);

      } catch (err: any) {
        console.error('[IntegrationsPage] Erro:', err);
        setError(err.message || 'Erro ao carregar integrações');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // ✅ ARRAY VAZIO = EXECUTA APENAS UMA VEZ

  const generateWebhookUrl = (platform: string) => {
    if (!user) return 'https://api.tribebuild.pro/webhook/loading...';
    return `https://api.tribebuild.pro/webhook/${platform}/${user.id}`;
  };

  const handleCopyWebhook = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const openConfigModal = (platform: Platform) => {
    if (!platform.enabled) return;
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  };

  const handleConnect = async () => {
    if (!selectedPlatform || !user) return;

    try {
      const webhookUrl = generateWebhookUrl(selectedPlatform.id);

      const { error } = await supabase.from('integrations').insert([{
        user_id: user.id,
        app_id: null,
        platform: selectedPlatform.id,
        webhook_url: webhookUrl,
        is_active: true,
        product_mapping: {}
      }]);

      if (error) throw error;

      const { data } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id);

      setIntegrations(data || []);
      setIsModalOpen(false);
      setSelectedPlatform(null);

    } catch (err: any) {
      alert('Erro ao conectar: ' + err.message);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectModal.integrationId) return;

    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', disconnectModal.integrationId);

      if (error) throw error;

      setIntegrations(integrations.filter(i => i.id !== disconnectModal.integrationId));
      setDisconnectModal({ open: false, integrationId: null });

    } catch (err: any) {
      alert('Erro ao desconectar: ' + err.message);
    }
  };

  const isConnected = (platformId: string) => {
    return integrations.find(i => i.platform === platformId && i.is_active);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <p className="text-sm text-slate-500">Carregando integrações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Erro ao Carregar</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-['inter'] pb-20 animate-fade-in max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Integrações</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Conecte suas plataformas e libere acesso automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl shadow-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Webhooks Seguros
          </span>
        </div>
      </div>

      {/* Grid de Plataformas - MELHORADO */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-blue" /> Plataformas Disponíveis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformsConfig.map((platform) => {
            const connected = isConnected(platform.id);

            return (
              <div
                key={platform.id}
                className={cn(
                  "group bg-white dark:bg-slate-900 rounded-2xl border-2 p-8 transition-all duration-300 flex flex-col hover:shadow-xl",
                  connected
                    ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-500/5 shadow-lg shadow-emerald-100/50"
                    : platform.enabled
                      ? "border-slate-200 dark:border-slate-800 hover:border-brand-blue/30 dark:hover:border-brand-blue/30"
                      : "border-slate-200 dark:border-slate-800 opacity-60"
                )}
              >
                <div className="flex justify-between items-start mb-6">
                  {/* ✅ LOGO MAIOR (como no HuskyApp) */}
                  <div className={cn(
                    "w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md transition-transform p-3",
                    platform.enabled && "group-hover:scale-105",
                    !platform.enabled && "grayscale"
                  )}>
                    <img
                      src={platform.logo}
                      alt={platform.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'text-2xl font-bold text-slate-400';
                        fallback.textContent = platform.name.charAt(0);
                        e.currentTarget.parentElement!.appendChild(fallback);
                      }}
                    />
                  </div>

                  {/* Badge de Status */}
                  {!platform.enabled ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-500/20">
                      <Lock className="w-3.5 h-3.5" /> Em Breve
                    </span>
                  ) : connected ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                      Offline
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{platform.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 flex-1">
                  {platform.description}
                </p>

                {/* Botões */}
                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                  {!platform.enabled ? (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-not-allowed border-2 border-slate-200 dark:border-slate-700"
                    >
                      <Lock className="w-4 h-4" />
                      Em Breve
                    </button>
                  ) : connected ? (
                    <>
                      <button
                        onClick={() => openConfigModal(platform)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border-2 border-slate-200 dark:border-slate-700"
                      >
                        <Settings className="w-4 h-4" /> Configurar
                      </button>
                      <button
                        onClick={() => setDisconnectModal({ open: true, integrationId: connected.id })}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors border-2 border-slate-200 dark:border-slate-700"
                        title="Desconectar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openConfigModal(platform)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl transition-all shadow-lg shadow-blue-500/20 border-2 border-brand-blue"
                    >
                      <Link2 className="w-4 h-4" />
                      Conectar Plataforma
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Configuração */}
      {isModalOpen && selectedPlatform && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up border-2 border-slate-200 dark:border-slate-800">

            <div className="p-6 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-2">
                  <img src={selectedPlatform.logo} alt={selectedPlatform.name} className="w-full h-full object-contain" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Configurar {selectedPlatform.name}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <span className="w-7 h-7 bg-brand-blue/10 text-brand-blue border-2 border-brand-blue/20 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">01</span>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Acesse seu painel no <strong>{selectedPlatform.name}</strong> e procure por <strong>"Webhooks"</strong> ou <strong>"Postback"</strong>.
                  </p>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-7 h-7 bg-brand-blue/10 text-brand-blue border-2 border-brand-blue/20 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">02</span>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-bold">Cole esta URL no campo de destino:</p>
                    <div className="flex items-center gap-2 bg-slate-900 border-2 border-slate-800 rounded-xl p-4">
                      <code className="flex-1 text-xs text-blue-400 font-mono break-all">
                        {generateWebhookUrl(selectedPlatform.id)}
                      </code>
                      <button
                        onClick={() => handleCopyWebhook(generateWebhookUrl(selectedPlatform.id))}
                        className="text-slate-400 hover:text-brand-blue transition-colors flex-shrink-0 p-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-7 h-7 bg-brand-blue/10 text-brand-blue border-2 border-brand-blue/20 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">03</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 font-bold">Selecione os eventos:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlatform.webhookEvents.map((evt, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Fechar
                </button>
                {!isConnected(selectedPlatform.id) && (
                  <button
                    onClick={handleConnect}
                    className="flex-1 py-3 bg-brand-blue text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setDisconnectModal({ open: false, integrationId: null })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-slide-up border-2 border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4 border-2 border-red-200 dark:border-red-800">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Desconectar Integração?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Novos alunos não serão liberados automaticamente até você reconectar esta plataforma.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDisconnectModal({ open: false, integrationId: null })}
                  className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold uppercase shadow-lg shadow-red-500/20 transition-all"
                >
                  Desconectar
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