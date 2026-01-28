import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle2,
  Lock,
  Clock,
  FileText,
  Download,
  BookOpen,
  Sparkles,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

// Tipos
interface Lesson {
  id: string;
  name: string;
  duration: string | null;
  video_url: string | null;
  content: string | null;
  order_index: number;
  completed?: boolean;
}

interface Module {
  id: string;
  name: string;
  order_index: number;
  lessons: Lesson[];
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  modules: Module[];
}

export default function PwaProductPage() {
  const { appSlug, productId } = useParams<{ appSlug: string; productId: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState<string[]>([]);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);

        // 1. Buscar sessão
        const sessionJson = localStorage.getItem(`@tribebuild:student:${appSlug}`);
        if (!sessionJson) {
          navigate(`/${appSlug}/login`);
          return;
        }
        const session = JSON.parse(sessionJson);

        // 2. Buscar app
        const { data: app } = await supabase
          .from('apps')
          .select('*')
          .eq('slug', appSlug)
          .single();

        if (!app) throw new Error('App não encontrado');
        setAppData(app);

        // 3. Buscar cliente
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

        // 4. Buscar produto
        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (!productData) throw new Error('Produto não encontrado');

        // 5. Buscar módulos
        const { data: modules } = await supabase
          .from('modules')
          .select('*')
          .eq('product_id', productId)
          .order('order_index');

        // 6. Para cada módulo, buscar aulas
        const modulesWithLessons: Module[] = [];

        for (const mod of modules || []) {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', mod.id)
            .order('order_index');

          // Verificar progresso de cada aula
          const lessonsWithProgress = await Promise.all(
            (lessons || []).map(async (lesson) => {
              const { data: progress } = await supabase
                .from('client_progress')
                .select('completed')
                .eq('client_id', clientData.id)
                .eq('lesson_id', lesson.id)
                .maybeSingle();

              return {
                ...lesson,
                completed: progress?.completed || false
              };
            })
          );

          modulesWithLessons.push({
            ...mod,
            lessons: lessonsWithProgress
          });
        }

        setProduct({
          ...productData,
          modules: modulesWithLessons
        });

        // Abrir primeiro módulo por padrão
        if (modulesWithLessons.length > 0) {
          setOpenModules([modulesWithLessons[0].id]);
        }

      } catch (err) {
        console.error('Erro ao carregar produto:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug && productId) initPage();
  }, [appSlug, productId, navigate]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter(l => l.completed).length;
    return `${completed}/${module.lessons.length}`;
  };

  const isModuleComplete = (module: Module) => {
    return module.lessons.every(l => l.completed);
  };

  const goToLesson = async (lesson: Lesson) => {
    if (!lesson.video_url) {
      alert('Esta aula ainda não tem vídeo disponível.');
      return;
    }

    // Navegar para player (você pode criar uma página separada)
    alert(`Player: ${lesson.name}\n\nVídeo URL: ${lesson.video_url}`);

    // Marcar como concluída (exemplo simples)
    if (client && !lesson.completed) {
      await supabase.from('client_progress').upsert({
        client_id: client.id,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString()
      });

      // Recarregar página para atualizar progresso
      window.location.reload();
    }
  };

  if (loading || !appData || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Calcular progresso total
  const totalLessons = product.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completedLessons = product.modules.reduce(
    (acc, mod) => acc + mod.lessons.filter(l => l.completed).length,
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER */}
      <header
        className="sticky top-0 z-30 px-6 py-4 flex items-center gap-4 shadow-lg transition-all"
        style={{
          backgroundColor: appData.primary_color,
          boxShadow: `0 4px 20px ${appData.primary_color}20`
        }}
      >
        <button
          onClick={() => navigate(`/${appSlug}/home`)}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center transition-all active:scale-90 border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="min-w-0">
          <h1 className="text-white font-black text-base tracking-tight truncate leading-tight">
            {product.name}
          </h1>
          <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mt-0.5">
            Conteúdo do Curso
          </p>
        </div>
      </header>

      <main className="p-6 space-y-8 animate-slide-up">

        {/* CARD DE PROGRESSO */}
        <div
          className="rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl"
          style={{
            backgroundColor: appData.primary_color,
            boxShadow: `0 20px 40px -10px ${appData.primary_color}40`
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                Seu Progresso Atual
              </span>
            </div>

            <div className="flex items-end justify-between mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter">{progressPercent}</span>
                <span className="text-lg font-black opacity-60">%</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                {completedLessons} de {totalLessons} aulas finalizadas
              </span>
            </div>

            <div className="h-3 bg-white/20 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-6 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-white/60" />
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.15em]">
                Continue sua jornada de aprendizado
              </span>
            </div>
          </div>
        </div>

        {/* MÓDULOS E AULAS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Trilha de Aprendizado
            </h2>
          </div>

          <div className="space-y-4">
            {product.modules.map((module, mIdx) => {
              const isOpen = openModules.includes(module.id);
              const isComplete = isModuleComplete(module);

              return (
                <div
                  key={module.id}
                  className={cn(
                    "bg-white rounded-[2rem] border-2 transition-all duration-300 overflow-hidden",
                    isOpen ? "border-slate-100 shadow-xl ring-4 ring-slate-50" : "border-transparent shadow-sm"
                  )}
                >
                  {/* Cabeçalho do Módulo */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                          isComplete
                            ? "bg-green-50 text-green-500 border border-green-100"
                            : "bg-slate-50 text-slate-400 border border-slate-100"
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[3px]" />
                        ) : (
                          <span className="text-xs font-black">{mIdx + 1}</span>
                        )}
                      </div>
                      <div>
                        <span className="block font-black text-slate-900 tracking-tight leading-none text-base">
                          {module.name}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">
                          {module.lessons.length} aulas • {getModuleProgress(module)} concluídas
                        </span>
                      </div>
                    </div>

                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      isOpen ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-300"
                    )}>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </button>

                  {/* Lista de Aulas */}
                  {isOpen && (
                    <div className="px-4 pb-4 animate-fade-in">
                      <div className="bg-slate-50 rounded-[1.5rem] border border-slate-100 divide-y divide-slate-200/50">
                        {module.lessons.map((lesson) => {
                          const isLocked = !lesson.video_url;
                          const isCompleted = lesson.completed;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => !isLocked && goToLesson(lesson)}
                              disabled={isLocked}
                              className={cn(
                                "w-full flex items-center gap-4 p-5 text-left transition-all active:scale-[0.98]",
                                isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-white/60 cursor-pointer'
                              )}
                            >
                              <div className="relative flex-shrink-0">
                                {isCompleted ? (
                                  <div className="w-6 h-6 bg-green-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
                                    <CheckCircle2 size={12} strokeWidth={4} />
                                  </div>
                                ) : isLocked ? (
                                  <div className="w-6 h-6 bg-slate-200 text-slate-400 rounded-lg flex items-center justify-center">
                                    <Lock size={12} />
                                  </div>
                                ) : (
                                  <div
                                    className="w-6 h-6 rounded-lg flex items-center justify-center border-2 border-slate-300"
                                    style={{ borderColor: appData.primary_color + '40' }}
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: appData.primary_color }} />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm font-bold truncate leading-tight",
                                  isLocked ? 'text-slate-400' : 'text-slate-800'
                                )}>
                                  {lesson.name}
                                </p>
                                {lesson.duration && (
                                  <div className="flex items-center gap-2 mt-1 opacity-60">
                                    <Clock size={10} className="text-slate-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {!isLocked && !isCompleted && (
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-90"
                                  style={{
                                    backgroundColor: appData.primary_color,
                                    boxShadow: `0 8px 15px -5px ${appData.primary_color}40`
                                  }}
                                >
                                  <Play size={14} className="text-white fill-current ml-0.5" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <div className="text-center pb-12 pt-4 opacity-30">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Tecnologia TribeBuild • PWA de Alta Performance
        </p>
      </div>

      <BottomNavigation primaryColor={appData.primary_color} />
    </div>
  );
}