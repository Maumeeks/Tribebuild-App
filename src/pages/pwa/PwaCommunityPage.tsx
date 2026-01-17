
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Send,
  X,
  Crown,
  MoreHorizontal,
  Trash2,
  Flag,
  Bell,
  Sparkles,
  Share2
} from 'lucide-react';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

// Mock de dados do app
const mockAppData: Record<string, {
  name: string;
  logo: string | null;
  primaryColor: string;
}> = {
  'academia-fit': {
    name: 'Academia Fit',
    logo: null,
    primaryColor: '#2563EB'
  },
  'curso-ingles': {
    name: 'Curso de Inglês Pro',
    logo: null,
    primaryColor: '#10B981'
  },
  'mentoria-negocios': {
    name: 'Mentoria Negócios',
    logo: null,
    primaryColor: '#8B5CF6'
  }
};

// Mock do usuário atual
const currentUser = {
  id: 'user1',
  name: 'Maria Silva',
  avatar: null
};

// Tipo para post da comunidade
interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  isAdmin: boolean;
  content: string;
  image: string | null;
  likes: number;
  comments: number;
  liked: boolean;
  createdAt: string;
}

// Mock de posts iniciais
const initialPosts: CommunityPost[] = [
  {
    id: '1',
    authorId: 'user1',
    authorName: 'Maria Silva',
    authorAvatar: null,
    isAdmin: false,
    content: 'Gente, finalizei o módulo 2! Muito bom! 💪\n\nOs exercícios são desafiadores mas dá pra fazer. Quem mais já chegou lá?',
    image: null,
    likes: 12,
    comments: 4,
    liked: false,
    createdAt: '2025-04-26T14:30:00'
  },
  {
    id: '2',
    authorId: 'user2',
    authorName: 'João Santos',
    authorAvatar: null,
    isAdmin: false,
    content: 'Alguém mais sentiu dificuldade no exercício 3 da aula 5? Estou travado nessa parte há 2 dias. 😅',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    likes: 8,
    comments: 15,
    liked: true,
    createdAt: '2025-04-26T12:00:00'
  },
  {
    id: '3',
    authorId: 'admin',
    authorName: 'Academia Fit',
    authorAvatar: null,
    isAdmin: true,
    content: '🎉 Bem-vindos à comunidade!\n\nUsem esse espaço para trocar experiências, tirar dúvidas e se motivarem mutuamente.\n\nRegras:\n• Respeito sempre\n• Sem spam\n• Ajude os colegas\n\nBora treinar! 💪',
    image: null,
    likes: 56,
    comments: 23,
    liked: true,
    createdAt: '2025-04-25T10:00:00'
  }
];

