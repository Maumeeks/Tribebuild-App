import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Sparkles,
  MoreVertical,
  Bell,
  Share2,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

// Tipos Reais do Banco de Dados
interface FeedPost {
  id: string;
  app_id: string;
  content: string; // HTML vindo do Dashboard
  image_url: string | null;
  created_at: string;
  scheduled_for: string | null;
  status: 'published' | 'scheduled' | 'draft';
  likes_count: number;
  comments_count: number;
  liked?: boolean; // Estado local para UI Otimista
}

export default function PwaFeedPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<FeedPost[]>([]);

  // 1. Busca Dados Reais (App + Posts)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // A. Busca Infos do App
        const { data: app, error: appError } = await supabase
          .from('apps')
          .select('id, name, logo, primary_color')
          .eq('slug', appSlug)
          .single();

        if (appError || !app) throw new Error('App não encontrado');
        setAppData(app);

        // B. Busca Posts Publicados
        const { data: feedData, error: feedError } = await supabase
          .from('feed_posts')
          .select('*')
          .eq('app_id', app.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (feedError) throw feedError;

        if (feedData) {
          // Adiciona estado inicial de like (false por padrão no front)
          const postsWithLikes = feedData.map(post => ({ ...post, liked: false }));
          setPosts(postsWithLikes);
        }

      } catch (err) {
        console.error('Erro ao carregar feed:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug) fetchData();
  }, [appSlug]);

  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  const handleLike = (postId: string) => {
    // UI Otimista: Atualiza na hora, depois o backend se vira (implementar chamada API depois)
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes_count: post.liked ? (post.likes_count - 1) : (post.likes_count + 1)
        };
      }
      return post;
    }));
  };

  if (loading || !appData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const primaryColor = appData.primary_color || '#2563EB';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-300">

      {/* Header Premium */}
      <header
        className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg transition-colors"
        style={{
          backgroundColor: primaryColor,
          boxShadow: `0 4px 20px ${primaryColor}30`
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-base tracking-tight leading-none">Feed</h1>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              {appData.name}
            </p>
          </div>
        </div>
        <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-colors border border-white/10">
          <Bell className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Lista de Posts */}
      <main className="p-6 space-y-6 animate-slide-up">
        {posts.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma novidade por enquanto.</p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <article
              key={post.id}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-slide-up transition-colors duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Header do Post */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar do App/Autor */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg overflow-hidden"
                      style={{ backgroundColor: primaryColor, boxShadow: `0 8px 15px -4px ${primaryColor}40` }}
                    >
                      {appData.logo ? (
                        <img src={appData.logo} alt={appData.name} className="w-full h-full object-cover bg-white" />
                      ) : (
                        appData.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        {appData.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {formatRelativeTime(post.scheduled_for || post.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Post (HTML Renderizado - Opção B) */}
              <div className="px-6 pb-6">
                <div
                  className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-2 prose-li:my-0 prose-a:text-blue-500 prose-a:font-bold prose-headings:font-black prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Imagem do Post (Se houver) */}
              {post.image_url && (
                <div className="px-6 pb-6">
                  <div className="rounded-[1.5rem] overflow-hidden shadow-sm relative group">
                    <img
                      src={post.image_url}
                      alt="Anexo"
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )}

              {/* Ações e Métricas */}
              <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2.5 transition-all active:scale-90"
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                      post.liked
                        ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                        : "bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-500 border border-slate-100 dark:border-slate-700 shadow-sm"
                    )}>
                      <Heart className={cn("w-4 h-4", post.liked && "fill-current")} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      post.liked ? "text-red-500" : "text-slate-400 dark:text-slate-500"
                    )}>
                      {post.likes_count}
                    </span>
                  </button>

                  <button
                    onClick={() => alert('Comentários em breve!')}
                    className="flex items-center gap-2.5 group"
                  >
                    <div className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 shadow-sm transition-all">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-slate-600 dark:group-hover:text-slate-300">
                      {post.comments_count}
                    </span>
                  </button>
                </div>

                <button className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shadow-sm transition-all active:scale-90">
                  <Share2 size={16} />
                </button>
              </div>
            </article>
          ))
        )}

        {/* Fim do Feed */}
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-slate-800 shadow-inner">
            <Sparkles className="w-6 h-6 text-blue-400 dark:text-blue-500" />
          </div>
          <p className="text-slate-900 dark:text-white font-black tracking-tight leading-none text-base">Você está em dia! ✨</p>
          <p className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-2 leading-relaxed">
            Não há mais publicações no momento.<br />Fique atento às notificações!
          </p>
        </div>
      </main>

      {/* Footer Branding */}
      <div className="text-center pb-12 opacity-30">
        <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
          Tecnologia TribeBuild • Feed do Aluno
        </p>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation primaryColor={primaryColor} />
    </div>
  );
}