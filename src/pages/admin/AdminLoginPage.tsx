
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, ArrowRight, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';
import TribeBuildLogo from '../../components/TribeBuildLogo';
import { ADMIN_CONFIG } from '../../config/env';

// Tipos para o fluxo de autenticação
type AuthStep = 'credentials' | '2fa' | 'success';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  
  // Estado do fluxo
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
  
  // Estados gerais
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Timer para cooldown de reenvio
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focar no primeiro input OTP quando entrar na etapa 2FA
  useEffect(() => {
    if (step === '2fa' && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [step]);

  // Handler para inputs OTP
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Se colar código completo
      const pastedCode = value.slice(0, 6).split('');
      const newOtp = [...otpCode];
      pastedCode.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpCode(newOtp);
      if (pastedCode.length === 6) {
        otpInputRefs.current[5]?.focus();
      }
      return;
    }

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-avançar para próximo input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handler para backspace no OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Submeter credenciais (Etapa 1)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Credenciais obrigatórias');
      return;
    }

    setIsLoading(true);

    // TODO: [BACKEND] Substituir por chamada real ao Supabase
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setTimeout(() => {
      // Validação usando variáveis de ambiente (não mais hardcoded!)
      if (email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password) {
        // Credenciais válidas → ir para 2FA
        setStep('2fa');
        setResendCooldown(60); // 60 segundos para reenviar
        
        // TODO: [BACKEND] Enviar código OTP por email/SMS
        // await supabase.functions.invoke('send-otp', { body: { email, method: otpMethod } })
      } else {
        setError('Acesso negado: Credenciais inválidas.');
      }
      setIsLoading(false);
    }, 1200);
  };

  // Submeter código 2FA (Etapa 2)
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('Digite o código completo de 6 dígitos');
      return;
    }

    setIsLoading(true);

    // TODO: [BACKEND] Verificar código OTP
    // const { data, error } = await supabase.functions.invoke('verify-otp', { body: { email, code } })
    setTimeout(() => {
      // Validação usando variável de ambiente
      if (code === ADMIN_CONFIG.twoFactorCode) {
        setStep('success');
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        setError('Código inválido. Tente novamente.');
        setOtpCode(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
      setIsLoading(false);
    }, 1000);
  };

  // Reenviar código OTP
  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    
    setResendCooldown(60);
    setError('');
    
    // TODO: [BACKEND] Reenviar código OTP
    // await supabase.functions.invoke('send-otp', { body: { email, method: otpMethod } })
    
    // Feedback visual
    alert(`Código reenviado para ${otpMethod === 'email' ? email : 'seu app autenticador'}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden ">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-coral/20 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-8">
            <TribeBuildLogo size="xl" showText={false} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Tribe<span className="text-brand-blue italic">Build</span></h1>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Painel Administrativo Mestre</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 'credentials' ? 'bg-brand-blue scale-125' : 'bg-brand-blue'}`} />
          <div className={`w-8 h-0.5 transition-all duration-300 ${step !== 'credentials' ? 'bg-brand-blue' : 'bg-slate-700'}`} />
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === '2fa' ? 'bg-brand-blue scale-125' : step === 'success' ? 'bg-brand-blue' : 'bg-slate-700'}`} />
          <div className={`w-8 h-0.5 transition-all duration-300 ${step === 'success' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 'success' ? 'bg-emerald-500 scale-125' : 'bg-slate-700'}`} />
        </div>

        {/* ==================== ETAPA 1: CREDENCIAIS ==================== */}
        {step === 'credentials' && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-white/10 overflow-hidden relative animate-fade-in">
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-tight flex items-center gap-3 animate-fade-in">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail Administrativo</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                  <input
                    type="email"
                    placeholder="admin@tribebuild.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Chave de Acesso</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-4 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all active:scale-95 disabled:opacity-70 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continuar
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 p-5 bg-slate-50 rounded-2xl text-center border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                Este acesso é monitorado e exclusivo para proprietários TribeBuild. Atividades suspeitas resultarão em bloqueio de IP.
              </p>
            </div>
          </div>
        )}

        {/* ==================== ETAPA 2: VERIFICAÇÃO 2FA ==================== */}
        {step === '2fa' && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-white/10 overflow-hidden relative animate-fade-in">
            {/* Header 2FA */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
                <Smartphone className="w-8 h-8 text-brand-blue" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Verificação em Duas Etapas</h2>
              <p className="text-sm text-slate-500">
                Digite o código de 6 dígitos do seu app autenticador
              </p>
            </div>

            {/* Método de verificação */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setOtpMethod('app')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  otpMethod === 'app' 
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                App Autenticador
              </button>
              <button
                type="button"
                onClick={() => setOtpMethod('email')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  otpMethod === 'email' 
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Código por Email
              </button>
            </div>

            <form onSubmit={handle2FASubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-tight flex items-center gap-3 animate-fade-in">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              {/* OTP Inputs */}
              <div className="flex justify-center gap-3">
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
                    className="w-12 h-14 text-center text-2xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 focus:outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.join('').length !== 6}
                className="w-full h-16 flex items-center justify-center gap-3 bg-brand-blue hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-blue/20 transition-all active:scale-95 disabled:opacity-70 disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verificar Código
                    <Shield size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Reenviar código */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform duration-500'}`} />
                {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar código'}
              </button>
            </div>

            {/* Voltar */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setOtpCode(['', '', '', '', '', '']);
                  setError('');
                }}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Voltar para login
              </button>
            </div>

            {/* Demo hint */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-[10px] font-bold text-amber-700 text-center">
                🔐 Demo: Use o código <span className="font-black">{ADMIN_CONFIG.twoFactorCode}</span> para testar
              </p>
            </div>
          </div>
        )}

        {/* ==================== ETAPA 3: SUCESSO ==================== */}
        {step === 'success' && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-white/10 overflow-hidden relative animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Acesso Autorizado!</h2>
              <p className="text-slate-500 mb-6">Redirecionando para o painel...</p>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-10">
          Core Engine v1.0.0 • 2FA Security Layer
        </p>
      </div>
    </div>
  );
}
