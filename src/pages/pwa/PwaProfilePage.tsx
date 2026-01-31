import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  HelpCircle,
  Loader2,
  LogOut,
  Moon,
  Settings,
  Shield,
  Smartphone,
  User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

interface ClientStats {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
}

export default function PwaProfilePage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [stats, setStats] = useState<ClientStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0
  });
  const [loading, setLoading] = useState(true);

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

        // Buscar estatísticas do cliente
        await loadStats(clientData.id);

      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug) initPage();
  }, [appSlug, navigate]);

  const loadStats = async (clientId: string) => {
    try {
      // Buscar produtos do cliente
      const { data: clientProducts } = await supabase
        .from('client_products')
        .select('product_id')
        .eq('client_id', clientId)
        .eq('status', 'active');

      const totalCourses = clientProducts?.length || 0;

      // Buscar todas as aulas dos produtos do cliente
      const productIds = clientProducts?.map(cp => cp.product_id) || [];

      let totalLessons = 0;
      let completedLessons = 0;
      let completedCourses = 0;

      for (const productId of productIds) {
        // Buscar módulos do produto
        const { data: modules } = await supabase
          .from('modules')
          .select('id')
          .eq('product_id', productId);

        const moduleIds = modules?.map(m => m.id) || [];

        if (moduleIds.length > 0) {
          // Buscar aulas dos módulos
          const { data: lessons } = await supabase
            .from('lessons')
            .select('id')
            .in('module_id', moduleIds);

          const lessonCount = lessons?.length || 0;
          totalLessons += lessonCount;

          if (lessonCount > 0) {
            // Buscar progresso
            const { data: progress } = await supabase
              .from('client_progress')
              .select('id')
              .eq('client_id', clientId)
              .eq('completed', true)
              .in('lesson_id', lessons?.map(l => l.id) || []);

            const completedCount = progress?.length || 0;
            completedLessons += completedCount;

            // Verificar se curso está completo
            if (completedCount === lessonCount) {
              completedCourses++;
            }
          }
        }
      }

      setStats({
        totalCourses,
        completedCourses,
        totalLessons,
        completedLessons
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  const primaryColor = appData.primary_color || '#f59e0b';
  const progressPercent = stats.totalLessons > 0
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
    : 0;

  // Menu items
  const menuItems = [
    {
      icon: Bell,
      label: 'Notificações',
      description: 'Gerenciar alertas',
      action: () => alert('Em breve: Configurações de notificações')
    },
    {
      icon: Shield,
      label: 'Privacidade',
      description: 'Seus dados estão seguros',
      action: () => alert('Em breve: Configurações de privacidade')
    },
    {
      icon: HelpCircle,
      label: 'Ajuda & Suporte',
      description: 'Dúvidas frequentes',
      action: () => {
        if (appData.support_type === 'whatsapp' && appData.support_value) {
          const phone = appData.support_value.replace(/\D/g, '');
          window.open(`https://wa.me/${phone}?text=Olá, preciso de ajuda!`, '_blank');
        } else if (appData.support_type === 'email' && appData.support_value) {
          window.location.href = `mailto:${appData.support_value}`;
        } else {
          alert('Entre em contato com o suporte do produtor.');
        }
      }
    },
    {
      icon: Smartphone,
      label: 'Instalar App',
      description: 'Adicionar à tela inicial',
      action: () => alert('Abra este site no navegador do seu celular e toque em "Adicionar à tela inicial" no menu do navegador.')
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-950 min-h-screen relative shadow-2xl border-x border-slate-900/50 font-['Inter'] text-white pb-24">

        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/50 px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(`/${appSlug}/home`)}
            className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-white font-bold text-sm truncate leading-tight">
              Meu Perfil
            </h1>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider mt-0.5">
              Configurações da conta
            </p>
          </div>
        </header>

        <main className="p-5 space-y-6">

          {/* CARD DO PERFIL */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}30 0%, transparent 50%)`
              }}
            />

            <div className="relative p-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {client?.full_name?.charAt(0) || client?.email?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white truncate">
                    {client?.full_name || 'Aluno'}
                  </h2>
                  <p className="text-xs text-slate-400 truncate">
                    {client?.email}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Membro desde {new Date(client?.created_at).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ESTATÍSTICAS */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              Suas Estatísticas
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Cursos */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <User size={14} style={{ color: primaryColor }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Cursos</span>
                </div>
                <p className="text-2xl font-black text-white">{stats.totalCourses}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {stats.completedCourses} concluídos
                </p>
              </div>

              {/* Aulas */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Settings size={14} style={{ color: primaryColor }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Aulas</span>
                </div>
                <p className="text-2xl font-black text-white">{stats.completedLessons}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  de {stats.totalLessons} assistidas
                </p>
              </div>
            </div>

            {/* Barra de progresso geral */}
            <div className="mt-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Progresso Geral</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: primaryColor }}
                >
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: primaryColor,
                    width: `${progressPercent}%`
                  }}
                />
              </div>
            </div>
          </section>

          {/* MENU DE OPÇÕES */}
          <section>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              Configurações
            </h3>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <item.icon size={18} style={{ color: primaryColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              ))}
            </div>
          </section>

          {/* BOTÃO DE LOGOUT */}
          <section>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={18} />
              Sair da Conta
            </button>
          </section>

          {/* RODAPÉ */}
          <div className="text-center pt-4">
            <p className="text-[9px] font-medium text-slate-700 uppercase tracking-widest">
              Powered by TribeBuild
            </p>
            <p className="text-[9px] text-slate-800 mt-1">
              v1.0.0
            </p>
          </div>

        </main>

        <BottomNavigation primaryColor={primaryColor} />
      </div>
    </div>
  );
}