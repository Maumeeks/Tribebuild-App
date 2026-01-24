import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Globe, ArrowRight, Download, Smartphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function PwaLoginPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();
  const { signIn } = useAuth(); // Usando Auth Real

  const [appData, setAppData] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Estados de foco
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // 1. Busca Dados Reais do App
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

  // 2. Captura Evento de Instalação PWA
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
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      });
    } else {
      alert('Para instalar: Toque em Compartilhar (iOS) ou Menu (Android) e escolha "Adicionar à Tela de Início".');
    }
  };

  const getHoverColor = (hex: string) => {
    if (!hex) return '#000';
    // Lógica simples de escurecer
    return hex;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Lógica Híbrida: Se for "Login Facilitado" (Magic Link), enviamos o link.
    // Se for "Login Completo", fazemos login com senha.
    // Para este MVP, vamos manter o login com senha padrão para garantir acesso.

    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate(`/${appSlug}/home`); // Redireciona para Home do App
    } catch (err: any) {
      setError('E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingApp) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 ">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-10 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">App não encontrado</h1>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">Verifique o endereço digitado.</p>
        </div>
      </div>
    );
  }

  // Define se usa login facilitado (somente email) ou completo
  // Nota: Para este MVP, vamos forçar senha se não tivermos Magic Link configurado no backend ainda.
  // Mas visualmente, podemos esconder se quiser. Vamos manter senha por segurança por enquanto.
  const isMagicLink = appData.login_type === 'magic_link';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: `${appData.primary_color}08` }}
    >
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-[100px] opacity-20" style={{ backgroundColor: appData.primary_color }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-10" style={{ backgroundColor: appData.primary_color }} />
      </div>

      {/* ✅ BOTÃO INSTALAR APP (Destaque) */}
      <div className="mb-8 animate-fade-in">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-transform"
        >
          <Download size={14} />
          Instalar App
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-900/5 max-w-md w-full p-8 md:p-10 animate-slide-up">
        {/* Logo e Nome */}
        <div className="text-center mb-10">
          {appData.logo_url ? (
            <img src={appData.logo_url} alt={appData.name} className="w-24 h-24 rounded-3xl mx-auto mb-6 object-cover shadow-xl" />
          ) : (
            <div className="w-20 h-20 rounded-[1.5rem] mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black shadow-lg" style={{ backgroundColor: appData.primary_color }}>
              {appData.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{appData.name}</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Acesse sua conta</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {error}
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: emailFocused ? appData.primary_color : '#CBD5E1' }} />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="w-full pl-14 pr-5 py-4 bg-slate-50 text-slate-800 border rounded-2xl focus:outline-none transition-all font-bold text-sm"
              style={{ borderColor: emailFocused ? appData.primary_color : '#F1F5F9' }}
            />
          </div>

          {/* Campo de Senha (Sempre visível por enquanto para garantir login) */}
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: passwordFocused ? appData.primary_color : '#CBD5E1' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full pl-14 pr-14 py-4 bg-slate-50 text-slate-800 border rounded-2xl focus:outline-none transition-all font-bold text-sm"
              style={{ borderColor: passwordFocused ? appData.primary_color : '#F1F5F9' }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lembrar</span>
            </label>
            <Link to={`/${appSlug}/forgot-password`} className="text-xs font-black uppercase tracking-widest hover:opacity-80" style={{ color: appData.primary_color }}>Esqueci a senha</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4.5 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-4"
            style={{ backgroundColor: appData.primary_color, boxShadow: `0 10px 25px -5px ${appData.primary_color}30` }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Entrar <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-10 border-t border-slate-50 pt-8">
          Ainda não é aluno? <Link to={`/${appSlug}/register`} className="font-black hover:underline" style={{ color: appData.primary_color }}>Cadastre-se</Link>
        </p>
      </div>

      <div className="mt-10 text-center animate-fade-in">
        <a href="https://tribebuild.pro" target="_blank" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] hover:text-slate-500 transition-colors">Powered by <span className="text-slate-400">TribeBuild</span></a>
      </div>
    </div>
  );
}