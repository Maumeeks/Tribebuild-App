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
  Clock,
  ArrowLeft,
  Info,
  QrCode,
  Fingerprint
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

type TwoFactorStatus = 'disabled' | 'setup' | 'verify' | 'enabled';

const AdminSecurityPage: React.FC = () => {
  const navigate = useNavigate();

  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus>('disabled');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

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

  const sessions = [
    { id: 1, device: 'Chrome no Windows', location: 'São Paulo, BR', ip: '189.xxx.xxx.xxx', current: true, lastActive: 'Agora' },
    { id: 2, device: 'Safari no iPhone', location: 'São Paulo, BR', ip: '189.xxx.xxx.xxx', current: false, lastActive: '2 horas atrás' },
    { id: 3, device: 'Firefox no MacOS', location: 'Rio de Janeiro, BR', ip: '201.xxx.xxx.xxx', current: false, lastActive: '3 dias atrás' },
  ];

  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const startTwoFactorSetup = () => {
    setTwoFactorStatus('setup');
    setError(null);
  };

  const verifyCode = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const code = verificationCode.join('');
      if (code === '123456') {
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

  const disableTwoFactor = () => {
    if (window.confirm('Tem certeza que deseja desativar a autenticação em dois fatores?')) {
      setTwoFactorStatus('disabled');
      setVerificationCode(['', '', '', '', '', '']);
      setShowBackupCodes(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(mockBackupCodes.join('\n'));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    alert('Senha alterada com sucesso! (Simulação)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const terminateSession = (sessionId: number) => {
    if (window.confirm('Deseja encerrar esta sessão?')) {
      alert('Sessão encerrada! (Simulação)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Inter']">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigate('/admin/settings')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Segurança</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie suas credenciais e proteção de conta.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">Protegido</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Coluna Esquerda (Principal) */}
        <div className="lg:col-span-2 space-y-8">

          {/* 2FA Section */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  twoFactorStatus === 'enabled' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Autenticação em Dois Fatores (2FA)</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Adicione uma camada extra de segurança.</p>
                </div>
              </div>
              {twoFactorStatus === 'enabled' ? (
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-200">Ativado</span>
              ) : (
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200">Desativado</span>
              )}
            </div>

            <div className="p-6">
              {/* Estado: Desativado */}
              {twoFactorStatus === 'disabled' && (
                <div className="space-y-6">
                  <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Recomendamos fortemente ativar o 2FA para proteger o acesso administrativo.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {[{ icon: Smartphone, title: "App Autenticador" }, { icon: Key, title: "Códigos Backup" }, { icon: Lock, title: "Proteção Total" }].map((item, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                        <item.icon className="w-6 h-6 text-brand-blue mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.title}</p>
                      </div>
                    ))}
                  </div>

                  <button onClick={startTwoFactorSetup} className="w-full py-3 bg-slate-900 dark:bg-white hover:bg-slate-800 text-white dark:text-slate-900 rounded-lg text-sm font-bold uppercase tracking-wide transition-all shadow-lg">
                    Ativar Agora
                  </button>
                </div>
              )}

              {/* Estado: Configurando */}
              {twoFactorStatus === 'setup' && (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
                    <Info className="w-5 h-5 flex-shrink-0" />
                    Escaneie o QR Code com seu app autenticador.
                  </div>

                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <QrCode className="w-32 h-32 text-slate-800 dark:text-slate-200 mb-4" />
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700">
                        <code className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{mockQRSecret}</code>
                        <button onClick={() => navigator.clipboard.writeText(mockQRSecret)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Copy className="w-3 h-3 text-slate-400" /></button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Código de Verificação</label>
                      <div className="flex gap-2">
                        {verificationCode.map((digit, index) => (
                          <input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeInput(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={cn(
                              "w-10 h-12 text-center text-xl font-bold bg-white dark:bg-slate-900 border rounded-lg outline-none transition-all",
                              error ? "border-red-300 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-brand-blue"
                            )}
                          />
                        ))}
                      </div>
                      {error && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> {error}</p>}
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setTwoFactorStatus('disabled')} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                        <button onClick={verifyCode} disabled={isLoading || verificationCode.some(d => !d)} className="flex-1 py-2.5 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                          {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Verificar'}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">Código de teste: 123456</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estado: Ativado */}
              {twoFactorStatus === 'enabled' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="text-sm font-bold">Proteção ativa.</p>
                  </div>

                  {showBackupCodes && (
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Key className="w-4 h-4" /> Códigos de Backup</h4>
                        <button onClick={copyBackupCodes} className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
                          {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copiar
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {mockBackupCodes.map((code, i) => (
                          <div key={i} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center">
                            <code className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{code}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setShowBackupCodes(!showBackupCodes)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      {showBackupCodes ? 'Ocultar Códigos' : 'Ver Códigos'}
                    </button>
                    <button onClick={disableTwoFactor} className="px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors ml-auto">
                      Desativar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Sessões Ativas */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-slate-400" /> Dispositivos Conectados
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", session.current ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{session.device}</span>
                        {session.current && <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase">Atual</span>}
                      </div>
                      <p className="text-xs text-slate-500">{session.location} • {session.ip}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {session.lastActive}</span>
                    {!session.current && (
                      <button onClick={() => terminateSession(session.id)} className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-2 py-1 rounded transition-colors">Encerrar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
              <button className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wide">Encerrar todas as sessões</button>
            </div>
          </section>
        </div>

        {/* Coluna Direita (Senha) */}
        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm sticky top-24">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-slate-400" /> Alterar Senha
              </h2>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Senha Atual</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                    placeholder="Mínimo 12 caracteres"
                  />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Confirmar</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-slate-900 dark:bg-white hover:bg-slate-800 text-white dark:text-slate-900 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-md mt-2">
                Atualizar Senha
              </button>
            </form>
          </section>
        </div>

      </div>
    </div>
  );
};

export default AdminSecurityPage;