import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Image as ImageIcon, Send, X, Crown,
  MoreHorizontal, Trash2, Flag, Bell, Sparkles, Share2, Loader2,
  Bold, Italic, Underline, List, Link as LinkIcon, Eraser
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
  liked?: boolean;
}

export default function PwaCommunityPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  // --- ESTADOS DO EDITOR VISUAL ---
  const [htmlContent, setHtmlContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false, unorderedList: false
  });

  // Estado de Imagem
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Menu e Delete
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 1. Inicialização
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const { data: app, error: appError } = await supabase
          .from('apps').select('id, name, logo, primary_color').eq('slug', appSlug).single();
        if (appError || !app) throw new Error('App não encontrado');
        setAppData(app);

        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || 'anon');

        const { data: feedData } = await supabase
          .from('community_posts').select('*').eq('app_id', app.id).order('created_at', { ascending: false });

        if (feedData) {
          const postsWithLikes = feedData.map(post => ({ ...post, liked: false }));
          setPosts(postsWithLikes);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    if (appSlug) init();
  }, [appSlug]);

  // --- LÓGICA DO EDITOR (Igual ao Dashboard) ---
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

  const addLink = () => {
    const url = prompt("URL:");
    if (url) execCmd('createLink', url);
  };

  // --- UPLOAD IMAGEM ---
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPostImage(file);
      const reader = new FileReader();
      reader.onload = () => setNewPostImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- PUBLICAR ---
  const handleCreatePost = async () => {
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (!plainText && !newPostImage) return;

    setIsPosting(true);
    try {
      let finalImageUrl = null;
      if (newPostImage) {
        const path = `community/${Date.now()}-${newPostImage.name}`;
        await supabase.storage.from('feed-images').upload(path, newPostImage);
        const { data } = supabase.storage.from('feed-images').getPublicUrl(path);
        finalImageUrl = data.publicUrl;
      }

      const newPost = {
        app_id: appData.id,
        author_id: currentUserId || 'student-id',
        author_type: 'student',
        author_name: 'Aluno(a)',
        author_avatar: null,
        content: htmlContent, // Salva HTML
        image_url: finalImageUrl,
        likes_count: 0,
        comments_count: 0
      };

      const { data, error } = await supabase.from('community_posts').insert([newPost]).select().single();
      if (error) throw error;

      if (data) setPosts([data, ...posts]);

      setHtmlContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setNewPostImage(null);
      setNewPostImagePreview(null);

    } catch (err) { alert('Erro ao publicar.'); } finally { setIsPosting(false); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Excluir este post?')) return;
    try {
      await supabase.from('community_posts').delete().eq('id', postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) { alert('Erro ao excluir.'); }
    setMenuOpenId(null);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 } : p));
  };

  const formatRelativeTime = (d: string) => {
    const diff = new Date().getTime() - new Date(d).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `Há ${days} dias`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `Há ${hours}h`;
    return 'Agora mesmo';
  };

  if (loading || !appData) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-['inter'] transition-colors">

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

        {/* === CARD DE CRIAÇÃO (EDITOR) === */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden">

          {/* Toolbar do Editor */}
          <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto">
            <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
              <ToolbarBtn isActive={activeFormats.bold} onClick={() => execCmd('bold')} icon={<Bold className="w-4 h-4" />} />
              <ToolbarBtn isActive={activeFormats.italic} onClick={() => execCmd('italic')} icon={<Italic className="w-4 h-4" />} />
              <ToolbarBtn isActive={activeFormats.underline} onClick={() => execCmd('underline')} icon={<Underline className="w-4 h-4" />} />
            </div>
            <div className="flex gap-1 px-2 border-r border-slate-200 dark:border-slate-700">
              <ToolbarBtn isActive={activeFormats.unorderedList} onClick={() => execCmd('insertUnorderedList')} icon={<List className="w-4 h-4" />} />
            </div>
            <div className="flex gap-1 pl-2">
              <ToolbarBtn onClick={addLink} icon={<LinkIcon className="w-4 h-4" />} />
              <ToolbarBtn onClick={() => execCmd('removeFormat')} icon={<Eraser className="w-4 h-4" />} />
            </div>
          </div>

          <div className="p-4 flex gap-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg flex-shrink-0" style={{ backgroundColor: appData.primaryColor }}>
              A
            </div>

            <div className="flex-1 min-w-0">
              {/* Área Editável */}
              <div
                ref={editorRef}
                contentEditable
                onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                onKeyUp={checkFormats} onClick={checkFormats}
                className="w-full min-h-[80px] outline-none text-slate-700 dark:text-slate-300 text-sm prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-5 leading-relaxed placeholder:text-slate-400"
                data-placeholder="Compartilhe algo com a comunidade..."
              />

              {/* Preview da Imagem */}
              {newPostImagePreview && (
                <div className="relative mt-4 group inline-block">
                  <img src={newPostImagePreview} className="h-32 w-auto rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm object-cover" />
                  <button onClick={() => { setNewPostImage(null); setNewPostImagePreview(null); }} className="absolute top-2 right-2 w-6 h-6 bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"><X size={12} /></button>
                </div>
              )}
            </div>
          </div>

          {/* Footer do Editor */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm">
              <ImageIcon size={16} /> Foto
            </button>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleSelectImage} />

            <button
              onClick={handleCreatePost}
              disabled={(!htmlContent.replace(/<[^>]*>/g, '').trim() && !newPostImage) || isPosting}
              className="flex items-center gap-2 px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: appData.primaryColor }}
            >
              {isPosting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send size={12} /> Publicar</>}
            </button>
          </div>
        </div>

        {/* === FEED === */}
        <div className="space-y-6">
          {posts.map((post, idx) => (
            <article key={post.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="p-6 pb-4 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg overflow-hidden", post.author_type === 'admin' ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                    {post.author_avatar ? <img src={post.author_avatar} className="w-full h-full object-cover" /> : post.author_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900 dark:text-white leading-none">{post.author_name}</p>
                      {post.author_type === 'admin' && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[8px] font-black uppercase rounded-md border border-amber-200 dark:border-amber-800">Admin</span>}
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{formatRelativeTime(post.created_at)}</p>
                  </div>
                </div>

                {(post.author_id === currentUserId || post.author_type === 'student') && (
                  <div className="relative">
                    <button onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)} className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200"><MoreHorizontal size={20} /></button>
                    {menuOpenId === post.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 rounded-xl py-1 z-20 w-32">
                          <button onClick={() => handleDeletePost(post.id)} className="w-full text-left px-4 py-2 text-xs text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 flex gap-2 items-center"><Trash2 size={14} /> Excluir</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Conteúdo Renderizado (Rich Text) */}
              <div className="px-6 pb-6">
                <div
                  className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-5 [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                {post.image_url && (
                  <div className="mt-4 rounded-[1.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                    <img src={post.image_url} className="w-full h-auto object-cover" />
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
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
          <p className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Tecnologia TribeBuild</p>
        </div>
      </main>

      <BottomNavigation primaryColor={appData.primaryColor} />
    </div>
  );
}

// Sub-componente Toolbar
const ToolbarBtn = ({ onClick, icon, isActive }: any) => (
  <button onClick={(e) => { e.preventDefault(); onClick(); }} className={cn("p-1.5 rounded transition-all", isActive ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-inner" : "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800")}>{icon}</button>
);