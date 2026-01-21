import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, Smartphone, RefreshCw, CheckCircle2, Shield } from 'lucide-react';
import TribeBuildLogo from '../../components/TribeBuildLogo';
import { ADMIN_CONFIG } from '../../config/env';
import { cn } from '../../lib/utils';

// Tipos
type AuthStep = 'credentials' | '2fa' | 'success';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('credentials');

  // Credenciais
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2FA
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpMethod, setOtpMethod] = useState<'app' | 'email'>('app');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Estado
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Timer cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus no 2FA
  useEffect(() => {
    if (step === '2fa' && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [step]);

  // Handlers OTP
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      const newOtp = [...otpCode];
      pastedCode.forEach((char, i) => { if (i < 6) newOtp[i] = char; });
      setOtpCode(newOtp);
      if (pastedCode.length === 6) otpInputRefs.current[5]?.focus();
      return;
    }
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Submit Credenciais
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Credenciais obrigatórias');

    setIsLoading(true);
    setTimeout(() => {
      if (email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password) {
        setStep('2fa');
        setResendCooldown(60);
      } else {
        setError('Acesso negado. Credenciais inválidas.');
      }
      setIsLoading(false);
    }, 1000);
  };

  // Submit 2FA
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = otpCode.join('');
    if (code.length !== 6) return setError('Código incompleto');

    setIsLoading(true);
    setTimeout(() => {
      if (code === ADMIN_CONFIG.twoFactorCode) {
        setStep('success');
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        setError('Código inválido.');
        setOtpCode(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    setError('');
    alert(`Código reenviado para ${otpMethod === 'email' ? email : 'App Autenticador'}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Inter'] selection:bg-brand-blue/30 selection:text-white">

      {/* Background Técnico */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent opacity-50" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl">
            <TribeBuildLogo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Console</h1>
          <p className="text-slate-400 text-sm mt-2 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Ambiente Seguro Monitorado
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <div
              className="h-full bg-brand-blue transition-all duration-500 ease-out"
              style={{ width: step === 'credentials' ? '33%' : step === '2fa' ? '66%' : '100%' }}
            />
          </div>

          {/* === ETAPA 1: CREDENCIAIS === */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5 mt-4 animate-fade-in">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Admin Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                  <input
                    type="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/50 outline-none transition-all"
                    placeholder="admin@tribebuild.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Senha Mestra</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/50 outline-none transition-all"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-lg text-sm font-bold uppercase tracking-wide shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Autenticar <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* === ETAPA 2: 2FA === */}
          {step === '2fa' && (
            <div className="mt-4 animate-fade-in text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Shield className="w-6 h-6 text-brand-blue" />
              </div>

              <h2 className="text-lg font-bold text-white mb-1">Verificação 2FA</h2>
              <p className="text-xs text-slate-400 mb-6">Insira o código de segurança do seu autenticador.</p>

              <form onSubmit={handle2FASubmit} className="space-y-6">
                {error && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs font-medium">
                    {error}
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-12 text-center text-xl font-bold bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/50 outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.join('').length !== 6}
                  className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-lg text-sm font-bold uppercase tracking-wide shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar Acesso'}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs">
                <button
                  onClick={() => { setStep('credentials'); setOtpCode(['', '', '', '', '', '']); setError(''); }}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  className="text-brand-blue hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <RefreshCw className={cn("w-3 h-3", resendCooldown > 0 && "animate-spin")} />
                  {resendCooldown > 0 ? `Aguarde ${resendCooldown}s` : 'Reenviar código'}
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 font-mono">
                  Code: <span className="text-slate-400 select-all">{ADMIN_CONFIG.twoFactorCode}</span>
                </p>
              </div>
            </div>
          )}

          {/* === ETAPA 3: SUCESSO === */}
          {step === 'success' && (
            <div className="py-10 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-4 border border-emerald-500/20 animate-bounce-subtle">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Acesso Autorizado</h2>
              <p className="text-sm text-slate-400 mb-6">Redirecionando para o painel mestre...</p>
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mx-auto" />
            </div>
          )}

        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-[10px] font-mono mt-8 uppercase tracking-widest">
          Secured by TribeCore v3.2 • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}