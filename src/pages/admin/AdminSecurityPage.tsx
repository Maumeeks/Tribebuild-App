
import React, { useState } from 'react';
import { 
  Shield,
  ShieldCheck,
  Smartphone,
  Lock,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Mail,
  Clock,
  ArrowLeft,
  Info,
  QrCode,
  Fingerprint
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

// Estados do 2FA
type TwoFactorStatus = 'disabled' | 'setup' | 'verify' | 'enabled';

const AdminSecurityPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus>('disabled');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Configurações de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Mock do QR Code (em produção, seria gerado pelo backend)
  const mockQRSecret = 'JBSWY3DPEHPK3PXP';
  const mockBackupCodes = [
    'A1B2-C3D4-E5F6',
    'G7H8-I9J0-K1L2',
    'M3N4-O5P6-Q7R8',
    'S9T0-U1V2-W3X4',
    'Y5Z6-A7B8-C9D0',
    'E1F2-G3H4-I5J6',
    'K7L8-M9N0-O1P2',
    'Q3R4-S5T6-U7V8'
  ];

  // Histórico de sessões (mock)
  const sessions = [
    { id: 1, device: 'Chrome no Windows', location: 'São Paulo, BR', ip: '189.xxx.xxx.xxx', current: true, lastActive: 'Agora' },
    { id: 2, device: 'Safari no iPhone', location: 'São Paulo, BR', ip: '189.xxx.xxx.xxx', current: false, lastActive: '2 horas atrás' },
    { id: 3, device: 'Firefox no MacOS', location: 'Rio de Janeiro, BR', ip: '201.xxx.xxx.xxx', current: false, lastActive: '3 dias atrás' },
  ];

  // Handler para input do código de verificação
  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus próximo input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handler para backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Iniciar setup do 2FA
  const startTwoFactorSetup = () => {
    setTwoFactorStatus('setup');
    setError(null);
  };

  // Verificar código
  const verifyCode = () => {
    setIsLoading(true);
    setError(null);

    // Simular verificação (em produção, validaria no backend)
    setTimeout(() => {
      const code = verificationCode.join('');
      if (code === '123456') { // Mock - aceita 123456
        setTwoFactorStatus('enabled');
        setShowBackupCodes(true);
      } else {
        setError('Código inválido. Tente novamente.');
        setVerificationCode(['', '', '', '', '', '']);
        document.getElementById('code-0')?.focus();
      }
      setIsLoading(false);
    }, 1500);
  };

  // Desativar 2FA
  const disableTwoFactor = () => {
    if (window.confirm('Tem certeza que deseja desativar a autenticação em dois fatores? Isso reduzirá a segurança da sua conta.')) {
      setTwoFactorStatus('disabled');
      setVerificationCode(['', '', '', '', '', '']);
      setShowBackupCodes(false);
    }
  };

  // Copiar código de backup
  const copyBackupCodes = () => {
    navigator.clipboard.writeText(mockBackupCodes.join('\n'));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Alterar senha
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    // TODO: Implementar alteração de senha no backend
    alert('Senha alterada com sucesso! (Simulação)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Encerrar sessão
  const terminateSession = (sessionId: number) => {
    if (window.confirm('Deseja encerrar esta sessão?')) {
      // TODO: Implementar no backend
      alert('Sessão encerrada! (Simulação)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/settings')}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Segurança da Conta</h1>
              <p className="text-xs text-slate-500">Autenticação em dois fatores e configurações de segurança</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold">Conta Protegida</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        
        {/* ==================== SEÇÃO 2FA ==================== */}
        <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                twoFactorStatus === 'enabled' 
                  ? "bg-emerald-100 text-emerald-600" 
                  : "bg-amber-100 text-amber-600"
              )}>
                {twoFactorStatus === 'enabled' ? (
                  <ShieldCheck className="w-7 h-7" />
                ) : (
                  <Shield className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">Autenticação em Dois Fatores (2FA)</h2>
                  {twoFactorStatus === 'enabled' ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Ativado
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Desativado
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Adicione uma camada extra de segurança exigindo um código além da senha para fazer login.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Estado: Desativado */}
            {twoFactorStatus === 'disabled' && (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 mb-1">Recomendação de Segurança</h4>
                    <p className="text-sm text-amber-700">
                      Contas de administrador devem ter 2FA ativado para proteção contra acessos não autorizados.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl">
                    <Smartphone className="w-8 h-8 text-brand-blue mb-3" />
                    <h4 className="font-bold text-slate-900 mb-1">App Autenticador</h4>
                    <p className="text-xs text-slate-500">Use Google Authenticator, Authy ou similar</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl">
                    <Key className="w-8 h-8 text-brand-blue mb-3" />
                    <h4 className="font-bold text-slate-900 mb-1">Códigos de Backup</h4>
                    <p className="text-xs text-slate-500">8 códigos de uso único para emergências</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl">
                    <Lock className="w-8 h-8 text-brand-blue mb-3" />
                    <h4 className="font-bold text-slate-900 mb-1">Proteção Total</h4>
                    <p className="text-xs text-slate-500">Mesmo com senha vazada, sua conta fica segura</p>
                  </div>
                </div>

                <button
                  onClick={startTwoFactorSetup}
                  className="w-full md:w-auto px-8 py-4 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <Shield className="w-5 h-5" />
                  Ativar Autenticação 2FA
                </button>
              </div>
            )}

            {/* Estado: Configurando */}
            {twoFactorStatus === 'setup' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl">
                  <Info className="w-5 h-5 text-brand-blue flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Escaneie o QR Code com seu app autenticador (Google Authenticator, Authy, etc.)
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 bg-white border-2 border-slate-200 rounded-2xl p-4 mb-4 flex items-center justify-center">
                      {/* Em produção, seria um QR Code real */}
                      <div className="text-center">
                        <QrCode className="w-24 h-24 text-slate-300 mx-auto mb-2" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">QR Code Demo</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Não consegue escanear? Use o código manual:
                    </p>
                    <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                      <code className="text-sm font-mono font-bold text-slate-700">{mockQRSecret}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(mockQRSecret);
                          alert('Código copiado!');
                        }}
                        className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {/* Verificação */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Digite o código do app</h4>
                    <p className="text-sm text-slate-500 mb-6">
                      Após escanear o QR Code, digite o código de 6 dígitos exibido no seu app autenticador.
                    </p>

                    <div className="flex gap-2 mb-4">
                      {verificationCode.map((digit, index) => (
                        <input
                          key={index}
                          id={`code-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeInput(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className={cn(
                            "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all",
                            "focus:border-brand-blue focus:ring-4 focus:ring-blue-500/10 focus:outline-none",
                            error ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
                          )}
                        />
                      ))}
                    </div>

                    {error && (
                      <p className="text-sm text-red-500 mb-4 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        {error}
                      </p>
                    )}

                    <p className="text-xs text-slate-400 mb-6">
                      💡 Para teste, use o código: <strong>123456</strong>
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setTwoFactorStatus('disabled')}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={verifyCode}
                        disabled={verificationCode.some(d => !d) || isLoading}
                        className={cn(
                          "flex-1 px-6 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                          verificationCode.every(d => d) && !isLoading
                            ? "bg-brand-blue hover:bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Verificar e Ativar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Estado: Ativado */}
            {twoFactorStatus === 'enabled' && (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-800 mb-1">2FA Ativado com Sucesso!</h4>
                    <p className="text-sm text-emerald-700">
                      Sua conta agora está protegida com autenticação em dois fatores.
                    </p>
                  </div>
                </div>

                {/* Códigos de Backup */}
                {showBackupCodes && (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <Key className="w-5 h-5 text-brand-blue" />
                        Códigos de Backup
                      </h4>
                      <button
                        onClick={copyBackupCodes}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar todos
                          </>
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                      {mockBackupCodes.map((code, i) => (
                        <div key={i} className="px-3 py-2 bg-white rounded-lg text-center">
                          <code className="text-sm font-mono font-bold text-slate-700">{code}</code>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      ⚠️ Guarde estes códigos em local seguro. Cada código só pode ser usado uma vez.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    {showBackupCodes ? 'Ocultar' : 'Ver'} Códigos de Backup
                  </button>
                  <button
                    onClick={disableTwoFactor}
                    className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Desativar 2FA
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ==================== ALTERAR SENHA ==================== */}
        <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Lock className="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Alterar Senha</h2>
                <p className="text-slate-500 text-sm">
                  Recomendamos usar uma senha forte com pelo menos 12 caracteres.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="p-8 space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium"
                    placeholder="Mínimo 12 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-medium"
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all"
            >
              Atualizar Senha
            </button>
          </form>
        </section>

        {/* ==================== SESSÕES ATIVAS ==================== */}
        <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Fingerprint className="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Sessões Ativas</h2>
                <p className="text-slate-500 text-sm">
                  Dispositivos onde sua conta está conectada.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <div key={session.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    session.current ? "bg-emerald-100" : "bg-slate-100"
                  )}>
                    <Smartphone className={cn(
                      "w-6 h-6",
                      session.current ? "text-emerald-600" : "text-slate-500"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{session.device}</span>
                      {session.current && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase rounded-full">
                          Sessão Atual
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {session.location} • IP: {session.ip}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {session.lastActive}
                  </span>
                  {!session.current && (
                    <button
                      onClick={() => terminateSession(session.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors"
                    >
                      Encerrar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <button className="text-sm text-red-600 hover:text-red-700 font-bold">
              Encerrar todas as outras sessões
            </button>
          </div>
        </section>

        {/* ==================== AVISO DE PENDÊNCIA ==================== */}
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-amber-800 mb-2">⚠️ Item Pendente: Integração com Backend</h4>
              <p className="text-sm text-amber-700 mb-3">
                Esta interface de 2FA está <strong>pronta visualmente</strong>, mas a lógica real de verificação 
                precisa ser implementada no backend (Supabase) para funcionar em produção.
              </p>
              <div className="text-xs text-amber-600 space-y-1">
                <p>📋 <strong>Checklist para produção:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Gerar QR Code real com biblioteca TOTP</li>
                  <li>Validar código no servidor (não no frontend)</li>
                  <li>Armazenar secret criptografado no banco</li>
                  <li>Gerar e armazenar códigos de backup</li>
                  <li>Adicionar 2FA no fluxo de login</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminSecurityPage;
