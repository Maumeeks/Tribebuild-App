import React, { useState, useEffect } from 'react';
import {
  Link2, Check, Copy, ExternalLink, X, AlertCircle, CheckCircle2,
  Settings, Trash2, Zap, ShieldCheck, Loader2, Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useParams, useLocation } from 'react-router-dom';

interface Platform {
  id: string;
  name: string;
  logo: string;
  color: string;
  description: string;
  enabled: boolean; // ✅ NOVO: Controla se está liberada
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
    logo: '🔥',
    color: 'orange',
    description: 'Maior plataforma de produtos digitais da América Latina.',
    enabled: true, // ✅ LIBERADA
    webhookEvents: ['Compra aprovada', 'Cancelamento', 'Reembolso']
  },
  {
    id: 'kiwify',
    name: 'Kiwify',
    logo: '🥝',
    color: 'emerald',
    description: 'Checkout de alta conversão para produtos digitais.',
    enabled: true, // ✅ LIBERADA
    webhookEvents: ['Order Approved', 'Order Refunded']
  },
  {
    id: 'eduzz',
    name: 'Eduzz',
    logo: '📘',
    color: 'blue',
    description: 'Ecossistema completo para infoprodutores.',
    enabled: false, // ⚠️ BLOQUEADA
    webhookEvents: []
  },
  {
    id: 'monetizze',
    name: 'Monetizze',
    logo: '💰',
    color: 'green',
    description: 'Vendas de produtos físicos e digitais.',
    enabled: false, // ⚠️ BLOQUEADA
    webhookEvents: []
  },
  {
    id: 'braip',
    name: 'Braip',
    logo: '🚀',
    color: 'purple',
    description: 'Focada em produtos físicos e encapsulados.',
    enabled: false, // ⚠️ BLOQUEADA
    webhookEvents: []
  },
  {
    id: 'perfectpay',
    name: 'PerfectPay',
    logo: '💎',
    color: 'indigo',
    description: 'Plataforma robusta para alta escala.',
    enabled: false, // ⚠️ BLOQUEADA
    webhookEvents: []
  }
];

