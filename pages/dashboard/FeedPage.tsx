import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  AlignLeft,
  Link as LinkIcon,
  Type,
  Image as ImageIcon,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Heart,
  MessageCircle,
  Send,
  X,
  Upload,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Tipos
interface Post {
  id: string;
  content: string;
  image: string | null;
  createdAt: string;
  scheduledFor: string | null;
  status: 'published' | 'scheduled' | 'draft';
  likes: number;
  comments: number;
}

// Mock de posts iniciais
const initialPosts: Post[] = [
  {
    id: '1',
    content: '🎉 Novidade! Acabamos de liberar o módulo 3 do curso. Aproveitem e bons estudos!',
    image: null,
    createdAt: '2025-04-14T10:30:00',
    scheduledFor: null,
    status: 'published',
    likes: 24,
    comments: 5
  },
  {
    id: '2',
    content: '📚 Dica do dia: Revise sempre o conteúdo anterior antes de avançar. Isso ajuda na fixação!',
    image: null,
    createdAt: '2025-04-12T15:00:00',
    scheduledFor: null,
    status: 'published',
    likes: 18,
    comments: 3
  }
];

const initialScheduledPosts: Post[] = [
  {
    id: '3',
    content: '🚀 Prepare-se! Amanhã teremos uma live exclusiva sobre estratégias avançadas.',
    image: null,
    createdAt: '2025-04-14T09:00:00',
    scheduledFor: '2025-04-16T19:00:00',
    status: 'scheduled',
    likes: 0,
    comments: 0
  }
];

type Tab = 'create' | 'list' | 'scheduled';

