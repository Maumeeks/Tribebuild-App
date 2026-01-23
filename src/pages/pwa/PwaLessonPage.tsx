import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, CheckCircle2,
  Circle, ChevronLeft, ChevronRight, FileText, Download, Clock,
  BookOpen, Lock, ShoppingCart, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext'; // ✅ Seu novo contexto
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import Button from '../../components/Button';

export default function PwaLessonPage() {
  const { appSlug, lessonId } = useParams<{ appSlug: string; lessonId: string }>();
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth(); // ✅ Pega o perfil real

  // Estados de Dados Reais
  const [lesson, setLesson] = useState<any>(null);
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Motor de Busca de Dados e Validação de Acesso
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Busca a aula e o app simultaneamente
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*, modules(name, product_id, products(name, checkout_url))')
          .eq('id', lessonId)
          .single();

        if (lessonError) throw lessonError;

        const { data: appData, error: appError } = await supabase
          .from('apps')
          .select('name, primary_color, logo_url')
          .eq('slug', appSlug)
          .single();

        setLesson(lessonData);
        setAppData(appData);

        // 🛡️ Validação de Acesso (Cadeado Dinâmico)
        // Verifica se o ID do produto vinculado ao módulo desta aula está no array do aluno
        const productId = lessonData.modules?.product_id;
        const userHasProduct = profile?.products?.includes(productId);
        setHasAccess(!!userHasProduct);

      } catch (error) {
        console.error('Erro ao carregar aula:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && appSlug && !authLoading) fetchData();
  }, [lessonId, appSlug, profile, authLoading]);

  // Funções de Player (Mantidas da sua versão original)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current && hasAccess) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Premium dinâmico com a cor do App do Cliente */}
      <header
        className="sticky top-0 z-30 px-6 py-4 flex items-center gap-4 shadow-lg"
        style={{ backgroundColor: appData?.primary_color || '#0066FF' }}
      >
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-white font-black text-sm truncate">{lesson?.title}</h1>
          <p className="text-white/60 text-[8px] font-black uppercase tracking-widest">{lesson?.modules?.name}</p>
        </div>
      </header>

      {/* 🛡️ ÁREA DE VÍDEO OU CADEADO (Lógica HuskyApp) */}
      <div className="relative bg-black aspect-video overflow-hidden shadow-2xl">
        {hasAccess ? (
          // PLAYER LIBERADO
          <>
            <video
              ref={videoRef}
              src={lesson?.video_url}
              className="w-full h-full object-contain"
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              playsInline
              onClick={togglePlay}
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20" onClick={togglePlay}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                  <Play size={28} className="text-slate-900 ml-1 fill-current" />
                </div>
              </div>
            )}
          </>
        ) : (
          // 🔒 CADEADO DE UPSELL
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/90 backdrop-blur-md">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
              <Lock size={32} className="text-amber-400" />
            </div>
            <h3 className="text-white font-black text-lg uppercase tracking-tight">Conteúdo Bloqueado</h3>
            <p className="text-white/60 text-xs mt-2 max-w-[250px] font-medium">
              Esta aula faz parte do <span className="text-white">{lesson?.modules?.products?.name}</span>.
              Adquira agora para liberar o acesso imediato.
            </p>
            <button
              onClick={() => window.open(lesson?.modules?.products?.checkout_url, '_blank')}
              className="mt-6 px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl flex items-center gap-3 transition-all active:scale-95"
            >
              <ShoppingCart size={16} /> Liberar Acesso Agora
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo da Aula */}
      <main className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">{lesson?.title}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {lesson?.video_duration || '0'} min de conteúdo
            </span>
          </div>
        </div>

        {/* Materiais (Só aparecem se tiver acesso) */}
        {hasAccess && lesson?.attachments?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Materiais de Apoio</h3>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {lesson.attachments.map((file: any, idx: number) => (
                <a key={idx} href={file.url} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <FileText size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{file.name}</span>
                  <Download size={16} className="ml-auto text-slate-300" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Descrição */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {lesson?.description || 'Nenhuma descrição disponível para esta aula.'}
          </p>
        </div>
      </main>

      <BottomNavigation primaryColor={appData?.primary_color} />
    </div>
  );
}