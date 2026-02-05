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
  Edit3,
  Heart,
  MessageCircle,
  Send,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';

// Tipos baseados na sua tabela real
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
  const { appId } = useParams(); // ID do App vindo da URL
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [posts, setPosts] = useState<Post[]>([]);
  const [scheduled, setScheduled] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Formulário
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Refs para manipulação do DOM
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Modal de Exclusão
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null }>({
    open: false,
    postId: null
  });

  // --- LÓGICA DE FORMATAÇÃO DE TEXTO ---
  const applyFormat = (type: 'bold' | 'italic' | 'underline' | 'list' | 'link') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let formatted = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        formatted = `**${selectedText || 'texto'}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        formatted = `*${selectedText || 'texto'}*`;
        cursorOffset = 1;
        break;
      case 'underline':
        formatted = `__${selectedText || 'texto'}__`;
        cursorOffset = 2;
        break;
      case 'list':
        formatted = `\n• ${selectedText || 'item'}`;
        cursorOffset = 3;
        break;
      case 'link':
        formatted = `[${selectedText || 'texto do link'}](https://)`;
        cursorOffset = 1;
        break;
    }

    const newContent = text.substring(0, start) + formatted + text.substring(end);
    setContent(newContent);

    // Devolve o foco e seleciona o texto inserido para facilitar edição
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset + (selectedText.length || (type === 'link' ? 13 : 4)));
    }, 0);
  };

  // 1. CARREGAR POSTS DO SUPABASE
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

  useEffect(() => {
    fetchPosts();
  }, [appId]);

  // 2. PREVIEW DE IMAGEM
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 3. PUBLICAR OU AGENDAR
  const handlePublish = async () => {
    if (!appId) return;

    if (!content.trim() && !imageFile) {
      alert('O post precisa ter pelo menos texto ou uma imagem.');
      return;
    }

    try {
      setPublishing(true);
      let finalImageUrl = null;

      // A) Upload da Imagem
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${appId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('feed-images') // Certifique-se de ter criado este bucket
          .upload(filePath, imageFile);

        if (uploadError) throw new Error('Falha ao enviar imagem. Verifique o bucket "feed-images".');

        const { data: { publicUrl } } = supabase.storage
          .from('feed-images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      // B) Preparar Dados
      const scheduledDateTime = (isScheduled && scheduleDate && scheduleTime)
        ? `${scheduleDate}T${scheduleTime}:00`
        : null;

      const newPost = {
        app_id: appId,
        content: content,
        image_url: finalImageUrl,
        status: scheduledDateTime ? 'scheduled' : 'published',
        scheduled_for: scheduledDateTime,
        likes_count: 0,
        comments_count: 0,
      };

      // C) Salvar no Banco
      const { error } = await supabase.from('feed_posts').insert([newPost]);

      if (error) throw error;

      alert(scheduledDateTime ? 'Post agendado!' : 'Post publicado!');

      // D) Limpar tudo
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setIsScheduled(false);
      setScheduleDate('');
      setScheduleTime('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // E) Recarregar lista
      await fetchPosts();
      setActiveTab(scheduledDateTime ? 'scheduled' : 'list');

    } catch (err: any) {
      console.error('Erro ao publicar:', err);
      alert(err.message || 'Erro ao salvar post.');
    } finally {
      setPublishing(false);
    }
  };

  // 4. DELETAR POST
  const handleDelete = async () => {
    if (!deleteModal.postId) return;
    try {
      const { error } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', deleteModal.postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== deleteModal.postId));
      setScheduled(prev => prev.filter(p => p.id !== deleteModal.postId));
      setDeleteModal({ open: false, postId: null });

    } catch (err) {
      console.error('Erro ao deletar:', err);
      alert('Erro ao excluir post.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard/apps')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-wide mb-2 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gerenciar Feed</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Publique novidades e mantenha seus alunos engajados.</p>
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
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[300px]">

                  {/* BARRA DE FERRAMENTAS FUNCIONAL */}
                  <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-t-xl">
                    <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
                      <button onClick={() => applyFormat('bold')} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all" title="Negrito"><Bold className="w-4 h-4" /></button>
                      <button onClick={() => applyFormat('italic')} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all" title="Itálico"><Italic className="w-4 h-4" /></button>
                      <button onClick={() => applyFormat('underline')} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all" title="Sublinhado"><Underline className="w-4 h-4" /></button>
                    </div>
                    <div className="flex gap-1 pl-2">
                      <button onClick={() => applyFormat('list')} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all" title="Lista"><List className="w-4 h-4" /></button>
                      <button onClick={() => applyFormat('link')} className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all" title="Link"><LinkIcon className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escreva algo incrível para seus alunos... (Use a barra acima para formatar)"
                    className="w-full flex-1 p-6 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 resize-none outline-none leading-relaxed text-sm"
                  />

                  {imagePreview && (
                    <div className="px-6 pb-6">
                      <div className="relative group inline-block">
                        <img src={imagePreview} alt="Preview" className="max-h-60 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm object-cover" />
                        <button
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

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

              {/* Sidebar Configurações */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                    Publicação
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Clock className="w-4 h-4" /> <span>Agendar Post</span>
                    </div>
                    <button
                      onClick={() => setIsScheduled(!isScheduled)}
                      className={cn("w-10 h-5 rounded-full relative transition-colors", isScheduled ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700")}
                    >
                      <div className={cn("w-3 h-3 bg-white rounded-full absolute top-1 transition-all shadow-sm", isScheduled ? "left-6" : "left-1")} />
                    </button>
                  </div>

                  {isScheduled && (
                    <div className="space-y-3 animate-fade-in bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-800/30 mb-4">
                      <div>
                        <label className="text-[10px] font-bold text-orange-600 uppercase mb-1 block">Data</label>
                        <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-medium focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-orange-600 uppercase mb-1 block">Hora</label>
                        <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-medium focus:outline-none" />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handlePublish}
                    disabled={publishing}
                    className={cn("w-full text-xs font-bold uppercase tracking-wide", isScheduled ? "bg-orange-500 hover:bg-orange-600" : "bg-brand-blue hover:bg-brand-blue-dark")}
                    leftIcon={publishing ? Loader2 : (isScheduled ? Calendar : Send)}
                  >
                    {publishing ? 'Salvando...' : (isScheduled ? 'Agendar' : 'Publicar Agora')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* === LISTA DE POSTS === */}
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
                          {activeTab === 'scheduled' ? (
                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wide rounded">Agendado</span>
                          ) : (
                            <span className="font-bold text-brand-blue bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">Publicado</span>
                          )}
                          <span>•</span>
                          <span>{formatDate(post.scheduled_for || post.created_at)}</span>
                        </div>
                        <button onClick={() => setDeleteModal({ open: true, postId: post.id })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* PREVIEW DO CONTEÚDO (Sem renderizar formatação complexa aqui, só texto) */}
                      <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                      {post.image_url && (
                        <div className="mt-3">
                          <img src={post.image_url} alt="Post" className="w-full h-48 object-cover rounded-lg border border-slate-100 dark:border-slate-800" />
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

      {/* Modal de Exclusão */}
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

export default FeedPage;