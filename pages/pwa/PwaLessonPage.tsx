
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Clock,
  BookOpen,
  Sparkles
} from 'lucide-react';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

// Mock de dados do app (mesmo dos blocos anteriores)
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
interface LessonMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'doc';
  url: string;
}

interface Lesson {
  id: string;
  title: string;
  moduleName: string;
  moduleId: string;
  productId: string;
  productName: string;
  duration: string;
  durationSeconds: number;
  description: string;
  videoUrl: string | null;
  contentType: 'video' | 'text' | 'pdf';
  textContent?: string;
  completed: boolean;
  materials: LessonMaterial[];
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
}

// Mock de aula individual
const mockLesson: Lesson = {
  id: 'l6',
  title: 'Cardio Leve & Ativação Metabólica',
  moduleName: 'Módulo 2 - Aquecimento',
  moduleId: 'm2',
  productId: '1',
  productName: 'Treino Completo de Elite',
  duration: '15 min',
  durationSeconds: 900,
  description: 'Nesta aula de nível intermediário, focamos na ativação metabólica necessária para treinos de alta intensidade.\n\nPrincipais pontos abordados:\n• Controle respiratório sob carga baixa\n• Ativação de membros inferiores\n• Progressão de frequência cardíaca\n• Preparação articular específica',
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Video real para demo dos controles
  contentType: 'video',
  completed: false,
  materials: [
    { id: 'mat1', title: 'Checklist do Protocolo Cardio (PDF)', type: 'pdf', url: '#' },
  ],
  prevLesson: { id: 'l5', title: 'Mobilidade articular' },
  nextLesson: { id: 'l7', title: 'Protocolo de Liberação' }
};

