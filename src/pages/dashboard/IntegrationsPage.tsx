import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Check, Copy, ExternalLink, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface Integration {
  id: string;
  platform: string;
  webhook_url: string;
  hottok?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

const IntegrationsPage: React.FC = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [hottok, setHottok] = useState('');

  // Plataformas disponíveis
  const platformsConfig = [
    { id: 'hotmart', name: 'Hotmart', enabled: true, logo: '/images/integrations/hotmart.png' },
    { id: 'kiwify', name: 'Kiwify', enabled: true, logo: '/images/integrations/kiwify.png' },
    { id: 'eduzz', name: 'Eduzz', enabled: false, logo: '/images/integrations/eduzz.png' },
    { id: 'perfectpay', name: 'PerfectPay', enabled: false, logo: '/images/integrations/perfectpay.png' },
    { id: 'ticto', name: 'Ticto', enabled: false, logo: '/images/integrations/ticto.png' },
    { id: 'cartpanda', name: 'CartPanda', enabled: false, logo: '/images/integrations/cartpanda.png' },
  ];

  useEffect(() => {
    if (user) {
      fetchIntegrations();
    }
  }, [user]);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWebhookUrl = (platform: string) => {
    if (!user) return 'https://api.tribebuild.pro/webhook/loading...';
    return `https://api.tribebuild.pro/webhook/${platform}`;
  };

  const copyToClipboard = async (text: string, platform: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedUrl(platform);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const saveIntegration = async () => {
    if (!selectedPlatform || !hottok.trim()) {
      alert('Por favor, preencha o Hottok');
      return;
    }

    try {
      const webhookUrl = generateWebhookUrl(selectedPlatform);

      const { error } = await supabase
        .from('integrations')
        .upsert({
          user_id: user!.id,
          platform: selectedPlatform,
          webhook_url: webhookUrl,
          hottok: hottok.trim(),
          status: 'active',
        }, {
          onConflict: 'user_id,platform'
        });

      if (error) throw error;

      alert('Integração configurada com sucesso!');
      setSelectedPlatform(null);
      setHottok('');
      fetchIntegrations();
    } catch (error: any) {
      console.error('Erro ao salvar integração:', error);
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const isIntegrationActive = (platformId: string) => {
    return integrations.some(i => i.platform === platformId && i.status === 'active');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-coral"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Integrações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Conecte sua área de membros com plataformas de pagamento para liberar acesso automaticamente.
          </p>
        </div>

        {/* Plataformas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platformsConfig.map((platform) => (
            <div
              key={platform.id}
              className={`
                bg-white dark:bg-gray-800 rounded-2xl border-2 p-8 transition-all duration-300
                ${platform.enabled
                  ? 'border-gray-200 dark:border-gray-700 hover:border-brand-coral hover:shadow-xl cursor-pointer'
                  : 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'}
              `}
              onClick={() => platform.enabled && setSelectedPlatform(platform.id)}
            >
              {/* Logo */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={platform.logo}
                    alt={platform.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      // Fallback para inicial se imagem não carregar
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <span class="text-4xl font-bold text-gray-400">${platform.name[0]}</span>
                      `;
                    }}
                  />
                </div>

                {/* Status Badge */}
                {platform.enabled ? (
                  isIntegrationActive(platform.id) ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                      CONECTADO
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full">
                      OFFLINE
                    </span>
                  )
                ) : (
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full">
                    EM BREVE
                  </span>
                )}
              </div>

              {/* Nome e Descrição */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {platform.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {platform.enabled
                  ? 'Configure o webhook para liberar acesso automaticamente.'
                  : 'Integração em desenvolvimento. Em breve disponível!'}
              </p>

              {/* Botão */}
              {platform.enabled && (
                <button
                  className={`
    w-full py-3 font-bold rounded-xl transition-all
    ${platform.enabled
                      ? 'bg-brand-coral hover:bg-brand-coral-dark dark:bg-brand-coral-darker dark:hover:bg-brand-coral-dark text-white shadow-lg shadow-brand-coral/20'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
  `}
                  onClick={() => platform.enabled && setSelectedPlatform(platform.id)}
                  disabled={!platform.enabled}
                >
                  {isIntegrationActive(platform.id) ? 'Reconfigurar' : 'Conectar Plataforma'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Modal de Configuração */}
        {selectedPlatform && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

              {/* Header do Modal */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <img
                      src={platformsConfig.find(p => p.id === selectedPlatform)?.logo}
                      alt={selectedPlatform}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <span class="text-2xl font-bold text-gray-400">${selectedPlatform[0].toUpperCase()}</span>
                        `;
                      }}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Configurar {platformsConfig.find(p => p.id === selectedPlatform)?.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedPlatform(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-500">×</span>
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 space-y-6">

                {/* Tutorial Passo a Passo */}
                <div className="space-y-4">

                  {/* Passo 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-coral text-white rounded-full flex items-center justify-center font-bold text-sm">
                      01
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300">
                        Acesse seu painel no <strong>{platformsConfig.find(p => p.id === selectedPlatform)?.name}</strong> e procure por <strong>"Webhooks"</strong> ou <strong>"Postback"</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Passo 2 - URL com cor ajustada */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-coral text-white rounded-full flex items-center justify-center font-bold text-sm">
                      02
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Cole esta URL no campo de destino:
                      </p>

                      {/* Card da URL - Ajustado para dark mode */}
                      <div className="bg-gradient-to-r from-brand-coral to-brand-coral-dark dark:from-brand-coral-darker dark:to-brand-coral-dark p-4 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between gap-3">
                          <code className="text-white font-mono text-sm break-all flex-1">
                            {generateWebhookUrl(selectedPlatform)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(generateWebhookUrl(selectedPlatform), selectedPlatform)}
                            className="flex-shrink-0 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          >
                            {copiedUrl === selectedPlatform ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <Copy className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passo 3 - Eventos corretos */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-coral text-white rounded-full flex items-center justify-center font-bold text-sm">
                      03
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Selecione os eventos na Hotmart:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Compra aprovada</strong> (obrigatório)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Compra reembolsada (opcional)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Cancelamento de Assinatura (opcional)
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex gap-2 text-xs text-blue-800 dark:text-blue-200">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <p>
                            <strong>Dica:</strong> Para começar, selecione apenas "Compra aprovada". Você pode adicionar outros eventos depois.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passo 4 - Campo Hottok */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-coral text-white rounded-full flex items-center justify-center font-bold text-sm">
                      04
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Copie o <strong>Hottok</strong> (token de autenticação) e cole aqui:
                      </p>
                      <input
                        type="text"
                        value={hottok}
                        onChange={(e) => setHottok(e.target.value)}
                        placeholder="Cole seu Hottok aqui..."
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/20 outline-none text-gray-900 dark:text-white"
                      />
                      <div className="mt-2 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>
                          O Hottok é um código de segurança fornecido pela {platformsConfig.find(p => p.id === selectedPlatform)?.name} para validar webhooks. Sem ele, os webhooks podem ser rejeitados.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Passo 5 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-coral text-white rounded-full flex items-center justify-center font-bold text-sm">
                      05
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 dark:text-gray-300">
                        Salve as configurações no painel da {platformsConfig.find(p => p.id === selectedPlatform)?.name} e clique em <strong>"Confirmar Conexão"</strong> abaixo.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Aviso de Segurança */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <strong className="block mb-1">Importante:</strong>
                      Mantenha seu Hottok em segurança. Não compartilhe com terceiros. Ele garante que apenas webhooks legítimos da {platformsConfig.find(p => p.id === selectedPlatform)?.name} sejam processados.
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer do Modal */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-800">
                <button
                  onClick={() => setSelectedPlatform(null)}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  FECHAR
                </button>
                <button
                  onClick={saveIntegration}
                  disabled={!hottok.trim()}
                  className="px-6 py-3 bg-brand-coral hover:bg-brand-coral-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-coral/20"
                >
                  CONFIRMAR CONEXÃO
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default IntegrationsPage;