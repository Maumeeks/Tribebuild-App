import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  Loader2,
  LogOut,
  Smartphone,
  Pencil,
  Check,
  X,
  Camera,
  Moon,
  Sun,
  Share,
  PlusSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';

// --- COMPONENTE DO MODAL (VERSÃO POPUP COMPACTO - IGUAL AO LOGIN) ---

const translations: Record<string, any> = {
  PT: {
    title: 'Instalar App',
    step1: <>Toque em <strong>compartilhar</strong> <Share className="inline w-3 h-3 mx-1" /></>,
    step2: <>Selecione <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="inline w-3 h-3 mx-1" /></>,
    step3: 'Toque em "Adicionar"'
  },
  ES: {
    title: 'Instalar App',
    step1: <>Toca en <strong>compartir</strong> <Share className="inline w-3 h-3 mx-1" /></>,
    step2: <>Selecciona <strong>"Agregar a Inicio"</strong> <PlusSquare className="inline w-3 h-3 mx-1" /></>,
    step3: 'Presiona "Agregar"'
  },
  EN: {
    title: 'Install App',
    step1: <>Tap <strong>share</strong> <Share className="inline w-3 h-3 mx-1" /></>,
    step2: <>Select <strong>"Add to Home Screen"</strong> <PlusSquare className="inline w-3 h-3 mx-1" /></>,
    step3: 'Tap "Add"'
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

  const t = translations[language?.toUpperCase()] || translations['PT'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card - Largura travada em 320px para ficar compacto */}
      <div className="relative w-full max-w-[320px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-slide-up border border-slate-200 dark:border-slate-800">

        {/* Botão Fechar */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10">
          <X className="w-4 h-4" />
        </button>

        <div className="p-5">
          {/* Título Compacto */}
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 text-center leading-tight">
            {t.title}
          </h2>

          {/* Passos (Fonte menor e menos espaçamento) */}
          <div className="space-y-3 mb-5">
            {[t.step1, t.step2, t.step3].map((step, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug font-medium">
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* GIF - Tamanho controlado */}
          <div className="flex justify-center">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative w-[160px] aspect-[9/19] bg-slate-100 dark:bg-slate-800">
              <img src="/install-tutorial.gif" alt="Tutorial" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PÁGINA DE PERFIL ---

export default function PwaProfilePage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [client, setClient] = useState<any>(null);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ✅ Estado do Modal Unificado
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Estado do Tema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);

        const sessionJson = localStorage.getItem(`@tribebuild:student:${appSlug}`);
        if (!sessionJson) {
          navigate(`/${appSlug}/login`);
          return;
        }
        const session = JSON.parse(sessionJson);

        const { data: app } = await supabase
          .from('apps')
          .select('*, language') // ✅ Adicionado language
          .eq('slug', appSlug)
          .single();

        if (!app) throw new Error('App não encontrado');
        setAppData(app);

        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('app_id', app.id)
          .eq('email', session.email)
          .single();

        if (!clientData) {
          navigate(`/${appSlug}/login`);
          return;
        }
        setClient(clientData);
        setNewName(clientData.full_name || '');

      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug) initPage();
  }, [appSlug, navigate]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      setSavingName(true);
      const { error } = await supabase
        .from('clients')
        .update({ full_name: newName })
        .eq('id', client.id);

      if (error) throw error;

      setClient({ ...client, full_name: newName });
      setIsEditingName(false);
    } catch (err) {
      alert('Erro ao atualizar nome.');
    } finally {
      setSavingName(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    try {
      setUploadingPhoto(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${client.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('clients')
        .update({ avatar_url: publicUrl })
        .eq('id', client.id);

      if (updateError) throw updateError;

      setClient({ ...client, avatar_url: publicUrl });

    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar foto. Tente uma imagem menor.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem(`@tribebuild:student:${appSlug}`);
      navigate(`/${appSlug}/login`);
    }
  };

  if (loading || !appData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const primaryColor = appData.primary_color || '#f59e0b';

  // Detecção simples de iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const menuItems = [
    {
      icon: isDarkMode ? Sun : Moon,
      label: 'Tema do App',
      description: isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro',
      action: toggleTheme
    },
    {
      icon: HelpCircle,
      label: 'Ajuda & Suporte',
      description: 'Fale com nosso time',
      action: () => {
        if (appData.support_type === 'whatsapp' && appData.support_value) {
          const phone = appData.support_value.replace(/\D/g, '');
          window.open(`https://wa.me/${phone}?text=Olá, sou aluno do app ${appData.name} e preciso de ajuda.`, '_blank');
        } else if (appData.support_type === 'email' && appData.support_value) {
          window.location.href = `mailto:${appData.support_value}?subject=Suporte ${appData.name}`;
        } else {
          alert('O produtor ainda não configurou um canal de suporte.');
        }
      }
    },
    {
      icon: Smartphone,
      label: 'Instalar App',
      description: 'Adicionar à tela inicial',
      action: () => {
        // ✅ Agora abrimos o modal NOVO COMPACTO (igual ao login)
        if (isIOS || true) { // True mantido para testes
          setShowInstallModal(true);
        } else {
          alert('No Android: Toque no menu do navegador e escolha "Instalar aplicativo".');
        }
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center font-['Inter'] transition-colors duration-300">
      <div className="w-full max-w-md bg-gray-50 dark:bg-slate-950 min-h-screen relative shadow-2xl border-x border-gray-200 dark:border-slate-800 text-slate-900 dark:text-white pb-24 transition-colors duration-300">

        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 px-5 py-4 flex items-center gap-4 transition-colors duration-300">
          <button
            onClick={() => navigate(`/${appSlug}/home`)}
            className="w-10 h-10 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-slate-900 dark:text-white font-bold text-sm truncate leading-tight">
              Meu Perfil
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium uppercase tracking-wider mt-0.5">
              Configurações da conta
            </p>
          </div>
        </header>

        <main className="p-5 space-y-6">

          {/* CARD PERFIL */}
          <section className="flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
              />

              <div
                className="w-32 h-32 rounded-3xl flex items-center justify-center text-5xl font-bold text-white shadow-xl mb-4 relative overflow-hidden transition-all group-active:scale-95"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 10px 30px -10px ${primaryColor}60`
                }}
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-10 h-10 animate-spin text-white" />
                ) : client.avatar_url ? (
                  <img src={client.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  client?.full_name?.charAt(0) || client?.email?.charAt(0).toUpperCase()
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center z-10 pointer-events-none">
                  <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center items-center gap-2 min-h-[40px]">
              {isEditingName ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-slate-900 dark:text-white text-lg font-bold rounded-lg px-3 py-1 outline-none focus:border-blue-500 w-full max-w-[200px]"
                  />
                  <button onClick={handleUpdateName} disabled={savingName} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    {savingName ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  </button>
                  <button onClick={() => { setIsEditingName(false); setNewName(client.full_name); }} className="p-1.5 bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-gray-300">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {client?.full_name || 'Aluno'}
                  </h2>
                  <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full mt-2 inline-block">
              {client?.email}
            </p>
          </section>

          {/* MENU DE OPÇÕES */}
          <section>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest mb-3">
              Configurações
            </h3>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-slate-800 shadow-sm">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-slate-800">
                    <item.icon size={20} className="text-slate-700 dark:text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 dark:text-slate-600" />
                </button>
              ))}
            </div>
          </section>

          {/* LOGOUT */}
          <section>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 rounded-2xl text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shadow-sm"
            >
              <LogOut size={18} />
              Sair da Conta
            </button>
          </section>

          <div className="text-center pt-4">
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              Powered by TribeBuild
            </p>
          </div>

        </main>

        <BottomNavigation primaryColor={primaryColor} />
      </div>

      {/* ✅ USO DO MODAL COMPACTO */}
      <InstallTutorialModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        language={appData.language || 'PT'}
        primaryColor={primaryColor}
      />
    </div>
  );
}