import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Image as ImageIcon, Send, X, Crown,
  MoreHorizontal, Trash2, Flag, Bell, Sparkles, Share2, Loader2
} from 'lucide-react';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

// Tipos Reais
interface CommunityPost {
  id: string;
  app_id: string;
  author_id: string;
  author_type: 'admin' | 'student';
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  liked?: boolean; // UI Otimista
}

export default function PwaCommunityPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  // Estado de Criação
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Menu e Delete
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 1. Inicialização (Busca App, User e Posts)
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // A. Dados do App
        const { data: app, error: appError } = await supabase
          .from('apps')
          .select('id, name, logo, primary_color')
          .eq('slug', appSlug)
          .single();

        if (appError || !app) throw new Error('App não encontrado');
        setAppData(app);

        // B. Usuário Atual (para saber se pode deletar)
        // Nota: Ajuste conforme seu sistema de auth (clients ou auth.users)
        const { data: { user } } = await supabase.auth.getUser();
        // Se usar tabela 'clients', buscar o ID do client aqui.
        // Por enquanto, usaremos o ID do auth ou um mock se não tiver auth implementado 100% no PWA
        setCurrentUserId(user?.id || 'anon');

        // C. Posts
        const { data: feedData, error: feedError } = await supabase
          .from('community_posts')
          .select('*')
          .eq('app_id', app.id)
          .order('created_at', { ascending: false });

        if (feedError) throw feedError;

        if (feedData) {
          const postsWithLikes = feedData.map(post => ({ ...post, liked: false }));
          setPosts(postsWithLikes);
        }

      } catch (err) {
        console.error('Erro ao carregar comunidade:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug) init();
  }, [appSlug]);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPostImage(file);
      const reader = new FileReader();
      reader.onload = () => setNewPostImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);

    try {
      let finalImageUrl = null;

      // Upload Imagem
      if (newPostImage) {
        const path = `community/${Date.now()}-${newPostImage.name}`;
        await supabase.storage.from('feed-images').upload(path, newPostImage);
        const { data } = supabase.storage.from('feed-images').getPublicUrl(path);
        finalImageUrl = data.publicUrl;
      }

      // Insert Post
      // OBS: Aqui estou assumindo um nome genérico para o aluno. 
      // O ideal é pegar do perfil do aluno logado (tabela clients).
      const newPost = {
        app_id: appData.id,
        author_id: currentUserId || 'student-id',
        author_type: 'student',
        author_name: 'Aluno(a)', // Substituir pelo nome real do aluno
        author_avatar: null,     // Substituir pelo avatar real
        content: newPostContent,
        image_url: finalImageUrl,
        likes_count: 0,
        comments_count: 0
      };

      const { data, error } = await supabase.from('community_posts').insert([newPost]).select().single();

      if (error) throw error;

      // Atualiza feed localmente
      if (data) setPosts([data, ...posts]);

      // Limpa form
      setNewPostContent('');
      setNewPostImage(null);
      setNewPostImagePreview(null);

    } catch (err) {
      console.error(err);
      alert('Erro ao publicar. Verifique sua conexão.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Excluir este post?')) return;
    try {
      await supabase.from('community_posts').delete().eq('id', postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      alert('Erro ao excluir.');
    }
    setMenuOpenId(null);
  };

  // Funções Auxiliares
  const formatRelativeTime = (d: string) => {
    const diff = new Date().getTime() - new Date(d).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `Há ${days} dias`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `Há ${hours}h`;
    return 'Agora mesmo';
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 } : p));
  };

  if (loading || !appData) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-['inter']">

      {/* Header Premium */}
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg transition-colors" style={{ backgroundColor: appData.primaryColor, boxShadow: `0 4px 20px ${appData.primaryColor}30` }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-base tracking-tight leading-none">Comunidade</h1>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">{appData.name}</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-colors border border-white/10">
          <Bell className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6 animate-slide-up">

        {/* Criar Post */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm shadow-slate-200/50">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg flex-shrink-0" style={{ backgroundColor: appData.primaryColor }}>
              A
            </div>
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="O que você quer compartilhar?"
                className="w-full px-0 py-2 bg-transparent text-slate-800 placeholder-slate-400 resize-none focus:outline-none font-medium leading-relaxed"
                rows={2}
              />

              {newPostImagePreview && (
                <div className="relative mt-4 group">
                  <img src={newPostImagePreview} className="w-full rounded-[1.5rem] max-h-48 object-cover border border-slate-100 shadow-md" />
                  <button onClick={() => { setNewPostImage(null); setNewPostImagePreview(null); }} className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur text-white rounded-xl flex items-center justify-center"><X size={16} /></button>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase">
                  <ImageIcon size={16} /> Foto
                </button>
                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleSelectImage} />

                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || isPosting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: appData.primaryColor }}
                >
                  {isPosting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send size={12} /> Publicar</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((post, idx) => (
            <article key={post.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="p-6 pb-4 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg overflow-hidden", post.author_type === 'admin' ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-400")}>
                    {post.author_avatar ? <img src={post.author_avatar} className="w-full h-full object-cover" /> : post.author_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900 leading-none">{post.author_name}</p>
                      {post.author_type === 'admin' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded-md border border-amber-200">Admin</span>}
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{formatRelativeTime(post.created_at)}</p>
                  </div>
                </div>

                {(post.author_id === currentUserId || post.author_type === 'student') && (
                  <div className="relative">
                    <button onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)} className="p-2 text-slate-300 hover:text-slate-600"><MoreHorizontal size={20} /></button>
                    {menuOpenId === post.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 top-8 bg-white shadow-xl border border-slate-100 rounded-xl py-1 z-20 w-32">
                          <button onClick={() => handleDeletePost(post.id)} className="w-full text-left px-4 py-2 text-xs text-red-500 font-bold hover:bg-red-50 flex gap-2 items-center"><Trash2 size={14} /> Excluir</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 pb-6">
                <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>
                {post.image_url && (
                  <div className="mt-4 rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm">
                    <img src={post.image_url} className="w-full h-auto object-cover" />
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-6">
                  <button onClick={() => handleLike(post.id)} className={cn("flex gap-2 items-center text-xs font-black transition-colors", post.liked ? "text-red-500" : "text-slate-400")}>
                    <Heart className={cn("w-4 h-4", post.liked && "fill-current")} /> {post.likes_count}
                  </button>
                  <button className="flex gap-2 items-center text-xs font-black text-slate-400">
                    <MessageCircle className="w-4 h-4" /> {post.comments_count}
                  </button>
                </div>
                <button className="text-slate-300 hover:text-slate-500"><Share2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>

        {/* Fim */}
        <div className="text-center py-12 px-6 opacity-30">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Tecnologia TribeBuild</p>
        </div>
      </main>

      <BottomNavigation primaryColor={appData.primaryColor} />
    </div>
  );
}