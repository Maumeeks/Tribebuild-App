import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Lock, ShoppingCart, Loader2, FileText, Download, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';

export default function PwaLessonPage() {
  const { appSlug, lessonId } = useParams<{ appSlug: string; lessonId: string }>();
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();

  const [lesson, setLesson] = useState<any>(null);
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  // Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Busca Aula + Módulo + Produto
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*, modules(product_id, name, products(name, checkout_url))')
          .eq('id', lessonId)
          .single();

        if (lessonError) throw lessonError;

        // Busca App (Cores)
        const { data: appData, error: appError } = await supabase
          .from('apps')
          .select('name, primary_color')
          .eq('slug', appSlug)
          .single();

        setLesson(lessonData);
        setAppData(appData);

        // Validação de Acesso
        const productId = lessonData.modules?.product_id;
        const userHasProduct = profile?.products?.includes(productId);
        setHasAccess(!!userHasProduct);

      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && appSlug && !authLoading) fetchData();
  }, [lessonId, appSlug, profile, authLoading]);

  const togglePlay = () => {
    if (videoRef.current && hasAccess) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  // 🎯 Lógica Inteligente de Renderização
  const renderContent = () => {
    if (!hasAccess) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/90 backdrop-blur-md z-20">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
            <Lock size={32} className="text-amber-400" />
          </div>
          <h3 className="text-white font-black text-lg uppercase tracking-tight">Conteúdo Bloqueado</h3>
          <p className="text-white/60 text-xs mt-2 max-w-[250px] font-medium">
            Esta aula faz parte do <span className="text-white">{lesson?.modules?.products?.name}</span>.
          </p>
          <button
            onClick={() => window.open(lesson?.modules?.products?.checkout_url, '_blank')}
            className="mt-6 px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl flex items-center gap-3 transition-all active:scale-95"
          >
            <ShoppingCart size={16} /> Liberar Acesso
          </button>
        </div>
      );
    }

    // 1. PDF / Arquivo
    if (lesson?.content_type === 'pdf') {
      return (
        <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-red-500">
            <FileText size={40} />
          </div>
          <h3 className="text-slate-900 font-bold text-lg mb-2">Material em PDF</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">Este conteúdo é um arquivo para leitura ou download.</p>
          <a
            href={lesson.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
          >
            <Download size={18} /> Baixar / Visualizar PDF
          </a>
        </div>
      );
    }

    // 2. Embed (YouTube, Vimeo, Panda)
    if (['video_youtube', 'video_vimeo', 'video_panda', 'html'].includes(lesson?.content_type) && lesson?.embed_code) {
      return (
        <div
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: lesson.embed_code }}
        />
      );
    }

    // 3. Link Externo (Se for apenas URL do YouTube/Vimeo sem embed, tratamos básico ou iframe)
    // Nota: O ideal é converter URL em Embed, mas aqui mantemos o player nativo se for .mp4 direto
    return (
      <>
        <video
          ref={videoRef}
          src={lesson?.video_url}
          className="w-full h-full object-contain bg-black"
          playsInline
          onClick={togglePlay}
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20" onClick={togglePlay}>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 transition-transform">
              <Play size={28} className="text-slate-900 ml-1 fill-current" />
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading || authLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-6 py-4 flex items-center gap-4 shadow-lg transition-colors"
        style={{ backgroundColor: appData?.primary_color || '#0066FF' }}
      >
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-white font-black text-sm truncate">{lesson?.name}</h1>
          <p className="text-white/60 text-[8px] font-black uppercase tracking-widest">{lesson?.modules?.name}</p>
        </div>
      </header>

      {/* Player Area */}
      <div className="relative bg-black aspect-video overflow-hidden shadow-2xl z-10">
        {renderContent()}
      </div>

      {/* Conteúdo Abaixo */}
      <main className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">{lesson?.name}</h2>
        </div>

        {/* Descrição Rica (HTML) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden">
          <div
            className="prose prose-sm prose-slate max-w-none text-slate-600"
            dangerouslySetInnerHTML={{ __html: lesson?.description || '<p>Sem descrição.</p>' }}
          />
        </div>
      </main>

      <BottomNavigation primaryColor={appData?.primary_color} />
    </div>
  );
}