
import React, { useState } from 'react';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  RefreshCw,
  AlertTriangle,
  Lock,
  Loader2
} from 'lucide-react';

interface TwoFactorMethod {
  id: 'app' | 'email' | 'sms';
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  configured: boolean;
}

export default function Admin2FASettingsPage() {
  // Estado dos métodos 2FA
  const [methods, setMethods] = useState<TwoFactorMethod[]>([
    {
      id: 'app',
      name: 'App Autenticador',
      description: 'Use Google Authenticator, Authy ou similar',
      icon: <Smartphone className="w-6 h-6" />,
      enabled: true,
      configured: true
    },
    {
      id: 'email',
      name: 'Código por Email',
      description: 'Receba um código no seu email cadastrado',
      icon: <Mail className="w-6 h-6" />,
      enabled: true,
      configured: true
    },
    {
      id: 'sms',
      name: 'SMS (Em breve)',
      description: 'Receba um código por mensagem de texto',
      icon: <Smartphone className="w-6 h-6" />,
      enabled: false,
      configured: false
    }
  ]);

  // Estado para setup do autenticador
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup' | 'done'>('qr');
  const [verifyCode, setVerifyCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Códigos de backup (demo)
  const [backupCodes] = useState([
    'ABCD-1234-EFGH',
    'IJKL-5678-MNOP',
    'QRST-9012-UVWX',
    'YZAB-3456-CDEF',
    'GHIJ-7890-KLMN',
    'OPQR-1234-STUV',
    'WXYZ-5678-ABCD',
    'EFGH-9012-IJKL'
  ]);

  // QR Code placeholder (em produção, seria gerado pelo backend)
  const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/TribeBuild:admin@tribebuild.com?secret=JBSWY3DPEHPK3PXP&issuer=TribeBuild';
  const secretKey = 'JBSWY3DPEHPK3PXP';

  const handleToggleMethod = (methodId: string) => {
    setMethods(methods.map(m => 
      m.id === methodId ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const handleVerifySetup = () => {
    setIsLoading(true);
    // TODO: [BACKEND] Verificar código TOTP
    setTimeout(() => {
      if (verifyCode === '123456') {
        setSetupStep('backup');
      } else {
        alert('Código inválido. Use 123456 para demo.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Autenticação em Duas Etapas</h1>
              <p className="text-slate-500 dark:text-slate-400">Proteja sua conta com uma camada extra de segurança</p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">2FA Ativado</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Sua conta está protegida com verificação em duas etapas</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full">
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Ativo</span>
            </div>
          </div>
        </div>

        {/* Métodos de Verificação */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Métodos de Verificação</h2>
          
          <div className="space-y-4">
            {methods.map((method) => (
              <div 
                key={method.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  method.enabled 
                    ? 'border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    method.enabled 
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {method.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">{method.name}</h3>
                      {method.configured && method.enabled && (
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                          Configurado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{method.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {method.id !== 'sms' && (
                    <>
                      {method.id === 'app' && (
                        <button
                          onClick={() => setShowSetup(true)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                        >
                          Reconfigurar
                        </button>
                      )}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={method.enabled}
                          onChange={() => handleToggleMethod(method.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </>
                  )}
                  {method.id === 'sms' && (
                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium rounded-full">
                      Em breve
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Códigos de Backup */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Códigos de Backup</h2>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Gerar novos
            </button>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Guarde estes códigos em local seguro
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Cada código só pode ser usado uma vez. Use-os caso perca acesso ao seu método de verificação principal.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {backupCodes.map((code, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono text-sm"
              >
                <span className="text-slate-700 dark:text-slate-300">{code}</span>
                <button 
                  onClick={() => copyToClipboard(code)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Aviso de Segurança */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Dicas de Segurança</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Nunca compartilhe seus códigos de verificação</li>
                <li>• Use um app autenticador ao invés de SMS quando possível</li>
                <li>• Mantenha seus códigos de backup em local seguro offline</li>
                <li>• Revise regularmente os dispositivos conectados à sua conta</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== MODAL SETUP AUTENTICADOR ==================== */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            
            {/* Etapa 1: QR Code */}
            {setupStep === 'qr' && (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-2xl mb-4">
                    <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Configurar Autenticador</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Escaneie o QR code com seu app autenticador
                  </p>
                </div>

                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white rounded-2xl shadow-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-2">
                    Ou insira manualmente:
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <code className="flex-1 text-sm font-mono text-slate-700 dark:text-slate-300 text-center">
                      {secretKey}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(secretKey)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setSetupStep('verify')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
                >
                  Continuar
                </button>
              </>
            )}

            {/* Etapa 2: Verificar Código */}
            {setupStep === 'verify' && (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-2xl mb-4">
                    <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verificar Configuração</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Digite o código de 6 dígitos do seu app
                  </p>
                </div>

                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none mb-6"
                />

                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl mb-6">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 text-center">
                    🔐 Demo: Use o código <span className="font-bold">123456</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSetupStep('qr')}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleVerifySetup}
                    disabled={verifyCode.length !== 6 || isLoading}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verificar'}
                  </button>
                </div>
              </>
            )}

            {/* Etapa 3: Códigos de Backup */}
            {setupStep === 'backup' && (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Configuração Concluída!</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Salve seus códigos de backup em local seguro
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {backupCodes.slice(0, 4).map((code, index) => (
                    <div key={index} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center font-mono text-sm text-slate-700 dark:text-slate-300">
                      {code}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowSetup(false);
                    setSetupStep('qr');
                    setVerifyCode('');
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                >
                  Concluir
                </button>
              </>
            )}

            {/* Botão Fechar */}
            <button
              onClick={() => {
                setShowSetup(false);
                setSetupStep('qr');
                setVerifyCode('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
