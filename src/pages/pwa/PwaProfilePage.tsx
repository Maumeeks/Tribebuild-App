import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  Loader2,
  LogOut,
  Smartphone,
  User,
  Pencil,
  Check,
  X,
  Camera,
  Moon,
  Sun
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';

// URL do GIF de instalação (Deixe vazio '' se não tiver ainda)
const INSTALL_TUTORIAL_GIF = '';

interface ClientStats {
  totalCourses: number;
}

export default function PwaProfilePage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [stats, setStats] = useState<ClientStats>({ totalCourses: 0 });

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Estado do Tema (Dark/Light)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verifica preferência salva ou do sistema
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);

        // Sessão
        const sessionJson = localStorage.getItem(`@tribebuild:student:${appSlug}`);
        if (!sessionJson) {
          navigate(`/${appSlug}/login`);
          return;
        }
        const session = JSON.parse(sessionJson);

        // App
        const { data: app } = await supabase
          .from('apps')
          .select('*')
          .eq('slug', appSlug)
          .single();

        if (!app) throw new Error('App não encontrado');
        setAppData(app);

        // Cliente
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

        // Buscar estatísticas (Apenas Cursos)
        const { count } = await supabase
          .from('client_products')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientData.id)
          .eq('status', 'active');

        setStats({ totalCourses: count || 0 });

      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug) initPage();
  }, [appSlug, navigate]);

  // Função para Alternar Tema
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
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
      const fileName = `${client.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload para o Storage (Bucket 'avatars')
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Pegar URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Salvar URL no Cliente
      const { error: updateError } = await supabase
        .from('clients')
        .update({ avatar_url: publicUrl })
        .eq('id', client.id);

      if (updateError) throw updateError;

      setClient({ ...client, avatar_url: publicUrl });

    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar foto. Verifique se a imagem é menor que 2MB.');
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const primaryColor = appData.primary_color || '#f59e0b';

  const menuItems = [
    {
      icon: isDarkMode ? Sun : Moon, // Ícone muda conforme o tema
      label: 'Tema do App',
      description: isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro',
      action: toggleTheme // Ação de alternar tema
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
        if (INSTALL_TUTORIAL_GIF) {
          setShowInstallModal(true);
        } else {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (isIOS) {
            alert('No iPhone/iPad:\n1. Toque no botão "Compartilhar" (quadrado com seta pra cima)\n2. Procure e toque em "Adicionar à Tela de Início"');
          } else {
            alert('No Android/Chrome:\n1. Toque nos três pontinhos do navegador\n2. Toque em "Instalar aplicativo" ou "Adicionar à tela inicial"');
          }
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

          {/* CARD PERFIL / AVATAR GRANDE */}
          <section className="flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              {/* Input Invisível para Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
              />

              {/* Container da Foto */}
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

                {/* Overlay com Ícone de Câmera */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center z-10 pointer-events-none">
                  <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                </div>
              </div>
            </div>

            {/* Nome Editável */}
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
                  <button
                    onClick={handleUpdateName}
                    disabled={savingName}
                    className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    {savingName ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(client.full_name);
                    }}
                    className="p-1.5 bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-gray-300"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {client?.full_name || 'Aluno'}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Email (Não Editável) */}
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full mt-2 inline-block">
              {client?.email}
            </p>
          </section>

          {/* ESTATÍSTICAS (Apenas Cursos) */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                Suas Estatísticas
              </h3>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <User size={16} style={{ color: primaryColor }} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Cursos Matriculados</span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalCourses}</p>
            </div>
          </section>

          {/* MENU DE OPÇÕES (Clean Style) */}
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

          {/* BOTÃO DE LOGOUT */}
          <section>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 rounded-2xl text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shadow-sm"
            >
              <LogOut size={18} />
              Sair da Conta
            </button>
          </section>

          {/* RODAPÉ */}
          <div className="text-center pt-4">
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              Powered by TribeBuild
            </p>
          </div>

        </main>

        <BottomNavigation primaryColor={primaryColor} />
      </div>

      {/* MODAL DE INSTALAÇÃO */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Como Instalar o App</h3>
              <button onClick={() => setShowInstallModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-full aspect-[9/16] bg-gray-100 dark:bg-slate-800 rounded-xl mb-4 overflow-hidden border border-gray-200 dark:border-slate-700">
                {INSTALL_TUTORIAL_GIF ? (
                  <img src={INSTALL_TUTORIAL_GIF} alt="Tutorial" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    GIF Tutorial Aqui
                  </div>
                )}
              </div>
              <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                Siga as instruções acima para adicionar o app à sua tela inicial.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}