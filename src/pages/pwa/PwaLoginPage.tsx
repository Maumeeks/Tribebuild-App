import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mail,
  Loader2,
  ArrowRight,
  Download,
  AlertCircle,
  X,
  Share,
  PlusSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// --- COMPONENTE DO MODAL (ESTILO LARGO & LIMPO) ---

const translations: Record<string, any> = {
  PT: {
    title: 'Como instalar o app no seu iPhone',
    step1: <>Toque no ícone de <strong>compartilhar</strong> <Share className="inline w-4 h-4 mx-1 align-text-bottom" /> (o quadrado com uma setinha para cima, na parte inferior da tela).</>,
    step2: <>Role para baixo e selecione a opção <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="inline w-4 h-4 mx-1 align-text-bottom" />.</>,
    step3: 'Toque em "Adicionar" no canto superior direito.'
  },
  ES: {
    title: 'Cómo instalar la app en tu iPhone',
    step1: <>Toca el ícono de <strong>compartir</strong> <Share className="inline w-4 h-4 mx-1 align-text-bottom" /> (el cuadrado con una flechita hacia arriba, en la parte inferior de la pantalla).</>,
    step2: <>Desliza hacia abajo y selecciona la opción <strong>"Agregar a Inicio"</strong> <PlusSquare className="inline w-4 h-4 mx-1 align-text-bottom" />.</>,
    step3: 'Presiona "Agregar" en la esquina superior derecha.'
  },
  EN: {
    title: 'How to install the app on your iPhone',
    step1: <>Tap the <strong>share</strong> icon <Share className="inline w-4 h-4 mx-1 align-text-bottom" /> (the square with an arrow pointing up, at the bottom of the screen).</>,
    step2: <>Scroll down and select the <strong>"Add to Home Screen"</strong> option <PlusSquare className="inline w-4 h-4 mx-1 align-text-bottom" />.</>,
    step3: 'Tap "Add" in the top right corner.'
  }
};

interface InstallTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  primaryColor: string;
}

const InstallTutorialModal: React.FC<InstallTutorialModalProps> = ({ isOpen, onClose, language = 'PT', primaryColor }) => {
  if (!isOpen) return null;

  // Garante que pega a tradução certa ou cai para PT
  const t = translations[language?.toUpperCase()] || translations['PT'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
      {/* Backdrop (Fundo Escuro com Blur) */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Card do Modal (Estilo Husky: Branco, Arredondado, Largo) */}
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden transform transition-all animate-slide-up">

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 pt-10">
          {/* Título (Alinhado à esquerda, grande e preto) */}
          <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight pr-8">
            {t.title}
          </h2>

          {/* Lista de Passos */}
          <div className="space-y-6 mb-8">
            {[t.step1, t.step2, t.step3].map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                {/* Número do Passo (Bolinha colorida) */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5 shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  {idx + 1}
                </div>
                {/* Texto do Passo */}
                <p className="text-base text-gray-600 leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* Imagem/GIF (Fundo cinza claro, cantos arredondados) */}
          <div className="bg-gray-100 rounded-2xl p-4 flex justify-center items-center overflow-hidden border border-gray-200">
            <div className="relative w-[180px] sm:w-[200px] aspect-[9/19] rounded-xl overflow-hidden shadow-lg bg-white">
              {/* O GIF deve estar na pasta public com o nome 'install-tutorial.gif' */}
              <img
                src="/install-tutorial.gif"
                alt="Tutorial Animation"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PÁGINA DE LOGIN (LÓGICA ORIGINAL MANTIDA) ---

type StudentSession = {
  email: string;
  app_id: string;
  name?: string;
};

const isIOS = () => {
  // Verificação básica de iOS
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export default function PwaLoginPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(true);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showInstallModal, setShowInstallModal] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  // 1. Busca App
  useEffect(() => {
    const fetchApp = async () => {
      try {
        console.log('🔍 [DEBUG] Buscando app com slug:', appSlug);

        const { data, error } = await supabase
          .from('apps')
          .select('*, language') // Busca a língua para passar ao modal
          .eq('slug', appSlug)
          .single();

        if (error) {
          console.error('❌ [DEBUG] Erro ao buscar app:', error);
          throw error;
        }

        console.log('✅ [DEBUG] App encontrado:', data.name);
        setAppData(data);
      } catch (err) {
        console.error('💥 [DEBUG] App não encontrado:', err);
      } finally {
        setLoadingApp(false);
      }
    };
    if (appSlug) fetchApp();
  }, [appSlug]);

  const handleInstallClick = () => {
    // Abre o modal se for iOS ou Desktop (para testar)
    if (isIOS() || true) {
      setShowInstallModal(true);
    } else {
      alert("Para instalar no Android, toque no menu do navegador e escolha 'Instalar aplicativo'.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) return setError('Digite seu e-mail de compra.');

    setIsLoading(true);

    try {
      // 1. Tenta buscar direto pelo app_id
      const { data: student, error: studentError } = await supabase
        .from('clients')
        .select('*')
        .eq('app_id', appData.id)
        .eq('email', email.trim().toLowerCase())
        .single();

      if (studentError || !student) {
        // 2. Tenta buscar via JOIN se falhar (Fallback)
        const { data: studentAlt, error: errorAlt } = await supabase
          .from('clients')
          .select(`*, apps!inner ( id, slug )`)
          .eq('email', email.trim().toLowerCase())
          .eq('apps.slug', appSlug)
          .single();

        if (errorAlt || !studentAlt) {
          throw new Error('Acesso não encontrado. Verifique se é o mesmo e-mail da compra.');
        }
        doLogin(studentAlt);
        return;
      }

      doLogin(student);

    } catch (err: any) {
      console.error('💥 [DEBUG] Erro no login:', err);
      setError(err.message || 'E-mail não encontrado.');
    } finally {
      setIsLoading(false);
    }
  };

  const doLogin = (student: any) => {
    const session: StudentSession = {
      email: student.email,
      app_id: student.app_id,
      name: student.full_name
    };
    localStorage.setItem(`@tribebuild:student:${appSlug}`, JSON.stringify(session));
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

      {/* ✅ USO DO MODAL (ESTILO HUSKY APP) */}
      <InstallTutorialModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        language={appData.language || 'PT'}
        primaryColor={appData.primary_color}
      />

    </div>
  );
}