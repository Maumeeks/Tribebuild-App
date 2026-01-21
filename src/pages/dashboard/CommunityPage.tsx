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
  Image as ImageIcon,
  User,
  Upload,
  Trash2,
  Edit3,
  Heart,
  MessageCircle,
  Send,
  X,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Tipos
interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  image: string | null;
  createdAt: string;
  likes: number;
  comments: number;
}

// Mock de posts
const initialPosts: CommunityPost[] = [
  {
    id: '1',
    authorName: 'Maria Mendonça',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    content: 'Estou amando o app, valeu muito o investimento... amei ainda mais o dog IA tô fazendo uns videozinhos muito fofos do tobby! 😍',
    image: null,
    createdAt: '2025-04-14T18:24:00',
    likes: 12,
    comments: 3
  },
  {
    id: '2',
    authorName: 'João Silva',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=João',
    content: 'Alguém mais conseguiu aplicar a técnica do módulo 2? Tive resultados incríveis em apenas 3 dias! 🚀',
    image: null,
    createdAt: '2025-04-13T10:15:00',
    likes: 24,
    comments: 8
  }
];

type Tab = 'create' | 'list';

const CommunityPage: React.FC = () => {
  const { appId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);

  // Estado do formulário
  const [authorName, setAuthorName] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);

  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);

  // Estado de exclusão
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null }>({
    open: false,
    postId: null
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAuthorAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!authorName.trim()) {
      alert('Digite o nome do autor');
      return;
    }
    if (!content.trim()) {
      alert('Digite o conteúdo do post');
      return;
    }

    const newPost: CommunityPost = {
      id: Math.random().toString(36).substr(2, 9),
      authorName,
      authorAvatar,
      content,
      image,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0
    };

    setPosts([newPost, ...posts]);

    // Limpar
    setAuthorName('');
    setAuthorAvatar(null);
    setContent('');
    setImage(null);

    alert('Post publicado com sucesso!');
    setActiveTab('list');
  };

  const handleDelete = () => {
    if (!deleteModal.postId) return;
    setPosts(posts.filter(p => p.id !== deleteModal.postId));
    setDeleteModal({ open: false, postId: null });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 font-['Inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard/apps')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-wide mb-2 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Comunidade</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie interações e crie posts para engajar sua base.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            "px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
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
            "px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
            activeTab === 'list'
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
          )}
        >
          Feed ({posts.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-slide-up">

        {/* === CREATE POST === */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Coluna Esquerda: Autor */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Autor do Post
                </h3>

                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div
                      onClick={() => avatarInputRef.current?.click()}
                      className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 flex items-center justify-center cursor-pointer transition-all overflow-hidden relative group"
                    >
                      {authorAvatar ? (
                        <>
                          <img src={authorAvatar} alt="Avatar" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit3 className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <User className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Foto</span>
                        </div>
                      )}
                    </div>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    {authorAvatar && (
                      <button onClick={() => setAuthorAvatar(null)} className="mt-2 text-[10px] font-bold text-red-500 hover:underline">Remover</button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Ex: Maria Clara"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Conteúdo */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[400px]">

                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                  <div className="flex gap-1 pr-2 border-r border-slate-100 dark:border-slate-800">
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"><Bold className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"><Italic className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"><Underline className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"><Strikethrough className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-1 pl-2">
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"><List className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all"><AlignLeft className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva algo legal para a comunidade..."
                  className="w-full flex-1 p-6 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 resize-none outline-none leading-relaxed"
                />

                {/* Image Preview & Upload */}
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

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => postImageInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Adicionar Imagem</span>
                    </button>
                    <input ref={postImageInputRef} type="file" accept="image/*" className="hidden" onChange={handlePostImageUpload} />
                  </div>

                  <Button onClick={handlePublish} size="sm" leftIcon={Send} className="text-xs font-bold uppercase tracking-wide">
                    Publicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === LIST POSTS === */}
        {activeTab === 'list' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Nenhuma publicação encontrada.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all">

                  {/* Post Header */}
                  <div className="p-5 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-5 h-5" /></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{post.authorName}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, postId: post.id })}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-5 pb-4">
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    {post.image && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                        <img src={post.image} alt="Post Attachment" className="w-full max-h-96 object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Post Stats */}
                  <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-6">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue transition-colors">
                      <MessageCircle className="w-4 h-4" /> {post.comments}
                    </button>
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteModal({ open: false, postId: null })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-slide-up border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Publicação?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Esta ação é irreversível e removerá o post da comunidade.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, postId: null })} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
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

export default CommunityPage;