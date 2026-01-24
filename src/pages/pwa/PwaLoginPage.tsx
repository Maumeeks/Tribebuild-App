import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// ✅ Adicionei o Check aqui na importação
import { Mail, Lock, Eye, EyeOff, Loader2, Globe, ArrowRight, Download, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function PwaLoginPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [appData, setAppData] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }

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

  if (loadingApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 ">
        <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl p-10 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-800">
            <Globe className="w-10 h-10 text-slate-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3 tracking-tight">App não encontrado</h1>
          <p className="text-slate-400 mb-8 font-medium leading-relaxed text-sm">Verifique o endereço digitado.</p>
        </div>
      </div>
    );
  }

  // 🎨 VISUAL DARK PREMIUM (Agora com Card Escuro de verdade)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950 font-['inter']">

      {/* Background Glow Dinâmico */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: appData.primary_color }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
          style={{ backgroundColor: appData.primary_color }}
        />
      </div>

      {/* Botão Instalar */}
      <div className="mb-8 animate-fade-in relative z-10">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all"
        >
          <Download size={14} />
          Instalar Aplicativo
        </button>
      </div>

      {/* CARD PRINCIPAL ESCURO */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-black/50 max-w-md w-full p-8 md:p-10 animate-slide-up relative z-10">

        {/* Logo e Nome */}
        <div className="text-center mb-10">
          {appData.logo_url ? (
            <img
              src={appData.logo_url}
              alt={appData.name}
              className="w-24 h-24 rounded-3xl mx-auto mb-6 object-cover shadow-2xl border-4 border-slate-800 bg-slate-800"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-[1.5rem] mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-slate-800"
              style={{ backgroundColor: appData.primary_color }}
            >
              {appData.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-black text-white tracking-tight">{appData.name}</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-3">Área de Membros</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_red]" /> {error}
            </div>
          )}

          {/* Input Email */}
          <div className="relative group">
            <Mail
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{ color: emailFocused ? appData.primary_color : '#64748B' }}
            />
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

          {/* Input Senha */}
          <div className="relative group">
            <Lock
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{ color: passwordFocused ? appData.primary_color : '#64748B' }}
            />
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

          {/* ✅ BOTÃO ENTRAR: Altura Aumentada (h-14) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 h-14 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-6 relative overflow-hidden group"
            style={{
              backgroundColor: appData.primary_color,
              boxShadow: `0 0 20px -5px ${appData.primary_color}40`
            }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center gap-3">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Entrar na Área <ArrowRight className="w-4 h-4" /></>}
            </div>
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs font-bold uppercase tracking-widest mt-10 border-t border-slate-800 pt-8">
          Ainda não é aluno? <Link to={`/${appSlug}/register`} className="font-black hover:text-white transition-colors ml-1" style={{ color: appData.primary_color }}>Cadastre-se</Link>
        </p>
      </div>

      <div className="mt-12 text-center animate-fade-in opacity-50 hover:opacity-100 transition-opacity">
        <a href="https://tribebuild.pro" target="_blank" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-slate-400 transition-colors">Powered by TribeBuild</a>
      </div>
    </div>
  );
}