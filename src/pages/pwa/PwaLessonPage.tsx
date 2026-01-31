import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Play,
  Share2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

// ✅ Interface atualizada para usar attachments (jsonb)
interface Lesson {
  id: string;
  name: string;
  description: string | null;
  video_duration: number | null;
  video_url: string | null;
  content_type: string | null;
  embed_code: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  attachments: { url: string; name: string } | null; // ✅ JSONB
  module_id: string;
  order_index: number;
}

interface Module {
  id: string;
  name: string;
  product_id: string;
}

interface Product {
  id: string;
  name: string;
}

// Função para extrair ID do YouTube
const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Função para extrair ID do Vimeo
const extractVimeoId = (url: string): string | null => {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Gerar embed HTML
const generateEmbed = (contentType: string | null, videoUrl: string | null, embedCode: string | null): string | null => {
  // Se já tem embed code (Panda, HTML), usar direto
  if (embedCode) {
    return embedCode;
  }

  if (!videoUrl) return null;

  switch (contentType) {
    case 'video_youtube': {
      const videoId = extractYouTubeId(videoUrl);
      if (!videoId) return null;
      return `<iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
        allowfullscreen
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
      ></iframe>`;
    }
    case 'video_vimeo': {
      const videoId = extractVimeoId(videoUrl);
      if (!videoId) return null;
      return `<iframe 
        src="https://player.vimeo.com/video/${videoId}?badge=0&autopause=0" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        allow="autoplay; fullscreen; picture-in-picture" 
        allowfullscreen
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
      ></iframe>`;
    }
    case 'video_panda':
      return embedCode;
    case 'pdf_drive': {
      const match = videoUrl.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
      if (!match) return null;
      return `<iframe 
        src="https://drive.google.com/file/d/${match[1]}/preview" 
        width="100%" 
        height="100%" 
        style="min-height: 500px;"
        allow="autoplay"
      ></iframe>`;
    }
    case 'website':
      return `<iframe 
        src="${videoUrl}" 
        width="100%" 
        height="100%" 
        style="min-height: 500px; border: none;"
      ></iframe>`;
    default:
      // Tentar detectar automaticamente
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = extractYouTubeId(videoUrl);
        if (videoId) {
          return `<iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
            allowfullscreen
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          ></iframe>`;
        }
      }
      if (videoUrl.includes('vimeo.com')) {
        const videoId = extractVimeoId(videoUrl);
        if (videoId) {
          return `<iframe 
            src="https://player.vimeo.com/video/${videoId}?badge=0&autopause=0" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          ></iframe>`;
        }
      }
      return null;
  }
};

