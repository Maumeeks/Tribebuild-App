
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  Play,
  CheckCircle2, 
  Circle,
  Lock,
  Clock,
  FileText,
  Download,
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

// Mock de dados do app
const mockAppData: Record<string, {
  name: string;
  logo: string | null;
  primaryColor: string;
}> = {
  'academia-fit': {
    name: 'Academia Fit',
    logo: null,
    primaryColor: '#2563EB'
  },
  'curso-ingles': {
    name: 'Curso de Inglês Pro',
    logo: null,
    primaryColor: '#10B981'
  },
  'mentoria-negocios': {
    name: 'Mentoria Negócios',
    logo: null,
    primaryColor: '#8B5CF6'
  }
};

// Tipos
interface Lesson {
  id: string;
  title: string;
  duration: string;
  status: 'completed' | 'available' | 'locked';
  type: 'video' | 'pdf' | 'text' | 'quiz';
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'xls';
  url: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image: string | null;
  modules: Module[];
  materials: Material[];
}

// Mock de produto
const mockProduct: Product = {
  id: '1',
  name: 'Treino Completo de Elite',
  description: 'Programa completo de treinos para você alcançar resultados de nível profissional.',
  image: null,
  modules: [
    {
      id: 'm1',
      title: 'Módulo 1 - Mentalidade & Boas-vindas',
      lessons: [
        { id: 'l1', title: 'Bem-vindo ao Treino de Elite', duration: '5 min', status: 'completed', type: 'video' },
        { id: 'l2', title: 'Como funciona o suporte exclusivo', duration: '8 min', status: 'completed', type: 'video' },
        { id: 'l3', title: 'Equipamentos e Acessórios', duration: '6 min', status: 'completed', type: 'video' },
      ]
    },
    {
      id: 'm2',
      title: 'Módulo 2 - Preparação & Mobilidade',
      lessons: [
        { id: 'l4', title: 'Alongamento Dinâmico', duration: '10 min', status: 'completed', type: 'video' },
        { id: 'l5', title: 'Mobilidade de Quadril e Tornozelo', duration: '12 min', status: 'completed', type: 'video' },
        { id: 'l6', title: 'Ativação Metabólica Cardio', duration: '15 min', status: 'available', type: 'video' },
        { id: 'l7', title: 'Protocolo de Liberação Miofascial', duration: '20 min', status: 'locked', type: 'video' },
      ]
    },
    {
      id: 'm3',
      title: 'Módulo 3 - Protocolo de Força A',
      lessons: [
        { id: 'l8', title: 'Treino A - Peito e Tríceps (Foco em Hipertrofia)', duration: '45 min', status: 'locked', type: 'video' },
        { id: 'l9', title: 'Variantes Avançadas de Supino', duration: '45 min', status: 'locked', type: 'video' },
        { id: 'l10', title: 'Isometria em Membros Superiores', duration: '50 min', status: 'locked', type: 'video' },
      ]
    }
  ],
  materials: [
    { id: 'mat1', title: 'Guia de Execução Perfeita (PDF)', type: 'pdf', url: '#' },
    { id: 'mat2', title: 'Planilha de Cargas Progressivas', type: 'xls', url: '#' },
  ]
};

