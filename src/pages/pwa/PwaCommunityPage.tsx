import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Image as ImageIcon, Send, X, Crown,
  MoreHorizontal, Trash2, Flag, Bell, Sparkles, Share2, Loader2,
  Bold, Italic, Underline, List, Link as LinkIcon, Eraser, User // ✅ Import User Adicionado
} from 'lucide-react';
import DOMPurify from 'dompurify';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface CommunityPost {
  id: string;
  app_id: string;
  author_id: string;
  author_type: 'admin' | 'student';
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  status: 'pending' | 'approved' | 'rejected'; // ✅ Status Adicionado
  likes_count: number;
  comments_count: number;
  created_at: string;
  liked?: boolean;
}

export default function PwaCommunityPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [userData, setUserData] = useState<{ name: string, avatar: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  // Editor
  const [htmlContent, setHtmlContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false, unorderedList: false
  });

  // Imagem
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Inicialização
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const { data: app, error: appError } = await supabase
          .from('apps').select('id, name, logo, primary_color').eq('slug', appSlug).single();
        if (appError || !app) throw new Error('App não encontrado');
        setAppData(app);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          const { data: client } = await supabase
            .from('clients').select('name, avatar_url').eq('id', user.id).single();
          setUserData({ name: client?.name || 'Aluno', avatar: client?.avatar_url || null });
        }

        const { data: feedData } = await supabase
          .from('community_posts')
          .select('*')
          .eq('app_id', app.id)
          .or(`status.eq.approved,author_id.eq.${user?.id}`)
          .order('created_at', { ascending: false });

        if (feedData) {
          const typedPosts = feedData as CommunityPost[];
          setPosts(typedPosts.map(post => ({ ...post, liked: false })));
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    if (appSlug) init();
  }, [appSlug]);

  // Editor Logic
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
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (!plainText && !newPostImage) return;

    setIsPosting(true);
    try {
      let finalImageUrl = null;
      if (newPostImage) {
        const path = `community/${appData.id}/${Date.now()}-${newPostImage.name}`;
        await supabase.storage.from('feed-images').upload(path, newPostImage);
        finalImageUrl = supabase.storage.from('feed-images').getPublicUrl(path).data.publicUrl;
      }

      const sanitizedHTML = DOMPurify.sanitize(htmlContent);

      const newPostPayload = {
        app_id: appData.id,
        author_id: currentUserId,
        author_type: 'student',
        author_name: userData?.name || 'Aluno',
        author_avatar: userData?.avatar || null,
        content: sanitizedHTML,
        image_url: finalImageUrl,
        status: 'pending',
        likes_count: 0,
        comments_count: 0
      };

      const { data, error } = await supabase.from('community_posts').insert([newPostPayload]).select().single();
      if (error) throw error;

      if (data) {
        const newPostTyped = data as CommunityPost;
        setPosts([newPostTyped, ...posts]);
      }

      setHtmlContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setNewPostImage(null);
      setNewPostImagePreview(null);
      alert('Post enviado para moderação!');

    } catch (err) { alert('Erro ao publicar.'); } finally { setIsPosting(false); }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Excluir este post?')) return;
    try {
      await supabase.from('community_posts').delete().eq('id', postId).eq('author_id', currentUserId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) { alert('Erro ao excluir.'); }
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 } : p));
  };

  const formatRelativeTime = (d: string) => {
    const diff = new Date().getTime() - new Date(d).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Agora mesmo';
    if (hours < 24) return `Há ${hours}h`;
    return `Há ${Math.floor(hours / 24)} dias`;
  };

  if (loading || !appData) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-['inter']">
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg" style={{ backgroundColor: appData.primary_color }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-base tracking-tight leading-none">Comunidade</h1>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">{appData.name}</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
          <Bell className="w-5 h-5 text-white" />
        </button>
      </header>

      <main className="p-6 space-y-6 animate-slide-up max-w-xl mx-auto">
        {/* Editor de Post */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto scrollbar-hide">
            <ToolbarBtn isActive={activeFormats.bold} onClick={() => execCmd('bold')} icon={<Bold size={16} />} />
            <ToolbarBtn isActive={activeFormats.italic} onClick={() => execCmd('italic')} icon={<Italic size={16} />} />
            <ToolbarBtn isActive={activeFormats.unorderedList} onClick={() => execCmd('insertUnorderedList')} icon={<List size={16} />} />
            <ToolbarBtn onClick={() => execCmd('removeFormat')} icon={<Eraser size={16} />} />
          </div>
          <div className="p-4 flex gap-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg flex-shrink-0" style={{ backgroundColor: appData.primary_color }}>
              {userData?.name.charAt(0) || 'A'}
            </div>
            <div className="flex-1">
              <div ref={editorRef} contentEditable onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)} className="w-full min-h-[80px] outline-none text-slate-700 dark:text-slate-300 text-sm prose prose-sm max-w-none dark:prose-invert" data-placeholder="No que você está pensando?" />
              {newPostImagePreview && (
                <div className="relative mt-4 inline-block">
                  <img src={newPostImagePreview} className="h-32 w-auto rounded-xl object-cover" />
                  <button onClick={() => { setNewPostImage(null); setNewPostImagePreview(null); }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"><X size={12} /></button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase shadow-sm"><ImageIcon size={14} /> Foto</button>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleSelectImage} />
            <button onClick={handleCreatePost} disabled={(!htmlContent.trim() && !newPostImage) || isPosting} className="px-6 py-2 rounded-xl font-black uppercase text-[10px] text-white shadow-lg disabled:opacity-50" style={{ backgroundColor: appData.primary_color }}>
              {isPosting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Publicar'}
            </button>
          </div>
        </div>

        {/* Lista de Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 pb-4 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg", post.author_type === 'admin' ? "bg-amber-400" : "bg-slate-100")}>
                    {post.author_avatar ? <img src={post.author_avatar} className="w-full h-full object-cover" /> : <User className="text-slate-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900 dark:text-white leading-none">{post.author_name}</p>
                      {post.author_type === 'admin' && <Crown className="w-3 h-3 text-amber-500" />}
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1">
                      {formatRelativeTime(post.created_at)}
                      {post.status === 'pending' && <span className="ml-2 text-orange-500">• Em análise</span>}
                    </p>
                  </div>
                </div>
                {post.author_id === currentUserId && <button onClick={() => handleDeletePost(post.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>}
              </div>
              <div className="px-6 pb-6">
                <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} />
                {post.image_url && <img src={post.image_url} className="mt-4 rounded-[1.5rem] w-full h-auto border dark:border-slate-800" />}
              </div>
              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex gap-6">
                  <button onClick={() => handleLike(post.id)} className={cn("flex gap-2 items-center text-xs font-black", post.liked ? "text-red-500" : "text-slate-400")}><Heart className={cn("w-4 h-4", post.liked && "fill-current")} /> {post.likes_count}</button>
                  <button className="flex gap-2 items-center text-xs font-black text-slate-400"><MessageCircle className="w-4 h-4" /> {post.comments_count}</button>
                </div>
                <Share2 size={16} className="text-slate-300" />
              </div>
            </article>
          ))}
        </div>
      </main>
      <BottomNavigation primaryColor={appData.primary_color} />
    </div>
  );
}

const ToolbarBtn = ({ onClick, icon, isActive }: any) => (
  <button onClick={(e) => { e.preventDefault(); onClick(); }} className={cn("p-2 rounded-lg transition-all", isActive ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-inner" : "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800")}>{icon}</button>
);