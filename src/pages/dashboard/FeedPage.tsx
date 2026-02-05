import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Calendar,
  Clock,
  Trash2,
  Heart,
  MessageCircle,
  Send,
  X,
  Loader2,
  Eraser
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';

// --- TIPO & FUNÇÃO DE CROP (Motor de Imagem) ---
interface PixelCrop { x: number; y: number; width: number; height: number; unit: 'px'; }

async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<File | null> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Tamanho fixo 400x400 para Feed
  canvas.width = 400;
  canvas.height = 400;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY,
    0, 0, 400, 400
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      resolve(new File([blob], 'post_image.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.95);
  });
}

// --- TIPOS ---
interface Post {
  id: string;
  app_id: string;
  content: string; // Agora guarda HTML
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

  // Estados do Editor
  const [htmlContent, setHtmlContent] = useState(''); // HTML do editor
  const editorRef = useRef<HTMLDivElement>(null); // Ref para a div editável

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });

  // 1. CARREGAR POSTS
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

  // 2. LÓGICA DE EDITOR VISUAL (ExecCommand)
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const addLink = () => {
    const url = prompt("Insira a URL do link:");
    if (url) execCmd('createLink', url);
  };

  // 3. PROCESSAMENTO DE IMAGEM (Auto-Crop)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        // Calcula o quadrado central
        const minSide = Math.min(img.width, img.height);
        const crop: PixelCrop = {
          unit: 'px',
          width: minSide,
          height: minSide,
          x: (img.width - minSide) / 2,
          y: (img.height - minSide) / 2
        };

        // Corta e converte
        const croppedFile = await getCroppedImg(img, crop);
        if (croppedFile) {
          setImageFile(croppedFile);
          setImagePreview(URL.createObjectURL(croppedFile));
        }
      };
    }
  };

  // 4. PUBLICAR
  const handlePublish = async () => {
    if (!appId) return;

    // Remove tags HTML para verificar se está vazio
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (!plainText && !imageFile) {
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

      const scheduledDateTime = (isScheduled && scheduleDate && scheduleTime)
        ? `${scheduleDate}T${scheduleTime}:00`
        : null;

      const newPost = {
        app_id: appId,
        content: htmlContent, // Salva o HTML
        image_url: finalImageUrl,
        status: scheduledDateTime ? 'scheduled' : 'published',
        scheduled_for: scheduledDateTime,
        likes_count: 0,
        comments_count: 0,
      };

      const { error } = await supabase.from('feed_posts').insert([newPost]);
      if (error) throw error;

      alert(scheduledDateTime ? 'Post agendado!' : 'Post publicado!');

      // Reset
      setHtmlContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setImageFile(null);
      setImagePreview(null);
      setIsScheduled(false);
      setScheduleDate('');
      setScheduleTime('');

      await fetchPosts();
      setActiveTab(scheduledDateTime ? 'scheduled' : 'list');

    } catch (err: any) {
      console.error('Erro:', err);
      alert('Erro ao publicar.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.postId) return;
    try {
      await supabase.from('feed_posts').delete().eq('id', deleteModal.postId);
      setPosts(prev => prev.filter(p => p.id !== deleteModal.postId));
      setScheduled(prev => prev.filter(p => p.id !== deleteModal.postId));
      setDeleteModal({ open: false, postId: null });
    } catch (err) { alert('Erro ao excluir.'); }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">

      {/* Header (Mantido Original) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button onClick={() => navigate('/dashboard/apps')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-wide mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gerenciar Feed</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Publique novidades e mantenha seus alunos engajados.</p>
        </div>
      </div>

      {/* Tabs (Mantido Original) */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        {['create', 'list', 'scheduled'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t as Tab)}
            className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap", activeTab === t ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            {t === 'create' ? 'Criar Post' : t === 'list' ? `Publicados (${posts.length})` : `Agendados (${scheduled.length})`}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}

      {!loading && (
        <div className="animate-slide-up">
          {activeTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">

                {/* CONTAINER DO EDITOR (Design Premium Original) */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[300px]">

                  {/* Toolbar Funcional (estilizada igual a antiga decorativa) */}
                  <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-t-xl overflow-x-auto">
                    <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
                      <ToolbarBtn onClick={() => execCmd('bold')} icon={<Bold className="w-4 h-4" />} />
                      <ToolbarBtn onClick={() => execCmd('italic')} icon={<Italic className="w-4 h-4" />} />
                      <ToolbarBtn onClick={() => execCmd('underline')} icon={<Underline className="w-4 h-4" />} />
                    </div>
                    <div className="flex gap-1 px-2 border-r border-slate-200 dark:border-slate-700">
                      <ToolbarBtn onClick={() => execCmd('insertUnorderedList')} icon={<List className="w-4 h-4" />} />
                    </div>
                    <div className="flex gap-1 pl-2">
                      <ToolbarBtn onClick={addLink} icon={<LinkIcon className="w-4 h-4" />} />
                      <ToolbarBtn onClick={() => execCmd('removeFormat')} icon={<Eraser className="w-4 h-4" />} />
                    </div>
                  </div>

                  {/* Área Editável (Substitui Textarea) */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                    className="w-full flex-1 p-6 bg-transparent text-slate-900 dark:text-white outline-none leading-relaxed text-sm prose prose-sm max-w-none dark:prose-invert"
                    data-placeholder="Escreva algo incrível..."
                    style={{ minHeight: '150px' }}
                  />

                  {/* Preview Imagem (Mantido Original) */}
                  {imagePreview && (
                    <div className="px-6 pb-6">
                      <div className="relative group inline-block">
                        <img src={imagePreview} alt="Preview" className="w-40 h-40 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm object-cover" />
                        <button
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer com Anexo (Mantido Original) */}
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 rounded-b-xl flex justify-between items-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" /> Anexar Imagem
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </div>
                </div>
              </div>

              {/* Sidebar (Mantido Original) */}
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
                      <div><label className="text-[10px] font-bold text-orange-600 uppercase mb-1 block">Data</label><input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-medium focus:outline-none" /></div>
                      <div><label className="text-[10px] font-bold text-orange-600 uppercase mb-1 block">Hora</label><input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-medium focus:outline-none" /></div>
                    </div>
                  )}

                  <Button onClick={handlePublish} disabled={publishing} className={cn("w-full text-xs font-bold uppercase tracking-wide", isScheduled ? "bg-orange-500 hover:bg-orange-600" : "bg-brand-blue hover:bg-brand-blue-dark")} leftIcon={publishing ? Loader2 : (isScheduled ? Calendar : Send)}>
                    {publishing ? 'Salvando...' : (isScheduled ? 'Agendar Post' : 'Publicar Agora')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* LISTA DE POSTS (Atualizada para renderizar HTML) */}
          {(activeTab === 'list' || activeTab === 'scheduled') && (
            <div className="max-w-3xl mx-auto space-y-4">
              {(activeTab === 'list' ? posts : scheduled).length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Nenhum post encontrado nesta seção.</p>
                </div>
              ) : (
                (activeTab === 'list' ? posts : scheduled).map((post) => (
                  <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all relative group">
                    {activeTab === 'scheduled' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>}
                    <div className="p-5 pl-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className={cn("px-2 py-0.5 rounded font-bold text-[10px] uppercase", activeTab === 'scheduled' ? "bg-orange-100 text-orange-700" : "bg-blue-50 text-brand-blue")}>{activeTab === 'scheduled' ? 'Agendado' : 'Publicado'}</span>
                          <span>•</span>
                          <span>{formatDate(post.scheduled_for || post.created_at)}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setDeleteModal({ open: true, postId: post.id })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>

                      {/* RENDERIZADOR HTML (Mantendo o estilo do seu card) */}
                      <div
                        className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-2 prose-li:my-0"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />

                      {post.image_url && (
                        <div className="mt-3">
                          <img src={post.image_url} alt="Post" className="w-full h-64 object-cover rounded-lg border border-slate-100 dark:border-slate-800" />
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes_count}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments_count}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Exclusão (Mantido Original) */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteModal({ open: false, postId: null })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-slide-up border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Post?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, postId: null })} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase transition-colors shadow-md">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente botão da toolbar (para não repetir código)
const ToolbarBtn = ({ onClick, icon }: { onClick: () => void, icon: React.ReactNode }) => (
  <button
    onClick={(e) => { e.preventDefault(); onClick(); }}
    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
  >
    {icon}
  </button>
);

export default FeedPage;