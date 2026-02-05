import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bold, Italic, Underline, List, Link as LinkIcon,
  Image as ImageIcon, Calendar, Clock, Trash2, Edit3, Heart,
  MessageCircle, Send, X, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';

// --- TIPO PARA O CROP (Substituindo import externo para garantir funcionamento) ---
interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px';
}

// --- SUA FUNÇÃO DE CANVAS (ADAPTADA PARA AUTO-CROP) ---
async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop, fileName = 'cropped.jpg'): Promise<File | null> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const outputSize = 400; // Fixo 400x400
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 0.95);
  });
}

// --- COMPONENTE DO EDITOR VISUAL ---
const VisualEditor = ({ content, onChange }: { content: string, onChange: (html: string) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Executa comandos do browser (negrito, italico, etc)
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[250px] overflow-hidden">
      {/* Toolbar Visual */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
          <button onClick={() => execCmd('bold')} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all" title="Negrito"><Bold className="w-4 h-4" /></button>
          <button onClick={() => execCmd('italic')} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all" title="Itálico"><Italic className="w-4 h-4" /></button>
          <button onClick={() => execCmd('underline')} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all" title="Sublinhado"><Underline className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-1 pl-2">
          <button onClick={() => execCmd('insertUnorderedList')} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all" title="Lista"><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Área Editável (Visual) */}
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="w-full flex-1 p-6 text-slate-900 dark:text-white outline-none prose prose-sm max-w-none dark:prose-invert"
        style={{ minHeight: '150px' }}
        dangerouslySetInnerHTML={{ __html: content }} // Cuidado: Apenas para carga inicial
        data-placeholder="Escreva algo incrível..."
      />
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---

interface Post {
  id: string;
  app_id: string;
  content: string; // Agora armazena HTML
  image_url: string | null;
  created_at: string;
  scheduled_for: string | null;
  status: 'published' | 'scheduled' | 'draft';
  likes_count: number;
  comments_count: number;
}

type Tab = 'create' | 'list' | 'scheduled';

const FeedPage: React.FC = () => {
  const { appId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [posts, setPosts] = useState<Post[]>([]);
  const [scheduled, setScheduled] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Estado do formulário
  const [htmlContent, setHtmlContent] = useState(''); // HTML do editor
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });

  // 1. Fetch Posts
  const fetchPosts = async () => {
    if (!appId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feed_posts')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPosts(data.filter(p => p.status === 'published'));
        setScheduled(data.filter(p => p.status === 'scheduled'));
      }
    } catch (err) {
      console.error('Erro ao buscar posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [appId]);

  // 2. Processamento de Imagem (Auto-Crop 400x400)
  const processImage = async (file: File) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    await new Promise((resolve) => { img.onload = resolve; });

    // Lógica para centralizar o corte (Center Crop)
    const minSide = Math.min(img.width, img.height);
    const crop: PixelCrop = {
      unit: 'px',
      width: minSide,
      height: minSide,
      x: (img.width - minSide) / 2,
      y: (img.height - minSide) / 2
    };

    // Usa sua função getCroppedImg
    const croppedFile = await getCroppedImg(img, crop, file.name);
    return croppedFile;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const croppedFile = await processImage(file);
        if (croppedFile) {
          setImageFile(croppedFile);
          const reader = new FileReader();
          reader.onloadend = () => setImagePreview(reader.result as string);
          reader.readAsDataURL(croppedFile);
        }
      } catch (error) {
        console.error("Erro ao cortar imagem", error);
        alert("Erro ao processar imagem.");
      }
    }
  };

  // 3. Publicar
  const handlePublish = async () => {
    if (!appId) return;
    // Validação simples (remove tags HTML vazias para checar se tem texto)
    const cleanText = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (!cleanText && !imageFile) {
      alert('O post precisa ter conteúdo.');
      return;
    }

    try {
      setPublishing(true);
      let finalImageUrl = null;

      if (imageFile) {
        const fileExt = 'jpg';
        const fileName = `${appId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('feed-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('feed-images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const scheduledDateISO = (isScheduled && scheduleDate && scheduleTime)
        ? `${scheduleDate}T${scheduleTime}:00`
        : null;

      const newPost = {
        app_id: appId,
        content: htmlContent, // Salva o HTML gerado pelo editor
        image_url: finalImageUrl,
        status: scheduledDateISO ? 'scheduled' : 'published',
        scheduled_for: scheduledDateISO,
        likes_count: 0,
        comments_count: 0
      };

      const { error } = await supabase.from('feed_posts').insert([newPost]);

      if (error) throw error;

      alert('Sucesso!');
      setHtmlContent(''); // Limpa editor
      setImageFile(null);
      setImagePreview(null);
      setIsScheduled(false);
      setScheduleDate('');
      setScheduleTime('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      await fetchPosts();
      setActiveTab(scheduledDateISO ? 'scheduled' : 'list');

    } catch (err) {
      console.error(err);
      alert('Erro ao publicar.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.postId) return;
    try {
      const { error } = await supabase.from('feed_posts').delete().eq('id', deleteModal.postId);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== deleteModal.postId));
      setScheduled(prev => prev.filter(p => p.id !== deleteModal.postId));
      setDeleteModal({ open: false, postId: null });
    } catch (err) {
      alert('Erro ao excluir.');
    }
  };

  return (
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button onClick={() => navigate('/dashboard/apps')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-wide mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gerenciar Feed</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Publique novidades visualmente ricas.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button onClick={() => setActiveTab('create')} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap", activeTab === 'create' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>Criar Post</button>
        <button onClick={() => setActiveTab('list')} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap", activeTab === 'list' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>Publicados ({posts.length})</button>
        <button onClick={() => setActiveTab('scheduled')} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap", activeTab === 'scheduled' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>Agendados ({scheduled.length})</button>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}

      {!loading && (
        <div className="animate-slide-up">
          {/* === CRIAR POST === */}
          {activeTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">

                {/* EDITOR VISUAL NOVO */}
                <VisualEditor content={htmlContent} onChange={setHtmlContent} />

                {/* Upload Image */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">
                      <ImageIcon className="w-4 h-4" /> Escolher Imagem (Auto-Crop 400px)
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </div>
                  {imagePreview && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                      <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Publicação</h3>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Clock className="w-4 h-4" /> <span>Agendar Post</span></div>
                    <button onClick={() => setIsScheduled(!isScheduled)} className={cn("w-10 h-5 rounded-full relative transition-colors", isScheduled ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700")}>
                      <div className={cn("w-3 h-3 bg-white rounded-full absolute top-1 transition-all shadow-sm", isScheduled ? "left-6" : "left-1")} />
                    </button>
                  </div>

                  {isScheduled && (
                    <div className="space-y-3 animate-fade-in bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-800/30 mb-4">
                      <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-medium focus:outline-none" />
                      <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-medium focus:outline-none" />
                    </div>
                  )}

                  <Button onClick={handlePublish} disabled={publishing} className={cn("w-full text-xs font-bold uppercase tracking-wide", isScheduled ? "bg-orange-500 hover:bg-orange-600" : "bg-brand-blue hover:bg-brand-blue-dark")} leftIcon={publishing ? Loader2 : (isScheduled ? Calendar : Send)}>
                    {publishing ? 'Salvando...' : (isScheduled ? 'Agendar' : 'Publicar Agora')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Listas (Publicados / Agendados) */}
          {(activeTab === 'list' || activeTab === 'scheduled') && (
            <div className="max-w-3xl mx-auto space-y-4">
              {(activeTab === 'list' ? posts : scheduled).length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Nenhum post encontrado.</p>
                </div>
              ) : (
                (activeTab === 'list' ? posts : scheduled).map((post) => (
                  <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all relative">
                    <div className="p-5 pl-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className={cn("px-2 py-0.5 rounded font-bold text-[10px] uppercase", activeTab === 'scheduled' ? "bg-orange-100 text-orange-700" : "bg-blue-50 text-brand-blue")}>
                            {activeTab === 'scheduled' ? 'Agendado' : 'Publicado'}
                          </span>
                          <span>•</span>
                          <span>{new Date(post.scheduled_for || post.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <button onClick={() => setDeleteModal({ open: true, postId: post.id })} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>

                      {/* RENDERIZAÇÃO DO HTML NO DASHBOARD (Preview) */}
                      <div
                        className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />

                      {post.image_url && <img src={post.image_url} alt="Post" className="mt-3 w-40 h-40 object-cover rounded-lg border border-slate-100 dark:border-slate-800" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Delete */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteModal({ open: false, postId: null })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Post?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteModal({ open: false, postId: null })} className="flex-1 py-2 border rounded-lg text-xs font-bold uppercase">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;