export default function PwaLessonPage() {
  const { appSlug, lessonId } = useParams<{ appSlug: string; lessonId: string }>();
  const navigate = useNavigate();
  
  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isCompleted, setIsCompleted] = useState(mockLesson.completed);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const appData = appSlug ? mockAppData[appSlug] : null;

  useEffect(() => {
    // Reset controls timer
    const resetTimer = () => {
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
      setShowControls(true);
      controlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="space-y-4 animate-pulse">
           <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Carregando Aula...</p>
        </div>
      </div>
    );
  }

  const lesson = mockLesson;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) document.exitFullscreen();
      else videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted);
  };

  const progressPercent = lesson.durationSeconds > 0 
    ? (currentTime / lesson.durationSeconds) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 ">
      {/* Header Premium */}
      <header 
        className="sticky top-0 z-30 px-6 py-4 flex items-center gap-4 shadow-lg"
        style={{ 
            backgroundColor: appData.primaryColor,
            boxShadow: `0 4px 20px ${appData.primaryColor}20`
        }}
      >
        <button 
          onClick={() => navigate(`/app/${appSlug}/product/${lesson.productId}`)}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center transition-all active:scale-90 border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="min-w-0">
          <h1 className="text-white font-black text-sm tracking-tight truncate leading-tight">{lesson.moduleName}</h1>
          <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mt-0.5">{lesson.productName}</p>
        </div>
      </header>

      {/* Player de Vídeo Customizado */}
      {lesson.contentType === 'video' && (
        <div 
          className="relative bg-black aspect-video overflow-hidden shadow-2xl group"
          onClick={togglePlay}
        >
          <video 
            ref={videoRef}
            src={lesson.videoUrl || ''}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            playsInline
          />

          {/* Overlay Play Grande Central */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-100 hover:scale-110 transition-transform cursor-pointer">
                    <Play size={32} className="text-slate-900 fill-current ml-1" />
                </div>
            </div>
          )}

          {/* Controles do Player Estilizados */}
          <div 
            className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 transition-all duration-500",
                showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra de Progresso com Cor do App */}
            <div className="mb-5 group/seek">
              <input
                type="range"
                min="0"
                max={lesson.durationSeconds}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer transition-all hover:h-2"
                style={{
                  background: `linear-gradient(to right, ${appData.primaryColor} 0%, ${appData.primaryColor} ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                  {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                </button>
                <div className="flex items-center gap-4">
                    <button onClick={toggleMute} className="text-white hover:text-white/80">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <span className="text-white text-[10px] font-black uppercase tracking-widest tabular-nums">
                    {formatTime(currentTime)} <span className="opacity-40">/ {formatTime(lesson.durationSeconds)}</span>
                    </span>
                </div>
              </div>
              <button onClick={toggleFullscreen} className="text-white hover:scale-110 transition-transform">
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="p-6 space-y-6 animate-slide-up">
        {/* Título e Duração */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{lesson.title}</h2>
            <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-lg">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lesson.duration}</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Módulo 02</span>
            </div>
          </div>
          {isCompleted && (
              <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 animate-fade-in">
                  <CheckCircle2 size={24} strokeWidth={3} />
              </div>
          )}
        </div>

        {/* Card Sobre a Aula */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500">
                <BookOpen size={18} />
            </div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">O que você verá aqui</h3>
          </div>
          <p className="text-slate-600 text-sm font-medium leading-relaxed whitespace-pre-line">
            {lesson.description}
          </p>
        </div>

        {/* Materiais Complementares */}
        {lesson.materials.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recursos para Download</h3>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {lesson.materials.map((material) => (
                <a
                  key={material.id}
                  href={material.url}
                  download
                  className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-all group"
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                    style={{ backgroundColor: `${appData.primaryColor}08` }}
                  >
                    <FileText className="w-5 h-5" style={{ color: appData.primaryColor }} />
                  </div>
                  <span className="flex-1 font-bold text-slate-800 text-sm">{material.title}</span>
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-slate-500 transition-all">
                    <Download className="w-4 h-4" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Botão de Conclusão Estilizado */}
        <button
          onClick={handleToggleComplete}
          className={cn(
            "w-full flex items-center justify-center gap-4 p-6 rounded-[2rem] border-2 font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl active:scale-[0.98]",
            isCompleted
              ? 'border-green-500 bg-green-50 text-green-700 shadow-green-500/10'
              : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'
          )}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={20} strokeWidth={3} />
              Aula Concluída com Sucesso
            </>
          ) : (
            <>
              <Circle size={20} strokeWidth={3} className="opacity-40" />
              Marcar como Assistida
            </>
          )}
        </button>

        {/* Navegação Rápida */}
        <div className="grid grid-cols-2 gap-4 pt-4 pb-8">
          {lesson.prevLesson ? (
            <button
              onClick={() => navigate(`/app/${appSlug}/lesson/${lesson.prevLesson!.id}`)}
              className="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-slate-100 hover:bg-slate-50 transition-all group shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-colors">
                 <ChevronLeft size={20} />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Anterior</p>
                <p className="text-xs font-black text-slate-900 truncate leading-tight mt-0.5">
                  {lesson.prevLesson.title}
                </p>
              </div>
            </button>
          ) : <div />}

          {lesson.nextLesson ? (
            <button
              onClick={() => navigate(`/app/${appSlug}/lesson/${lesson.nextLesson!.id}`)}
              className="flex items-center justify-end gap-4 p-5 bg-white rounded-[2rem] border-2 transition-all hover:shadow-xl group"
              style={{ borderColor: `${appData.primaryColor}20` }}
            >
              <div className="text-right min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Próxima Aula</p>
                <p 
                  className="text-xs font-black truncate leading-tight mt-0.5"
                  style={{ color: appData.primaryColor }}
                >
                  {lesson.nextLesson.title}
                </p>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shadow-lg shadow-blue-500/10 group-hover:scale-110"
                style={{ backgroundColor: appData.primaryColor }}
              >
                 <ChevronRight size={20} />
              </div>
            </button>
          ) : <div />}
        </div>
      </main>

      {/* Footer Branding sutil */}
      <div className="text-center pb-12 opacity-20">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Elite User Experience • TribeBuild
          </p>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation primaryColor={appData.primaryColor} />
    </div>
  );
}
