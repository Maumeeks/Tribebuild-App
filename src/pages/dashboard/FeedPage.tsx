import React, { useState, useRef } from 'react';
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
  Upload,
  MoreHorizontal,
  CheckCircle2
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
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard/apps')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-wide mb-2 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gerenciar Feed</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Mantenha seus alunos engajados com atualizações.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            "px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap",
            activeTab === 'create'
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
        >
          Criar Post
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap",
            activeTab === 'list'
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
        >
          Publicados ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={cn(
            "px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap flex items-center gap-2",
            activeTab === 'scheduled'
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
        >
          Agendados ({scheduled.length})
        </button>
      </div>

      <div className="animate-slide-up">
        {/* === CREATE POST === */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Coluna Principal: Editor */}
            <div className="lg:col-span-2 space-y-6">

              {/* Editor Container */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[300px]">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto bg-slate-50/50 dark:bg-slate-950/50 rounded-t-xl">
                  <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
                    <button className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all"><Bold className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all"><Italic className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all"><Underline className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-1 pl-2">
                    <button className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all"><List className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all"><LinkIcon className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva algo para seus alunos..."
                  className="w-full flex-1 p-6 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 resize-none outline-none leading-relaxed text-sm"
                />

                {/* Image Preview inside Editor */}
                {image && (
                  <div className="px-6 pb-6">
                    <div className="relative group inline-block">
                      <img src={image} alt="Upload" className="max-h-60 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                      <button
                        onClick={() => setImage(null)}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer: Upload */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 rounded-b-xl flex justify-between items-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Anexar Mídia
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
            </div>

            {/* Coluna Lateral: Configurações */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Publicação
                </h3>

                {/* Toggle Agendamento */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4" />
                    <span>Agendar Post</span>
                  </div>
                  <button
                    onClick={() => setIsScheduled(!isScheduled)}
                    className={cn(
                      "w-10 h-5 rounded-full relative transition-colors",
                      isScheduled ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "w-3 h-3 bg-white rounded-full absolute top-1 transition-all shadow-sm",
                      isScheduled ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>

                {/* Campos de Data (Condicional) */}
                {isScheduled && (
                  <div className="space-y-3 animate-fade-in bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-800/30">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase">Data</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-medium focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase">Horário</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg text-xs font-medium focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>

                <Button
                  onClick={handlePublish}
                  className={cn(
                    "w-full text-xs font-bold uppercase tracking-wide",
                    isScheduled ? "bg-orange-500 hover:bg-orange-600" : "bg-brand-blue hover:bg-brand-blue-dark"
                  )}
                  leftIcon={isScheduled ? Clock : Send}
                >
                  {isScheduled ? 'Agendar' : 'Publicar Agora'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* === LIST POSTS === */}
        {activeTab === 'list' && (
          <div className="max-w-3xl mx-auto space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Nenhum post no feed.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-bold text-brand-blue bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">Admin</span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Edit3 className="w-4 h-4" /></button>
                        <button
                          onClick={() => setDeleteModal({ open: true, postId: post.id, type: 'post' })}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {post.image && (
                      <img src={post.image} alt="Post" className="mt-3 w-full h-48 object-cover rounded-lg border border-slate-100 dark:border-slate-800" />
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-4 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* === SCHEDULED POSTS === */}
        {activeTab === 'scheduled' && (
          <div className="max-w-3xl mx-auto space-y-4">
            {scheduled.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Nenhum post agendado.</p>
              </div>
            ) : (
              scheduled.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-orange-200 dark:border-orange-800/30 shadow-sm overflow-hidden relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                  <div className="p-5 pl-7">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wide rounded">Agendado</span>
                        <span className="text-xs text-slate-500">para {formatScheduledDate(post.scheduledFor!)}</span>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Edit3 className="w-4 h-4" /></button>
                        <button
                          onClick={() => setDeleteModal({ open: true, postId: post.id, type: 'scheduled' })}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de Exclusão */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteModal({ open: false, postId: null, type: 'post' })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-slide-up border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Post?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Esta ação removerá o post permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, postId: null, type: 'post' })} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase transition-colors shadow-md">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;