const FeedPage: React.FC = () => {
  const { appId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [scheduled, setScheduled] = useState<Post[]>(initialScheduledPosts);

  // Estado do formulário
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Ref para upload de imagem
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado de exclusão
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null; type: 'post' | 'scheduled' }>({
    open: false,
    postId: null,
    type: 'post'
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!content.trim()) {
      alert('Digite o conteúdo do post');
      return;
    }

    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      image,
      createdAt: new Date().toISOString(),
      scheduledFor: isScheduled ? `${scheduleDate}T${scheduleTime}:00` : null,
      status: isScheduled ? 'scheduled' : 'published',
      likes: 0,
      comments: 0
    };

    if (isScheduled) {
      if (!scheduleDate || !scheduleTime) {
        alert('Preencha a data e hora do agendamento');
        return;
      }
      setScheduled([newPost, ...scheduled]);
      alert('Post agendado com sucesso!');
    } else {
      setPosts([newPost, ...posts]);
      alert('Post publicado com sucesso!');
    }

    // Limpar formulário
    setContent('');
    setImage(null);
    setIsScheduled(false);
    setScheduleDate('');
    setScheduleTime('');
    setActiveTab(isScheduled ? 'scheduled' : 'list');
  };

  const handleDelete = () => {
    if (!deleteModal.postId) return;

    if (deleteModal.type === 'post') {
      setPosts(posts.filter(p => p.id !== deleteModal.postId));
    } else {
      setScheduled(scheduled.filter(p => p.id !== deleteModal.postId));
    }

    setDeleteModal({ open: false, postId: null, type: 'post' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-10 font-['Inter'] pb-20">
      {/* Header */}
      <div className="space-y-3 animate-slide-up">
        <button
          onClick={() => navigate('/dashboard/apps')}
          className="group inline-flex items-center gap-2 text-slate-400 hover:text-brand-blue font-black uppercase tracking-widest text-[10px] transition-all"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-brand-blue transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Voltar para Meus Apps
        </button>
        <h1 className="text-3xl font-black text-brand-blue tracking-tighter">Gerenciar Feed</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
          Mantenha seus alunos engajados com atualizações em tempo real. Crie posts oficiais, novidades e avisos que aparecem direto no aplicativo.
        </p>
      </div>

      {/* Tabs Design */}
      <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center w-fit animate-slide-up overflow-x-auto max-w-full no-scrollbar" style={{ animationDelay: '50ms' }}>
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            "px-6 md:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
            activeTab === 'create' ? "bg-slate-900 dark:bg-slate-700 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          Criar Post
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "px-6 md:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
            activeTab === 'list' ? "bg-slate-900 dark:bg-slate-700 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          Lista de Posts
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={cn(
            "px-6 md:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'scheduled' ? "bg-slate-900 dark:bg-slate-700 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          <Calendar className="w-4 h-4 hidden sm:block" />
          Agendados
        </button>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        {/* Tab: Criar Post */}
        {activeTab === 'create' && (
          <div className="space-y-8 max-w-4xl">
            {/* Editor de Conteúdo */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden isolate">
              <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Conteúdo do Post</label>

                {/* Toolbar Fake / Estilizada */}
                <div className="flex flex-wrap gap-2 mb-4 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"><Bold size={18} /></button>
                  <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"><Italic size={18} /></button>
                  <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"><Underline size={18} /></button>
                  <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white hidden sm:block"><Strikethrough size={18} /></button>
                  <div className="w-px h-6 bg-slate-100 dark:bg-slate-700 mx-1 self-center hidden sm:block" />
                  <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"><List size={18} /></button>
                  <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white hidden sm:block"><AlignLeft size={18} /></button>
                  <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white ml-auto"><LinkIcon size={18} /></button>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="O que você quer contar para seus alunos hoje?"
                  rows={8}
                  className="w-full p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-[2rem] focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all resize-none"
                />
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* Upload de Imagem */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Imagem de Destaque (Opcional)</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-slate-100 dark:border-slate-700 rounded-[2rem] p-8 md:p-12 text-center hover:border-brand-blue hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {image ? (
                      <div className="relative group/image">
                        <img src={image} alt="Preview" className="mx-auto max-h-64 object-contain rounded-xl shadow-lg" />
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                          <p className="text-white font-bold text-xs">Trocar Imagem</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 md:w-12 md:h-12 text-slate-200 dark:text-slate-600 mx-auto mb-4 group-hover:scale-110 group-hover:text-brand-blue transition-all" />
                        <p className="text-slate-900 dark:text-white font-black tracking-tight text-base md:text-lg">Arraste uma imagem ou clique aqui</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-2 uppercase tracking-widest leading-loose">Recomendado: 1280x720 (16:9)</p>
                      </>
                    )}
                  </div>
                  {image && (
                    <button
                      onClick={() => setImage(null)}
                      className="mt-3 text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remover imagem
                    </button>
                  )}
                </div>

                {/* Bloco de Agendamento */}
                <div className={cn(
                  "overflow-hidden rounded-[2rem] transition-all duration-300 border",
                  isScheduled
                    ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50 shadow-sm shadow-orange-500/10"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                )}>
                  {/* Toggle */}
                  <div
                    className={cn(
                      "p-6 cursor-pointer select-none transition-colors",
                      isScheduled ? "bg-orange-100/70 dark:bg-orange-900/30" : ""
                    )}
                    onClick={() => setIsScheduled(!isScheduled)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={cn(
                          "w-12 h-6 rounded-full transition-colors",
                          isScheduled ? "bg-orange-500" : "bg-slate-300 dark:bg-slate-600"
                        )}></div>
                        <div className={cn(
                          "absolute inset-y-0 left-1 my-auto w-4 h-4 bg-white dark:bg-slate-800 rounded-full transition-transform shadow-sm",
                          isScheduled ? "translate-x-6" : ""
                        )}></div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-2">
                          <Calendar className={cn(
                            "w-5 h-5",
                            isScheduled ? "text-orange-600 dark:text-orange-400" : "text-slate-500 dark:text-slate-400"
                          )} />
                          <span className={cn(
                            "text-sm font-black uppercase tracking-tight",
                            isScheduled ? "text-orange-900 dark:text-orange-300" : "text-slate-700 dark:text-slate-300"
                          )}>
                            Agendar publicação
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">para data futura</span>
                      </div>
                    </div>
                  </div>

                  {/* Campos de Data/Hora - FIX: overflow-hidden + max-w-full + min-w-0 */}
                  {isScheduled && (
                    <div className="p-6 space-y-6 animate-slide-up overflow-hidden">
                      {/* Container do input de Data */}
                      <div className="space-y-2 min-w-0 overflow-hidden">
                        <label className="block text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">
                          DATA DA PUBLICAÇÃO
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="w-full px-4 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-orange-300 dark:border-orange-700/50 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none font-bold transition-all text-sm appearance-none"
                            style={{
                              boxSizing: 'border-box',
                              minHeight: '56px',
                              paddingRight: '48px'
                            }}
                          />
                          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
                        </div>
                      </div>

                      {/* Container do input de Horário */}
                      <div className="space-y-2 min-w-0 overflow-hidden">
                        <label className="block text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">
                          HORÁRIO
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full px-4 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-orange-300 dark:border-orange-700/50 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none font-bold transition-all text-sm appearance-none"
                            style={{
                              boxSizing: 'border-box',
                              minHeight: '56px',
                              paddingRight: '48px'
                            }}
                          />
                          <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
                        </div>
                      </div>

                      {/* Info box */}
                      <div className="bg-orange-100/60 dark:bg-orange-900/30 p-4 rounded-xl flex items-start gap-3 border border-orange-200 dark:border-orange-800/40">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-orange-800 dark:text-orange-300 font-medium leading-relaxed">
                          O post será publicado automaticamente no feed no horário de Brasília.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 md:p-8 border-t border-slate-50 dark:border-slate-700 bg-slate-50/20 dark:bg-slate-900/20 flex justify-end">
                  <Button
                    onClick={handlePublish}
                    className={cn(
                      "h-14 md:h-16 w-full md:w-auto px-12 font-black uppercase tracking-widest text-sm shadow-xl transition-all",
                      isScheduled
                        ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
                        : "bg-brand-blue hover:bg-brand-blue-dark shadow-blue-500/20"
                    )}
                    leftIcon={isScheduled ? Clock : Send}
                  >
                    {isScheduled ? 'Agendar Post' : 'Publicar Agora'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Lista de Posts */}
        {activeTab === 'list' && (
          <div className="space-y-6 max-w-4xl">
            {posts.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-16 text-center shadow-sm">
                <p className="text-slate-400 font-bold">Nenhum post publicado ainda.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(post.createdAt)}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 font-bold leading-relaxed whitespace-pre-wrap text-base md:text-lg">{post.content}</p>

                      {post.image && (
                        <img src={post.image} alt="Post content" className="w-full h-48 object-cover rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700" />
                      )}

                      <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                          <Heart className="w-4 h-4 text-red-400" />
                          {post.likes} Curtidas
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          {post.comments} Comentários
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 border-t border-slate-100 dark:border-slate-700 md:border-t-0 pt-4 md:pt-0 justify-end md:justify-start">
                      <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Edit3 size={20} /></button>
                      <button
                        onClick={() => setDeleteModal({ open: true, postId: post.id, type: 'post' })}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Posts Agendados */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6 max-w-4xl">
            {scheduled.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-16 text-center shadow-sm">
                <Calendar className="w-16 h-16 text-slate-100 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Nenhum post agendado no momento.</p>
              </div>
            ) : (
              scheduled.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-800 rounded-[2rem] border border-orange-100/50 dark:border-orange-900/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="absolute top-0 left-0 w-2 h-full bg-orange-400"></div>
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-orange-100 dark:border-orange-900/30">
                          <Clock className="w-3 h-3" />
                          Agendado
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          para {formatScheduledDate(post.scheduledFor!)}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 font-bold leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      {post.image && (
                        <img src={post.image} alt="Scheduled post" className="w-full h-32 object-cover rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 opacity-80" />
                      )}
                    </div>

                    <div className="flex items-start gap-2 border-t border-slate-100 dark:border-slate-700 md:border-t-0 pt-4 md:pt-0 justify-end md:justify-start">
                      <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"><Edit3 size={20} /></button>
                      <button
                        onClick={() => setDeleteModal({ open: true, postId: post.id, type: 'scheduled' })}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de Exclusão */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setDeleteModal({ open: false, postId: null, type: 'post' })}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Excluir este post?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-10 font-medium leading-relaxed">
              Você está prestes a remover permanentemente este conteúdo do feed. Esta ação não poderá ser revertida.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 transition-all active:scale-95"
              >
                Sim, excluir permanentemente
              </button>
              <button
                onClick={() => setDeleteModal({ open: false, postId: null, type: 'post' })}
                className="w-full py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Cancelar e Manter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default FeedPage;