// Formatar duração
const formatDuration = (seconds: number | null): string | null => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function PwaLessonPage() {
  const { appSlug, lessonId } = useParams<{ appSlug: string; lessonId: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  // Aulas do módulo (para navegação)
  const [moduleLessons, setModuleLessons] = useState<Lesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

        // Aula
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (!lessonData) throw new Error('Aula não encontrada');
        setLesson(lessonData);

        // Módulo
        const { data: moduleData } = await supabase
          .from('modules')
          .select('*')
          .eq('id', lessonData.module_id)
          .single();

        if (moduleData) {
          setModule(moduleData);

          // Produto
          const { data: productData } = await supabase
            .from('products')
            .select('*')
            .eq('id', moduleData.product_id)
            .single();

          setProduct(productData);

          // Todas as aulas do módulo (para navegação)
          const { data: allLessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', moduleData.id)
            .order('order_index');

          if (allLessons) {
            setModuleLessons(allLessons);
            const idx = allLessons.findIndex(l => l.id === lessonId);
            setCurrentIndex(idx >= 0 ? idx : 0);
          }
        }

        // Verificar progresso
        const { data: progress } = await supabase
          .from('client_progress')
          .select('completed')
          .eq('client_id', clientData.id)
          .eq('lesson_id', lessonId)
          .maybeSingle();

        setIsCompleted(progress?.completed || false);

      } catch (err) {
        console.error('Erro ao carregar aula:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug && lessonId) initPage();
  }, [appSlug, lessonId, navigate]);

  const handleMarkComplete = async () => {
    if (!client || !lesson || marking) return;

    try {
      setMarking(true);

      await supabase.from('client_progress').upsert({
        client_id: client.id,
        lesson_id: lesson.id,
        completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : null
      }, {
        onConflict: 'client_id,lesson_id'
      });

      setIsCompleted(!isCompleted);

    } catch (err) {
      console.error('Erro ao marcar aula:', err);
    } finally {
      setMarking(false);
    }
  };

  const goToPrevLesson = () => {
    if (currentIndex > 0) {
      const prevLesson = moduleLessons[currentIndex - 1];
      navigate(`/${appSlug}/lesson/${prevLesson.id}`);
    }
  };

  const goToNextLesson = () => {
    if (currentIndex < moduleLessons.length - 1) {
      const nextLesson = moduleLessons[currentIndex + 1];
      navigate(`/${appSlug}/lesson/${nextLesson.id}`);
    }
  };

  if (loading || !appData || !lesson) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  const primaryColor = appData.primary_color || '#f59e0b';
  const embedHtml = generateEmbed(lesson.content_type, lesson.video_url, lesson.embed_code);

  // ✅ Extrair anexo do campo jsonb
  const attachment = lesson.attachments
    ? (typeof lesson.attachments === 'string' ? JSON.parse(lesson.attachments) : lesson.attachments)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-950 min-h-screen relative shadow-2xl border-x border-slate-900/50 font-['Inter'] text-white pb-24">

        {/* HEADER */}
        <header
          className="sticky top-0 z-30 px-5 py-4 flex items-center gap-4"
          style={{ backgroundColor: primaryColor }}
        >
          <button
            onClick={() => product ? navigate(`/${appSlug}/product/${product.id}`) : navigate(`/${appSlug}/home`)}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-white font-bold text-sm truncate leading-tight">
              {lesson.name}
            </h1>
            <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider mt-0.5">
              {module?.name || 'Aula'}
            </p>
          </div>
        </header>

        <main className="flex flex-col">

          {/* PLAYER DE VÍDEO */}
          <div className="relative bg-black">
            {embedHtml ? (
              <div
                className="relative w-full"
                style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
              >
                <div
                  className="absolute inset-0"
                  dangerouslySetInnerHTML={{ __html: embedHtml }}
                />
              </div>
            ) : lesson.content_type === 'audio' && lesson.file_url ? (
              <div className="p-8 flex flex-col items-center justify-center bg-slate-900">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Play size={32} style={{ color: primaryColor }} />
                </div>
                <audio
                  controls
                  className="w-full max-w-[300px]"
                  src={lesson.file_url}
                >
                  Seu navegador não suporta áudio.
                </audio>
              </div>
            ) : lesson.content_type === 'pdf' || lesson.content_type === 'file_embed' ? (
              lesson.file_url ? (
                <iframe
                  src={lesson.file_url}
                  className="w-full h-[500px] border-none"
                  title={lesson.name}
                />
              ) : (
                <div className="p-8 text-center bg-slate-900">
                  <FileText size={48} className="mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-500">Arquivo não disponível</p>
                </div>
              )
            ) : lesson.content_type === 'link' && lesson.video_url ? (
              <div className="p-8 text-center bg-slate-900">
                <a
                  href={lesson.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Share2 size={18} />
                  Abrir Link Externo
                </a>
              </div>
            ) : (
              <div className="aspect-video bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <Play size={48} className="mx-auto mb-4 text-slate-700" />
                  <p className="text-slate-500 text-sm">Conteúdo em breve</p>
                </div>
              </div>
            )}
          </div>

          {/* INFO E AÇÕES */}
          <div className="p-5 space-y-5">

            {/* Título e ações */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white leading-tight">
                  {lesson.name}
                </h2>
                {lesson.video_duration && (
                  <p className="text-xs text-slate-500 mt-1">
                    Duração: {formatDuration(lesson.video_duration)}
                  </p>
                )}
              </div>

              {/* Botão marcar como concluída */}
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95",
                  isCompleted
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                )}
              >
                {marking ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {isCompleted ? 'Concluída' : 'Concluir'}
              </button>
            </div>

            {/* ✅ Descrição com CSS para bullets */}
            {lesson.description && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                <div
                  className="text-sm text-slate-300 lesson-description"
                  dangerouslySetInnerHTML={{ __html: lesson.description }}
                />
                {/* ✅ CSS para renderizar bullet points do Quill */}
                <style>{`
                  .lesson-description ul,
                  .lesson-description ol {
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                  }
                  .lesson-description ul {
                    list-style-type: disc;
                  }
                  .lesson-description ol {
                    list-style-type: decimal;
                  }
                  .lesson-description li {
                    margin: 0.25rem 0;
                    color: #cbd5e1;
                  }
                  .lesson-description p {
                    margin: 0.5rem 0;
                  }
                  .lesson-description strong,
                  .lesson-description b {
                    font-weight: 700;
                    color: #f1f5f9;
                  }
                  .lesson-description em,
                  .lesson-description i {
                    font-style: italic;
                  }
                  .lesson-description a {
                    color: ${primaryColor};
                    text-decoration: underline;
                  }
                  .lesson-description u {
                    text-decoration: underline;
                  }
                  .lesson-description s {
                    text-decoration: line-through;
                  }
                `}</style>
              </div>
            )}

            {/* ✅ Anexo usando campo jsonb */}
            {attachment?.url && (
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Download size={18} style={{ color: primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {attachment.name || 'Material Complementar'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Clique para baixar
                  </p>
                </div>
              </a>
            )}

            {/* Navegação entre aulas */}
            {moduleLessons.length > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={goToPrevLesson}
                  disabled={currentIndex === 0}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    currentIndex === 0
                      ? "text-slate-600 cursor-not-allowed"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>

                <span className="text-[10px] text-slate-600 font-medium">
                  {currentIndex + 1} / {moduleLessons.length}
                </span>

                <button
                  onClick={goToNextLesson}
                  disabled={currentIndex === moduleLessons.length - 1}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    currentIndex === moduleLessons.length - 1
                      ? "text-slate-600 cursor-not-allowed"
                      : "hover:bg-slate-800"
                  )}
                  style={currentIndex < moduleLessons.length - 1 ? { color: primaryColor } : {}}
                >
                  Próxima
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

          </div>
        </main>

        <BottomNavigation primaryColor={primaryColor} />
      </div>
    </div>
  );
}