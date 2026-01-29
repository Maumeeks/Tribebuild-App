import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowRight, Download, CheckCircle2, AlertCircle, X, Share, PlusSquare, PlayCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Definindo tipo simples para o aluno
type StudentSession = {
  email: string;
  app_id: string;
  name?: string;
};

export default function PwaLoginPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(true);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal de Instalação
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const [emailFocused, setEmailFocused] = useState(false);

  // 1. Busca App COM DEBUG COMPLETO
  useEffect(() => {
    const fetchApp = async () => {
      try {
        console.log('🔍 [DEBUG] Buscando app com slug:', appSlug);

        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .eq('slug', appSlug)
          .single();

        if (error) {
          console.error('❌ [DEBUG] Erro ao buscar app:', error);
          throw error;
        }

        // ✅ DEBUG COMPLETO DO APP
        console.log('✅ [DEBUG] App encontrado!');
        console.log('📦 [DEBUG] App completo:', data);
        console.log('🔑 [DEBUG] App ID:', data.id);
        console.log('📏 [DEBUG] App ID length:', data.id.length);
        console.log('🔤 [DEBUG] App ID typeof:', typeof data.id);
        console.log('🎨 [DEBUG] Primary color:', data.primary_color);

        setAppData(data);
      } catch (err) {
        console.error('💥 [DEBUG] App não encontrado:', err);
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

  const handleInstallClick = () => setShowInstallModal(true);

  const triggerNativeInstall = () => {
    if (installPrompt) {
      installPrompt.prompt();
      setShowInstallModal(false);
    }
  };

  // --- LÓGICA DE LOGIN COM DEBUG E QUERY ALTERNATIVA ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) return setError('Digite seu e-mail de compra.');

    console.log('🚀 [DEBUG] Iniciando login...');
    console.log('📧 [DEBUG] Email:', email.trim().toLowerCase());
    console.log('🏢 [DEBUG] App data:', appData);
    console.log('🔑 [DEBUG] App ID que será usado:', appData.id);

    setIsLoading(true);

    try {
      // ESTRATÉGIA 1: Query direta com app_id
      console.log('🔄 [DEBUG] Tentando query com app_id...');

      const { data: student, error: studentError } = await supabase
        .from('clients')
        .select('*')
        .eq('app_id', appData.id)
        .eq('email', email.trim().toLowerCase())
        .single();

      console.log('📊 [DEBUG] Resultado da query:', { student, studentError });

      if (studentError || !student) {
        console.log('⚠️ [DEBUG] Cliente não encontrado com app_id');
        console.log('🔄 [DEBUG] Tentando query alternativa com JOIN...');

        // ESTRATÉGIA 2: Query com JOIN pelo slug (mais confiável)
        const { data: studentAlt, error: errorAlt } = await supabase
          .from('clients')
          .select(`
            *,
            apps!inner (
              id,
              slug,
              name
            )
          `)
          .eq('email', email.trim().toLowerCase())
          .eq('apps.slug', appSlug)
          .single();

        console.log('📊 [DEBUG] Resultado da query alternativa:', { studentAlt, errorAlt });

        if (errorAlt || !studentAlt) {
          console.error('❌ [DEBUG] Cliente não encontrado em nenhuma estratégia');
          throw new Error('Acesso não encontrado. Verifique se é o mesmo e-mail da compra.');
        }

        console.log('✅ [DEBUG] Cliente encontrado via JOIN!');
        doLogin(studentAlt);
        return;
      }

      console.log('✅ [DEBUG] Cliente encontrado via app_id!');
      doLogin(student);

    } catch (err: any) {
      console.error('💥 [DEBUG] Erro no login:', err);
      setError(err.message || 'E-mail não encontrado na base de alunos deste app.');
    } finally {
      setIsLoading(false);
    }
  };

  const doLogin = (student: any) => {
    console.log('🎉 [DEBUG] Login bem-sucedido!');
    console.log('👤 [DEBUG] Dados do aluno:', student);

    // Salva sessão no LocalStorage
    const session: StudentSession = {
      email: student.email,
      app_id: student.app_id,
      name: student.full_name
    };

    console.log('💾 [DEBUG] Salvando sessão:', session);
    localStorage.setItem(`@tribebuild:student:${appSlug}`, JSON.stringify(session));

    console.log('🚀 [DEBUG] Redirecionando para home...');

    // Redireciona
    navigate(`/${appSlug}/home`);
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        App não encontrado
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950 font-['inter']">

      {/* Background Glow */}
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

      <div className="mb-8 animate-fade-in relative z-10">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 transition-all"
        >
          <Download size={14} /> Instalar App
        </button>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-black/50 max-w-md w-full p-8 md:p-10 animate-slide-up relative z-10">

        <div className="text-center mb-10">
          {appData.logo ? (
            <img
              src={appData.logo}
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
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-3">
            Acesso Exclusivo
          </p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="relative group">
            <Mail
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{ color: emailFocused ? appData.primary_color : '#64748B' }}
            />
            <input
              type="email"
              placeholder="Seu e-mail de compra"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="w-full pl-14 pr-5 py-4 bg-slate-950/50 text-white border border-slate-800 rounded-2xl focus:outline-none transition-all font-medium text-sm placeholder:text-slate-600 focus:border-opacity-50"
              style={{ borderColor: emailFocused ? appData.primary_color : '#1e293b' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 h-14 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-6 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: appData.primary_color,
              boxShadow: `0 0 20px -5px ${appData.primary_color}40`
            }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center gap-3">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar Agora <ArrowRight className="w-4 h-4" />
                </>
              )}
            </div>
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-8 px-4 leading-relaxed">
          O acesso é liberado automaticamente para o e-mail utilizado na compra.
        </p>
      </div>

      <div className="mt-12 text-center opacity-50">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
          Powered by TribeBuild
        </span>
      </div>

      {/* MODAL DE INSTALAÇÃO */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowInstallModal(false)}
          />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-6 pb-0 flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold text-lg">Instalar Aplicativo</h3>
                <p className="text-slate-400 text-xs mt-1">Tenha acesso rápido direto da tela inicial.</p>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="m-6 aspect-video bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-transparent opacity-50" />
              <PlayCircle className="w-12 h-12 text-white/50 group-hover:text-white transition-colors z-10" />
              <p className="absolute bottom-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest z-10">
                Ver Tutorial
              </p>
            </div>
            <div className="px-6 pb-6 space-y-4">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <Share className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-sm text-slate-300">
                  1. Toque em <strong>Compartilhar</strong> (iOS) ou <strong>Menu</strong> (Android).
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <PlusSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-sm text-slate-300">
                  2. Selecione <strong>Adicionar à Tela de Início</strong>.
                </p>
              </div>
            </div>
            {installPrompt && (
              <div className="p-6 pt-0">
                <button
                  onClick={triggerNativeInstall}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                  Instalar Agora
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}