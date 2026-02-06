import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bold, Italic, Underline, List, Link as LinkIcon,
  Image as ImageIcon, Calendar, Clock, Trash2, Heart, MessageCircle,
  Send, X, Loader2, Eraser
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';
// Importação do NOVO MODAL
import ImageCropperModal from '../../components/modals/ImageCropperModal';

// --- Interfaces ---
interface Post {
  id: string;
  app_id: string;
  content: string;
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

  // Editor States
  const [htmlContent, setHtmlContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, unorderedList: false });

  // Image States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Crop Modal States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

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
      const { data, error } = await supabase.from('feed_posts').select('*').eq('app_id', appId).order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setPosts(data.filter(p => p.status === 'published'));
        setScheduled(data.filter(p => p.status === 'scheduled'));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchPosts(); }, [appId]);

  // 2. DETECTOR DE FORMATAÇÃO
  const checkFormats = () => {
    if (!document) return;
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
    });
  };
  useEffect(() => {
    document.addEventListener('selectionchange', checkFormats);
    return () => document.removeEventListener('selectionchange', checkFormats);
  }, []);

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
      editorRef.current.focus();
      checkFormats();
    }
  };

  // 3. FLUXO DE IMAGEM
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result as string);
        setCropModalOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    setCropModalOpen(false);
    setTempImageSrc(null);
  };

  // 4. PUBLICAR
  const handlePublish = async () => {
    if (!appId) return;
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (!plainText && !imageFile) { alert('Adicione texto ou imagem.'); return; }

    try {
      setPublishing(true);
      let finalImageUrl = null;

      if (imageFile) {
        const fileExt = 'jpg';
        const fileName = `${appId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('feed-images').upload(fileName, imageFile, { contentType: 'image/jpeg' });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('feed-images').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      const scheduledFor = (isScheduled && scheduleDate && scheduleTime) ? `${scheduleDate}T${scheduleTime}:00` : null;
      const newPost = {
        app_id: appId,
        content: htmlContent,
        image_url: finalImageUrl,
        status: scheduledFor ? 'scheduled' : 'published',
        scheduled_for: scheduledFor,
        likes_count: 0, comments_count: 0
      };

      const { error } = await supabase.from('feed_posts').insert([newPost]);
      if (error) throw error;

      alert(scheduledFor ? 'Agendado!' : 'Publicado!');
      setHtmlContent(''); if (editorRef.current) editorRef.current.innerHTML = '';
      setImageFile(null); setImagePreview(null); setIsScheduled(false); setScheduleDate(''); setScheduleTime('');

      await fetchPosts();
      setActiveTab(scheduledFor ? 'scheduled' : 'list');
    } catch (err) { console.error(err); alert('Erro ao publicar.'); } finally { setPublishing(false); }
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

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">

      {/* --- MODAL DE CROP --- */}
      {cropModalOpen && tempImageSrc && (
        <ImageCropperModal
          imageSrc={tempImageSrc}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button onClick={() => navigate('/dashboard/apps')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-wide mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gerenciar Feed</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Publique novidades e mantenha seus alunos engajados.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        {['create', 'list', 'scheduled'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as Tab)} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all", activeTab === t ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900")}>
            {t === 'create' ? 'Criar Post' : t === 'list' ? `Publicados (${posts.length})` : `Agendados (${scheduled.length})`}
          </button>
        ))}
      </div>

      {!loading && activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          <div className="lg:col-span-2 space-y-6">
            {/* EDITOR */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[300px]">
              <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-t-xl overflow-x-auto">
                <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
                  <ToolbarBtn isActive={activeFormats.bold} onClick={() => execCmd('bold')} icon={<Bold className="w-4 h-4" />} />
                  <ToolbarBtn isActive={activeFormats.italic} onClick={() => execCmd('italic')} icon={<Italic className="w-4 h-4" />} />
                  <ToolbarBtn isActive={activeFormats.underline} onClick={() => execCmd('underline')} icon={<Underline className="w-4 h-4" />} />
                </div>
                <div className="flex gap-1 px-2 border-r border-slate-200 dark:border-slate-700">
                  <ToolbarBtn isActive={activeFormats.unorderedList} onClick={() => execCmd('insertUnorderedList')} icon={<List className="w-4 h-4" />} />
                </div>
                <div className="flex gap-1 pl-2">
                  <ToolbarBtn onClick={() => { const u = prompt('URL:'); if (u) execCmd('createLink', u) }} icon={<LinkIcon className="w-4 h-4" />} />
                  <ToolbarBtn onClick={() => execCmd('removeFormat')} icon={<Eraser className="w-4 h-4" />} />
                </div>
              </div>

              <div
                ref={editorRef} contentEditable
                onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                onKeyUp={checkFormats} onClick={checkFormats}
                className="w-full flex-1 p-6 outline-none text-sm prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-5"
                data-placeholder="Escreva..."
              />

              {imagePreview && (
                <div className="px-6 pb-6">
                  <div className="relative group inline-block">
                    <img src={imagePreview} className="w-40 h-40 rounded-lg border border-slate-200 dark:border-slate-700 object-cover" />
                    <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              )}

              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 rounded-b-xl">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue rounded-lg transition-colors">
                  <ImageIcon className="w-4 h-4" /> Anexar Imagem
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-4 border-b pb-2">Publicação</h3>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"><Clock className="w-4 h-4" /><span>Agendar</span></div>
                <button onClick={() => setIsScheduled(!isScheduled)} className={cn("w-10 h-5 rounded-full relative transition-colors", isScheduled ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700")}>
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-1 transition-all", isScheduled ? "left-6" : "left-1")} />
                </button>
              </div>
              {isScheduled && (
                <div className="space-y-3 mb-4 animate-fade-in bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100">
                  <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full p-2 rounded border text-xs dark:bg-slate-800 dark:border-slate-700" />
                  <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full p-2 rounded border text-xs dark:bg-slate-800 dark:border-slate-700" />
                </div>
              )}
              <Button onClick={handlePublish} disabled={publishing} className={cn("w-full text-xs font-bold uppercase", isScheduled ? "bg-orange-500" : "bg-brand-blue")} leftIcon={publishing ? Loader2 : Send}>
                {publishing ? 'Salvando...' : isScheduled ? 'Agendar' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LISTA DE POSTS */}
      {(activeTab === 'list' || activeTab === 'scheduled') && (
        <div className="max-w-3xl mx-auto space-y-4">
          {(activeTab === 'list' ? posts : scheduled).length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Nenhum post encontrado.</p>
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
                  <div
                    className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-5"
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

      {/* Modal de Exclusão */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteModal({ open: false, postId: null })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-slide-up border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Post?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, postId: null })} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolbarBtn = ({ onClick, icon, isActive }: any) => (
  <button onClick={(e) => { e.preventDefault(); onClick(); }} className={cn("p-1.5 rounded transition-all", isActive ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-inner" : "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800")}>{icon}</button>
);

export default FeedPage;