export default function PwaCommunityPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Buscar dados do app
  const appData = appSlug ? mockAppData[appSlug] : null;

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center ">
        <div className="space-y-4 animate-pulse">
           <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Carregando Comunidade...</p>
        </div>
      </div>
    );
  }

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleSelectImage = () => {
    // Mock upload
    const mockImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800';
    setNewPostImage(mockImage);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    setTimeout(() => {
      const newPost: CommunityPost = {
        id: Math.random().toString(36).substr(2, 9),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        isAdmin: false,
        content: newPostContent,
        image: newPostImage,
        likes: 0,
        comments: 0,
        liked: false,
        createdAt: new Date().toISOString()
      };

      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setNewPostImage(null);
      setIsPosting(false);
    }, 800);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      setPosts(posts.filter(p => p.id !== postId));
    }
    setMenuOpenId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 ">
      {/* Header Premium */}
      <header 
        className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg"
        style={{ 
            backgroundColor: appData.primaryColor,
            boxShadow: `0 4px 20px ${appData.primaryColor}20` 
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
             <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-base tracking-tight leading-none">Comunidade</h1>
            <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mt-0.5">Espaço de Interação</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-colors">
          <Bell className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="p-6 space-y-6 animate-slide-up">
        
        {/* Criar Post - Tribe Premium Style */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm shadow-slate-200/50">
          <div className="flex gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg flex-shrink-0"
              style={{ backgroundColor: appData.primaryColor }}
            >
              {currentUser.name.charAt(0)}
            </div>

            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="O que você quer compartilhar com a galera?"
                rows={2}
                className="w-full px-0 py-2 bg-transparent text-slate-800 placeholder-slate-400 resize-none focus:outline-none font-medium leading-relaxed"
              />

              {newPostImage && (
                <div className="relative mt-4 group">
                  <img 
                    src={newPostImage} 
                    alt="Preview" 
                    className="w-full rounded-[1.5rem] max-h-48 object-cover border border-slate-100 shadow-md"
                  />
                  <button
                    onClick={() => setNewPostImage(null)}
                    className="absolute top-3 right-3 w-8 h-8 bg-slate-900/80 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-slate-900 transition-all shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-50">
                <button
                  onClick={handleSelectImage}
                  className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-xl transition-all"
                >
                  <ImageIcon size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Foto</span>
                </button>

                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || isPosting}
                  className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] text-white transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95"
                  style={{ 
                    backgroundColor: appData.primaryColor,
                    boxShadow: !isPosting && newPostContent.trim() ? `0 8px 15px ${appData.primaryColor}30` : 'none'
                  }}
                >
                  {isPosting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Publicar
                      <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Posts Interativos */}
        <div className="space-y-6">
            {posts.map((post, idx) => (
            <article 
                key={post.id}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
            >
                {/* Header do Post */}
                <div className="p-6 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div 
                        className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg",
                            post.isAdmin ? "bg-amber-400 shadow-amber-400/20" : "bg-slate-100 text-slate-400"
                        )}
                        style={!post.isAdmin ? { backgroundColor: `${appData.primaryColor}10`, color: appData.primaryColor } : {}}
                    >
                        {post.authorAvatar ? (
                            <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            post.authorName.charAt(0)
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-black text-slate-900 tracking-tight leading-none">{post.authorName}</p>
                            {post.isAdmin && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded-lg border border-amber-100">
                                    <Crown size={10} />
                                    Admin
                                </span>
                            )}
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{formatRelativeTime(post.createdAt)}</p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                        className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {menuOpenId === post.id && (
                        <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-slide-up origin-top-right overflow-hidden">
                            {post.authorId === currentUser.id ? (
                            <button
                                onClick={() => handleDeletePost(post.id)}
                                className="flex items-center gap-3 w-full px-5 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                            >
                                <Trash2 size={16} />
                                Excluir Post
                            </button>
                            ) : (
                            <button
                                onClick={() => {
                                    alert('Post denunciado com sucesso.');
                                    setMenuOpenId(null);
                                }}
                                className="flex items-center gap-3 w-full px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                <Flag size={16} />
                                Denunciar
                            </button>
                            )}
                        </div>
                        </>
                    )}
                </div>
                </div>

                <div className="px-6 pb-6">
                <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-line">{post.content}</p>
                </div>

                {post.image && (
                <div className="px-6 pb-6">
                    <div className="rounded-[1.5rem] overflow-hidden shadow-inner border border-slate-100">
                        <img 
                        src={post.image} 
                        alt="Post"
                        className="w-full h-auto max-h-96 object-cover"
                        />
                    </div>
                </div>
                )}

                <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => handleLike(post.id)}
                            className="flex items-center gap-2.5 transition-all active:scale-90 group"
                        >
                            <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                                post.liked ? "bg-red-50 text-red-500 shadow-lg shadow-red-500/10" : "bg-white text-slate-300 border border-slate-100 shadow-sm group-hover:text-red-400 group-hover:border-red-100"
                            )}>
                                <Heart className={cn("w-4 h-4", post.liked && "fill-current")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                post.liked ? "text-red-500" : "text-slate-400"
                            )}>
                                {post.likes}
                            </span>
                        </button>

                        <button
                            onClick={() => alert('Comentários em breve!')}
                            className="flex items-center gap-2.5 group"
                        >
                            <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 shadow-sm transition-all">
                                <MessageCircle className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600">{post.comments}</span>
                        </button>
                    </div>

                    <button className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-600 shadow-sm transition-all active:scale-90">
                        <Share2 size={16} />
                    </button>
                </div>
            </article>
            ))}
        </div>

        {/* Fim do Feed */}
        <div className="text-center py-12 px-6 opacity-30">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">
            Elite Community Interface • Powered by Tribe
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation primaryColor={appData.primaryColor} />
    </div>
  );
}
