import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Lock, Clock, ChevronRight, Gift, ExternalLink, Bell, Sparkles, Trophy, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

// Mocks de Produtos (Futuramente virão do banco 'products')
const mockProducts = [
  {
    id: '1',
    name: 'Boas Vindas & Comece Aqui',
    image: null,
    totalLessons: 3,
    completedLessons: 0,
    status: 'available',
    lastLesson: null
  },
  {
    id: '2',
    name: 'Módulo 1: Fundamentos',
    image: null,
    totalLessons: 12,
    completedLessons: 0,
    status: 'locked', // Exemplo de upsell/bloqueado
    releaseDate: '2025-05-03',
    lastLesson: null
  }
];

export default function PwaHomePage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOrderBump, setShowOrderBump] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      try {
        // 1. Verificar "Pulseirinha" (Sessão Manual)
        const sessionJson = localStorage.getItem(`@tribebuild:student:${appSlug}`);

        if (!sessionJson) {
          // Se não tem pulseirinha, vai pro login
          navigate(`/${appSlug}/login`);
          return;
        }

        const session = JSON.parse(sessionJson);
        setStudent(session);

        // 2. Buscar Dados Reais do App (Cores, Logo, Nome)
        const { data: app, error } = await supabase
          .from('apps')
          .select('*')
          .eq('slug', appSlug)
          .single();

        if (error) throw error;
        setAppData(app);

      } catch (err) {
        console.error('Erro ao carregar home:', err);
        // Se der erro grave, manda pro login para tentar recuperar
        navigate(`/${appSlug}/login`);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug) initPage();
  }, [appSlug, navigate]);

  // Loading State
  if (loading || !appData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  // Funções Auxiliares de UI
  const getProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Disponível';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays <= 7) return `Em ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-['inter']">

      {/* Header Estilizado Dinâmico */}
      <header
        className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg transition-all"
        style={{
          backgroundColor: appData.primary_color, // ✅ Cor Real do Banco
          boxShadow: `0 4px 20px ${appData.primary_color}40`
        }}
      >
        <div className="flex items-center gap-3">
          {appData.logo_url ? (
            <img src={appData.logo_url} alt={appData.name} className="w-10 h-10 rounded-xl object-cover shadow-sm bg-white/10" />
          ) : (
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-sm">
              <span className="text-white font-black text-xl leading-none">
                {appData.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-white font-black tracking-tight leading-none text-base">{appData.name}</h2>
            <p className="text-white/70 text-[8px] font-black uppercase tracking-widest mt-1">Área do Aluno</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-colors border border-white/10">
          <Bell className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="p-6 space-y-8 animate-slide-up">

        {/* Saudação Personalizada */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {/* ✅ Nome Real do Aluno (ou parte do email se não tiver nome) */}
              Olá, {student.name || student.email.split('@')[0]}! 👋
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Vamos evoluir hoje?</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* LISTA DE PRODUTOS (Por enquanto Mockados, mas funcionais visualmente) */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: appData.primary_color }} />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Seus Cursos
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {mockProducts.map((product, idx) => {
              const progress = getProgress(product.completedLessons, product.totalLessons);
              const isLocked = product.status === 'locked';

              return (
                <div
                  key={product.id}
                  onClick={() => !isLocked && navigate(`/app/${appSlug}/product/${product.id}`)}
                  className={cn(
                    "bg-white rounded-[2rem] border-2 overflow-hidden transition-all duration-300 animate-slide-up",
                    isLocked
                      ? 'opacity-60 grayscale border-slate-100'
                      : 'cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-95 border-transparent shadow-sm'
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Imagem do Produto */}
                  <div
                    className="h-28 flex items-center justify-center relative group"
                    style={{ backgroundColor: isLocked ? '#F1F5F9' : `${appData.primary_color}15` }}
                  >
                    {isLocked ? (
                      <div className="bg-white p-3 rounded-2xl shadow-sm">
                        <Lock className="w-6 h-6 text-slate-300" />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-black/5"
                        style={{ backgroundColor: appData.primary_color }}
                      >
                        {product.name.charAt(0)}
                      </div>
                    )}

                    {!isLocked && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-[8px] font-black text-slate-400 uppercase border border-white">
                        {product.totalLessons} Aulas
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-black text-slate-900 text-sm tracking-tight leading-tight line-clamp-2 min-h-[40px]">
                      {product.name}
                    </h3>

                    {isLocked ? (
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">
                        <Clock className="w-3 h-3" />
                        <span>Em breve</span>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-2">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: appData.primary_color
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{progress}%</span>
                          {progress === 100 && <Sparkles className="w-3 h-3 text-amber-400" />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exemplo de Upsell (Banner de Oferta) */}
        {showOrderBump && (
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden animate-slide-up shadow-2xl shadow-slate-900/20" style={{ animationDelay: '400ms' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                    <Gift className="w-4 h-4 text-slate-900" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">OFERTA VIP</span>
                </div>
                <button onClick={() => setShowOrderBump(false)} className="text-white/30 hover:text-white transition-colors p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-xl font-black text-white mb-2 tracking-tight leading-tight">
                Módulo Elite: Vendas 10x
              </h3>
              <p className="text-white/50 text-xs font-medium mb-6 leading-relaxed">
                Desbloqueie estratégias avançadas que não estão no plano básico. Aumente seus resultados hoje.
              </p>

              <button className="w-full h-14 flex items-center justify-center gap-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.15em] text-xs hover:bg-slate-100 transition-all shadow-xl">
                Quero Desbloquear
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer sutil */}
      <div className="text-center pb-12 pt-4 px-6 opacity-30">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Tecnologia TribeBuild
        </p>
      </div>
    </div>
  );
}