export default function PwaProductPage() {
  const { appSlug, productId } = useParams<{ appSlug: string; productId: string }>();
  const navigate = useNavigate();
  
  // Estado dos módulos abertos
  const [openModules, setOpenModules] = useState<string[]>(['m1', 'm2']);

  // Buscar dados do app
  const appData = appSlug ? mockAppData[appSlug] : null;

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center ">
        <div className="space-y-4 animate-pulse">
           <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Buscando Conteúdo...</p>
        </div>
      </div>
    );
  }

  const product = mockProduct;

  // Calcular progresso total
  const totalLessons = product.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completedLessons = product.modules.reduce(
    (acc, mod) => acc + mod.lessons.filter(l => l.status === 'completed').length, 
    0
  );
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter(l => l.status === 'completed').length;
    return `${completed}/${module.lessons.length}`;
  };

  const isModuleComplete = (module: Module) => {
    return module.lessons.every(l => l.status === 'completed');
  };

  const goToLesson = (lesson: Lesson) => {
    if (lesson.status === 'locked') return;
    alert(`Acessando aula: ${lesson.title}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 ">
      {/* Header Premium */}
      <header 
        className="sticky top-0 z-30 px-6 py-4 flex items-center gap-4 shadow-lg transition-all"
        style={{ 
            backgroundColor: appData.primaryColor,
            boxShadow: `0 4px 20px ${appData.primaryColor}20`
        }}
      >
        <button 
          onClick={() => navigate(`/app/${appSlug}/home`)}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center transition-all active:scale-90 border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="min-w-0">
            <h1 className="text-white font-black text-base tracking-tight truncate leading-tight">{product.name}</h1>
            <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mt-0.5">Conteúdo do Curso</p>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="p-6 space-y-8 animate-slide-up">
        
        {/* Card de Progresso - Glassmorphism Aesthetic */}
        <div 
          className="rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl"
          style={{ 
              backgroundColor: appData.primaryColor,
              boxShadow: `0 20px 40px -10px ${appData.primaryColor}40`
          }}
        >
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                    <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Seu Progresso Atual</span>
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
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.15em]">Continue sua jornada de aprendizado</span>
            </div>
          </div>
        </div>

        {/* Módulos e Aulas */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trilha de Aprendizado</h2>
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
                            {module.title}
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
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => goToLesson(lesson)}
                            disabled={lesson.status === 'locked'}
                            className={cn(
                                "w-full flex items-center gap-4 p-5 text-left transition-all active:scale-[0.98]",
                                lesson.status === 'locked' ? 'opacity-40 grayscale' : 'hover:bg-white/60'
                            )}
                          >
                            <div className="relative flex-shrink-0">
                                {lesson.status === 'completed' ? (
                                    <div className="w-6 h-6 bg-green-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
                                        <CheckCircle2 size={12} strokeWidth={4} />
                                    </div>
                                ) : lesson.status === 'locked' ? (
                                    <div className="w-6 h-6 bg-slate-200 text-slate-400 rounded-lg flex items-center justify-center">
                                        <Lock size={12} />
                                    </div>
                                ) : (
                                    <div 
                                        className="w-6 h-6 rounded-lg flex items-center justify-center border-2 border-slate-300"
                                        style={{ borderColor: appData.primaryColor + '40' }}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: appData.primaryColor }} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-bold truncate leading-tight",
                                    lesson.status === 'locked' ? 'text-slate-400' : 'text-slate-800'
                                )}>
                                    {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 opacity-60">
                                    <Clock size={10} className="text-slate-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{lesson.duration}</span>
                                </div>
                            </div>

                            {lesson.status === 'available' && (
                                <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-90"
                                    style={{ backgroundColor: appData.primaryColor, boxShadow: `0 8px 15px -5px ${appData.primaryColor}40` }}
                                >
                                    <Play size={14} className="text-white fill-current ml-0.5" />
                                </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Materiais de Apoio - Premium Section */}
        {product.materials.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Materiais Complementares</h2>
            </div>
            
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              {product.materials.map((material, index) => (
                <a
                  key={material.id}
                  href={material.url}
                  download
                  className={cn(
                    "flex items-center gap-4 p-5 hover:bg-slate-50 transition-all group",
                    index < product.materials.length - 1 ? 'border-b border-slate-50' : ''
                  )}
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm"
                    style={{ backgroundColor: `${appData.primaryColor}08`, border: `1px solid ${appData.primaryColor}15` }}
                  >
                    <FileText className="w-5 h-5" style={{ color: appData.primaryColor }} />
                  </div>
                  <div className="flex-1">
                      <span className="block font-bold text-slate-800 text-sm tracking-tight leading-tight">
                        {material.title}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Download Liberado</span>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-slate-500 group-hover:bg-slate-100 transition-all">
                    <Download className="w-4 h-4" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <div className="text-center pb-12 pt-4 opacity-30">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Tecnologia TribeBuild • PWA de Alta Performance
          </p>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation primaryColor={appData.primaryColor} />
    </div>
  );
}
