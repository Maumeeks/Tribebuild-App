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
  BookOpen,
  Sparkles,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

interface Lesson {
  id: string;
  name: string;
  duration: string | null;
  video_url: string | null;
  content_type: string | null;
  embed_code: string | null;
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
  thumbnail_url: string | null;
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

        const sessionJson = localStorage.getItem(`@tribebuild:student:${appSlug}`);
        if (!sessionJson) {
          navigate(`/${appSlug}/login`);
          return;
        }
        const session = JSON.parse(sessionJson);

        const { data: app } = await supabase
          .from('apps')
          .select('*')
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

        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (!productData) throw new Error('Produto não encontrado');

        const { data: modules } = await supabase
          .from('modules')
          .select('*')
          .eq('product_id', productId)
          .order('order_index');

        const modulesWithLessons: Module[] = [];

        for (const mod of modules || []) {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', mod.id)
            .order('order_index');

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
    return module.lessons.length > 0 && module.lessons.every(l => l.completed);
  };

  const goToLesson = (lesson: Lesson) => {
    navigate(`/${appSlug}/lesson/${lesson.id}`);
  };

  if (loading || !appData || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const primaryColor = appData.primary_color || '#f59e0b';

  const totalLessons = product.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completedLessons = product.modules.reduce(
    (acc, mod) => acc + mod.lessons.filter(l => l.completed).length,
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center transition-colors duration-300">
      <div className="w-full max-w-md bg-gray-50 dark:bg-slate-950 min-h-screen relative shadow-2xl border-x border-gray-200 dark:border-slate-800 text-slate-900 dark:text-white pb-24 transition-colors duration-300">

        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 px-5 py-4 flex items-center gap-4 transition-colors duration-300">
          <button
            onClick={() => navigate(`/${appSlug}/home`)}
            className="w-10 h-10 bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl flex items-center justify-center transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-white" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-slate-900 dark:text-white font-bold text-sm truncate leading-tight">
              {product.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium uppercase tracking-wider mt-0.5">
              Conteúdo do Curso
            </p>
          </div>
        </header>

        <main className="p-5 space-y-6">

          {/* CARD DE PROGRESSO */}
          <div
            className="rounded-2xl p-6 text-white relative overflow-hidden shadow-xl"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 15px 30px -10px ${primaryColor}50`
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                  Seu Progresso Atual
                </span>
              </div>

              <div className="flex items-end justify-between mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter">{progressPercent}</span>
                  <span className="text-xl font-bold opacity-60">%</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                  {completedLessons} de {totalLessons} aulas
                </span>
              </div>

              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-white/60" />
                <span className="text-[9px] font-medium text-white/60 uppercase tracking-wider">
                  Continue sua jornada de aprendizado
                </span>
              </div>
            </div>
          </div>

          {/* MÓDULOS E AULAS */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <h2 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Trilha de Aprendizado
              </h2>
            </div>

            <div className="space-y-3">
              {product.modules.map((module, mIdx) => {
                const isOpen = openModules.includes(module.id);
                const isComplete = isModuleComplete(module);

                return (
                  <div
                    key={module.id}
                    className={cn(
                      "bg-white dark:bg-slate-900/80 rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm",
                      isOpen
                        ? "border-gray-200 dark:border-slate-700"
                        : "border-gray-100 dark:border-slate-800"
                    )}
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-transparent",
                            isComplete
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-gray-200 dark:border-slate-700"
                          )}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-bold">{mIdx + 1}</span>
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900 dark:text-white text-sm leading-tight">
                            {module.name}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 block">
                            {module.lessons.length} aulas • {getModuleProgress(module)} concluídas
                          </span>
                        </div>
                      </div>

                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                        isOpen
                          ? "text-white"
                          : "bg-gray-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                      )}
                        style={isOpen ? { backgroundColor: primaryColor } : {}}
                      >
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4">
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50 divide-y divide-gray-200 dark:divide-slate-700/50">
                          {module.lessons.map((lesson) => {
                            const hasContent = lesson.video_url || lesson.embed_code;
                            const isCompleted = lesson.completed;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => goToLesson(lesson)}
                                className="w-full flex items-center gap-4 p-4 text-left transition-all active:scale-[0.98] hover:bg-gray-200/50 dark:hover:bg-slate-700/30 cursor-pointer"
                              >
                                <div className="relative flex-shrink-0">
                                  {isCompleted ? (
                                    <div className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-sm shadow-emerald-500/20">
                                      <CheckCircle2 size={14} />
                                    </div>
                                  ) : !hasContent ? (
                                    <div className="w-7 h-7 bg-gray-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-lg flex items-center justify-center">
                                      <Lock size={14} />
                                    </div>
                                  ) : (
                                    <div
                                      className="w-7 h-7 rounded-lg flex items-center justify-center border-2"
                                      style={{ borderColor: `${primaryColor}50` }}
                                    >
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: primaryColor }}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate leading-tight text-slate-700 dark:text-white">
                                    {lesson.name}
                                  </p>
                                  {lesson.duration && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Clock size={10} className="text-slate-400 dark:text-slate-500" />
                                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-500">
                                        {lesson.duration}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {hasContent && !isCompleted && (
                                  <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-90 shadow-sm"
                                    style={{ backgroundColor: primaryColor }}
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

        <div className="text-center pb-8 pt-4">
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            Tecnologia TribeBuild • PWA
          </p>
        </div>

        <BottomNavigation primaryColor={primaryColor} />
      </div>
    </div>
  );
}