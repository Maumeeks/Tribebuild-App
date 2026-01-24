import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Globe, ArrowRight, Download, Check, KeyRound, ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function PwaLoginPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [appData, setAppData] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(true);

  // Estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginStep, setLoginStep] = useState<'email' | 'code'>('email');

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // 1. Busca App
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .eq('slug', appSlug)
          .single();

        if (error) throw error;
        setAppData(data);
      } catch (err) {
        console.error('App não encontrado:', err);
      } finally {
        setLoadingApp(false);
      }
    };
    if (appSlug) fetchApp();
  }, [appSlug]);

  // 2. Instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
    } else {
      alert('Para instalar: Toque em Compartilhar (iOS) ou Menu (Android) e escolha "Adicionar à Tela de Início".');
    }
  };

  // --- LÓGICA DE LOGIN ---

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) return setError('Digite seu e-mail.');

    setIsLoading(true);
    try {
      // Envia código numérico
      const { error } = await supabase.auth.signInWithOtp({
        email,
        // 👇 AQUI ESTÁ O AJUSTE PARA TESTE:
        // true = Se o aluno não existe, CRIA ele na hora. (Perfeito para testar agora)
        // false = Só entra quem já comprou (Segurança futura)
        options: { shouldCreateUser: true }
      });

      if (error) throw error;

      // Sucesso: Muda para a tela de digitar código
      setLoginStep('code');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao enviar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email'
      });

      if (error) throw error;

      // Login validado! Entra na home.
      navigate(`/${appSlug}/home`);
    } catch (err: any) {
      console.error(err);
      setError('Código inválido ou expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate(`/${appSlug}/home`);
    } catch (err: any) {
      setError('E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingApp) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>;
  if (!appData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">App não encontrado</div>;

  const isMagicLink = appData.login_type === 'magic_link';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950 font-['inter']">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: appData.primary_color }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10" style={{ backgroundColor: appData.primary_color }} />
      </div>

      <div className="mb-8 animate-fade-in relative z-10">
        <button onClick={handleInstallClick} className="flex items-center gap-2 px-6 py-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all">
          <Download size={14} /> Instalar App
        </button>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-black/50 max-w-md w-full p-8 md:p-10 animate-slide-up relative z-10">

        <div className="text-center mb-10">
          {appData.logo_url ? (
            <img src={appData.logo_url} alt={appData.name} className="w-24 h-24 rounded-3xl mx-auto mb-6 object-cover shadow-2xl border-4 border-slate-800 bg-slate-800" />
          ) : (
            <div className="w-24 h-24 rounded-[1.5rem] mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-slate-800" style={{ backgroundColor: appData.primary_color }}>
              {appData.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-black text-white tracking-tight">{appData.name}</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-3">
            {isMagicLink ? 'Acesso via Código' : 'Área de Membros'}
          </p>
        </div>

        {/* --- FORMULÁRIO DINÂMICO --- */}

        {/* PASSO 2: DIGITAR O CÓDIGO (APENAS MAGIC LINK) */}
        {isMagicLink && loginStep === 'code' ? (
          <form onSubmit={handleVerifyCode} className="space-y-5 animate-fade-in">
            <button type="button" onClick={() => setLoginStep('email')} className="flex items-center gap-1 text-slate-400 text-xs hover:text-white mb-2">
              <ChevronLeft size={14} /> Voltar para o e-mail
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {error}</div>
            )}

            <div className="text-center mb-4">
              <p className="text-white font-medium text-sm">Enviamos um código para:</p>
              <p className="text-slate-400 text-xs mt-1">{email}</p>
            </div>

            <div className="relative group">
              <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Código de 6 dígitos"
                value={otpCode}
                maxLength={6}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Só números
                className="w-full pl-14 pr-5 py-4 bg-slate-950/50 text-white border border-slate-800 rounded-2xl focus:outline-none transition-all font-bold text-lg tracking-widest text-center placeholder:text-slate-700 focus:border-opacity-50"
                style={{ borderColor: appData.primary_color }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full flex items-center justify-center gap-3 px-6 h-14 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: appData.primary_color }}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Código'}
            </button>
          </form>
        ) : (
          // PASSO 1: EMAIL (COMUM PARA AMBOS)
          <form onSubmit={isMagicLink ? handleSendCode : handlePasswordLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {error}</div>
            )}

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: emailFocused ? appData.primary_color : '#64748B' }} />
              <input
                type="email"
                placeholder="Seu e-mail de acesso"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="w-full pl-14 pr-5 py-4 bg-slate-950/50 text-white border border-slate-800 rounded-2xl focus:outline-none transition-all font-medium text-sm placeholder:text-slate-600 focus:border-opacity-50"
                style={{ borderColor: emailFocused ? appData.primary_color : '#1e293b' }}
              />
            </div>

            {/* SÓ MOSTRA SENHA SE NÃO FOR MAGIC LINK */}
            {!isMagicLink && (
              <div className="relative group animate-fade-in">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: passwordFocused ? appData.primary_color : '#64748B' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha secreta"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="w-full pl-14 pr-14 py-4 bg-slate-950/50 text-white border border-slate-800 rounded-2xl focus:outline-none transition-all font-medium text-sm placeholder:text-slate-600 focus:border-opacity-50"
                  style={{ borderColor: passwordFocused ? appData.primary_color : '#1e293b' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            {/* OPÇÕES EXTRAS */}
            {!isMagicLink && (
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-slate-700 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all bg-slate-950"></div>
                    <Check size={12} className="absolute left-1 top-1 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Lembrar</span>
                </label>
                <Link to={`/${appSlug}/forgot-password`} className="text-xs font-black uppercase tracking-widest hover:opacity-80 transition-opacity" style={{ color: appData.primary_color }}>Esqueci a senha</Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 h-14 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-6 relative overflow-hidden group"
              style={{ backgroundColor: appData.primary_color, boxShadow: `0 0 20px -5px ${appData.primary_color}40` }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center gap-3">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isMagicLink ? 'Receber Código de Acesso' : 'Entrar na Área'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </div>
            </button>
          </form>
        )}

        <p className="text-center text-slate-600 text-xs font-bold uppercase tracking-widest mt-10 border-t border-slate-800 pt-8">
          Ainda não é aluno? <Link to={`/${appSlug}/register`} className="font-black hover:text-white transition-colors ml-1" style={{ color: appData.primary_color }}>Cadastre-se</Link>
        </p>
      </div>
      <div className="mt-12 text-center opacity-50"><span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Powered by TribeBuild</span></div>
    </div>
  );
}