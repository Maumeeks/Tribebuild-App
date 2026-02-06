import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bold, Italic, Underline, List, Image as ImageIcon,
  User, Trash2, Heart, MessageCircle, Send, X, MoreHorizontal, Clock, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';

// Tipos Reais
interface CommunityPost {
  id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_admin?: boolean; // Para destacar posts do admin
}

type Tab = 'create' | 'list';

const CommunityPage: React.FC = () => {
  const { appId } = useParams(); // ID do App vindo da URL (ex: dashboard/apps/123/community)
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Estado do formulário
  const [authorName, setAuthorName] = useState('Admin'); // Padrão
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });

  // 1. Buscar Posts Reais
  const fetchPosts = async () => {
    if (!appId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPosts(data);
    } catch (err) {
      console.error('Erro ao buscar posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [appId]);

  // 2. Uploads Locais (Preview)
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAuthorAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onload = () => setPostImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 3. Publicar no Supabase
  const handlePublish = async () => {
    if (!appId) return;
    if (!authorName.trim()) { alert('Digite o nome do autor'); return; }
    if (!content.trim()) { alert('Digite o conteúdo'); return; }

    try {
      setPublishing(true);
      let finalAvatarUrl = null;
      let finalImageUrl = null;

      // Upload Avatar (se houver novo)
      if (avatarFile) {
        const path = `avatars/${Date.now()}-${avatarFile.name}`;
        await supabase.storage.from('feed-images').upload(path, avatarFile);
        const { data } = supabase.storage.from('feed-images').getPublicUrl(path);
        finalAvatarUrl = data.publicUrl;
      }

      // Upload Imagem do Post
      if (postImage) {
        const path = `posts/${Date.now()}-${postImage.name}`;
        await supabase.storage.from('feed-images').upload(path, postImage);
        const { data } = supabase.storage.from('feed-images').getPublicUrl(path);
        finalImageUrl = data.publicUrl;
      }

      const { error } = await supabase.from('community_posts').insert([{
        app_id: appId,
        author_id: 'admin-dashboard', // Placeholder, idealmente pegar o ID do user logado
        author_type: 'admin',
        author_name: authorName,
        author_avatar: finalAvatarUrl || authorAvatar, // Usa o URL novo ou o preview se for string (caso venha do banco futuramente)
        content: content,
        image_url: finalImageUrl,
        likes_count: 0,
        comments_count: 0
      }]);

      if (error) throw error;

      alert('Post publicado!');
      // Reset
      setContent('');
      setPostImage(null);
      setPostImagePreview(null);
      setActiveTab('list');
      fetchPosts();

    } catch (err) {
      console.error(err);
      alert('Erro ao publicar.');
    } finally {
      setPublishing(false);
    }
  };

  // 4. Deletar
  const handleDelete = async () => {
    if (!deleteModal.postId) return;
    try {
      await supabase.from('community_posts').delete().eq('id', deleteModal.postId);
      setPosts(prev => prev.filter(p => p.id !== deleteModal.postId));
      setDeleteModal({ open: false, postId: null });
    } catch (err) { alert('Erro ao excluir.'); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button onClick={() => navigate('/dashboard/apps')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-wide mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Comunidade</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Engaje sua base com discussões e avisos.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button onClick={() => setActiveTab('create')} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all", activeTab === 'create' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900")}>Criar Post</button>
        <button onClick={() => setActiveTab('list')} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all", activeTab === 'list' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900")}>Feed ({posts.length})</button>
      </div>

      <div className="animate-slide-up">
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Autor */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-4 border-b pb-2">Autor</h3>
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div onClick={() => avatarInputRef.current?.click()} className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-blue cursor-pointer overflow-hidden relative group">
                      {authorAvatar ? <img src={authorAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User className="w-6 h-6" /></div>}
                    </div>
                    <input ref={avatarInputRef} type="file" hidden onChange={handleAvatarSelect} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                    <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm mt-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Conteúdo */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[300px]">
                {/* Toolbar Decorativa */}
                <div className="flex gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50">
                  <div className="flex gap-1"><button className="p-1.5 text-slate-400 rounded hover:bg-slate-200"><Bold className="w-4 h-4" /></button><button className="p-1.5 text-slate-400 rounded hover:bg-slate-200"><Italic className="w-4 h-4" /></button></div>
                </div>

                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Escreva algo..." className="w-full flex-1 p-6 bg-transparent outline-none resize-none text-slate-900 dark:text-white" />

                {postImagePreview && (
                  <div className="px-6 pb-6 relative group inline-block">
                    <img src={postImagePreview} className="max-h-60 rounded-lg border" />
                    <button onClick={() => { setPostImage(null); setPostImagePreview(null); }} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                )}

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                  <button onClick={() => postImageInputRef.current?.click()} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-blue">
                    <ImageIcon className="w-4 h-4" /> Adicionar Imagem
                  </button>
                  <input ref={postImageInputRef} type="file" hidden onChange={handlePostImageSelect} />

                  <Button onClick={handlePublish} disabled={publishing} size="sm" leftIcon={publishing ? Loader2 : Send}>
                    {publishing ? 'Enviando...' : 'Publicar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LISTA */}
        {activeTab === 'list' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {posts.length === 0 ? <div className="text-center py-20 text-slate-500">Nenhum post.</div> : posts.map(post => (
              <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <img src={post.author_avatar || ''} className="w-10 h-10 rounded-full bg-slate-100" />
                    <div><h4 className="font-bold text-sm text-slate-900 dark:text-white">{post.author_name}</h4><span className="text-xs text-slate-500">{formatDate(post.created_at)}</span></div>
                  </div>
                  <button onClick={() => setDeleteModal({ open: true, postId: post.id })} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap mb-4">{post.content}</p>
                {post.image_url && <img src={post.image_url} className="w-full rounded-lg max-h-96 object-cover mb-4" />}
                <div className="flex gap-4 text-xs font-bold text-slate-500 border-t pt-3">
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {post.likes_count}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.comments_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Delete (igual ao feed) */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-sm">
            <h3 className="font-bold text-lg dark:text-white">Excluir?</h3>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setDeleteModal({ open: false, postId: null })} className="flex-1 py-2 border rounded">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;