const IntegrationsPage: React.FC = () => {
  const { user } = useAuth();
  const params = useParams();
  const location = useLocation();

  // Estados
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disconnectModal, setDisconnectModal] = useState<{ open: boolean; integrationId: string | null }>({
    open: false,
    integrationId: null
  });
  const [appId, setAppId] = useState<string | null>(null);

  // Identificar App ID
  const getAppIdentifier = () => {
    if (params.appSlug) return params.appSlug;
    if (params.id) return params.id;
    const pathParts = location.pathname.split('/');
    const appsIndex = pathParts.indexOf('apps');
    if (appsIndex !== -1 && pathParts[appsIndex + 1]) return pathParts[appsIndex + 1];
    return null;
  };

  const appSlug = getAppIdentifier();
  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  // Buscar App ID e Integrações
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Buscar App ID
        if (!appSlug) throw new Error("App não identificado.");
        let query = supabase.from('apps').select('id');
        if (isUUID(appSlug)) query = query.eq('id', appSlug);
        else query = query.eq('slug', appSlug);

        const { data: appData, error: appError } = await query.single();
        if (appError || !appData) throw new Error("App não encontrado.");
        setAppId(appData.id);

        // 2. Buscar Integrações do App
        const { data: integrationsData, error: intError } = await supabase
          .from('integrations')
          .select('*')
          .eq('app_id', appData.id);

        if (intError) throw intError;
        setIntegrations(integrationsData || []);

      } catch (err) {
        console.error('[IntegrationsPage] Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug) fetchData();
  }, [appSlug]);

  // Gerar Webhook URL única
  const generateWebhookUrl = (platform: string) => {
    if (!appId) return 'https://api.tribebuild.pro/webhook/loading...';
    return `https://api.tribebuild.pro/webhook/${platform}/${appId}`;
  };

  // Copiar Webhook
  const handleCopyWebhook = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Abrir Modal de Conexão
  const openConfigModal = (platform: Platform) => {
    if (!platform.enabled) return; // ✅ Bloqueia se não estiver habilitada
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  };

  // Conectar Plataforma
  const handleConnect = async () => {
    if (!selectedPlatform || !appId || !user) return;

    try {
      const webhookUrl = generateWebhookUrl(selectedPlatform.id);

      const { error } = await supabase.from('integrations').insert([{
        user_id: user.id,
        app_id: appId,
        platform: selectedPlatform.id,
        webhook_url: webhookUrl,
        is_active: true,
        product_mapping: {}
      }]);

      if (error) throw error;

      // Recarregar integrações
      const { data } = await supabase
        .from('integrations')
        .select('*')
        .eq('app_id', appId);

      setIntegrations(data || []);
      setIsModalOpen(false);
      setSelectedPlatform(null);

    } catch (err: any) {
      alert('Erro ao conectar: ' + err.message);
    }
  };

  // Desconectar Plataforma
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

  // Verificar se plataforma está conectada
  const isConnected = (platformId: string) => {
    return integrations.find(i => i.platform === platformId && i.is_active);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Integrações</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Conecte suas plataformas e libere acesso automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Webhooks Seguros
          </span>
        </div>
      </div>

      {/* Grid de Plataformas */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Plataformas Disponíveis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {platformsConfig.map((platform) => {
            const connected = isConnected(platform.id);

            return (
              <div
                key={platform.id}
                className={cn(
                  "group bg-white dark:bg-slate-900 rounded-xl border p-5 transition-all duration-300 flex flex-col",
                  connected
                    ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-500/5 shadow-sm"
                    : platform.enabled
                      ? "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                      : "border-slate-200 dark:border-slate-800 opacity-60"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shadow-sm transition-transform",
                    platform.enabled && "group-hover:scale-105",
                    !platform.enabled && "grayscale"
                  )}>
                    <span className={cn(
                      "transition-all",
                      platform.enabled ? "grayscale-[0.5] group-hover:grayscale-0" : "grayscale"
                    )}>
                      {platform.logo}
                    </span>
                  </div>

                  {/* Badge de Status */}
                  {!platform.enabled ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wide border border-amber-200 dark:border-amber-500/20">
                      <Lock className="w-3 h-3" /> Em Breve
                    </span>
                  ) : connected ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wide border border-emerald-200 dark:border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Ativo
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

                {/* Botões */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex gap-2">
                  {!platform.enabled ? (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-not-allowed border border-slate-200 dark:border-slate-700"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Em Breve
                    </button>
                  ) : connected ? (
                    <>
                      <button
                        onClick={() => openConfigModal(platform)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        <Settings className="w-3.5 h-3.5" /> Ver Webhook
                      </button>
                      <button
                        onClick={() => setDisconnectModal({ open: true, integrationId: connected.id })}
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
            );
          })}
        </div>
      </div>

      {/* Modal de Configuração */}
      {isModalOpen && selectedPlatform && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-slate-200 dark:border-slate-800">

            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  {selectedPlatform.logo}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  {isConnected(selectedPlatform.id) ? 'Webhook Configurado' : 'Conectar Plataforma'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Body */}
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
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-bold">Cole esta URL no campo de destino:</p>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <code className="flex-1 text-[11px] text-blue-400 font-mono truncate">
                        {generateWebhookUrl(selectedPlatform.id)}
                      </code>
                      <button
                        onClick={() => handleCopyWebhook(generateWebhookUrl(selectedPlatform.id))}
                        className="text-slate-400 hover:text-brand-blue transition-colors flex-shrink-0"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">03</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 font-bold">Selecione os eventos:</p>
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

              {/* Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Fechar
                </button>
                {!isConnected(selectedPlatform.id) && (
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setDisconnectModal({ open: false, integrationId: null })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-slide-up border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-4 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Desconectar?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Novos alunos não serão liberados automaticamente até reconectar.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDisconnectModal({ open: false, integrationId: null })}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold uppercase shadow-lg"
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