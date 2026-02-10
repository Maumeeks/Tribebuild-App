import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bold, Italic, Underline, List, Link as LinkIcon,
  Image as ImageIcon, User, Trash2, Heart, MessageCircle, Send,
  X, Clock, Loader2, Eraser, CheckCircle, XCircle, ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';
import ImageCropperModal from '../../components/modals/ImageCropperModal';

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
  status: 'pending' | 'approved' | 'rejected';
  likes_count: number;
  comments_count: number;
  created_at: string;
}

type Tab = 'create' | 'feed' | 'moderation';

const CommunityPage: React.FC = () => {
  const { appId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [pendingPosts, setPendingPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Editor
  const [htmlContent, setHtmlContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, unorderedList: false });

  // Identidade (Admin Persona)
  const [authorName, setAuthorName] = useState('Suporte');
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Imagem do Post (Sem Crop)
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);

  // Crop do Avatar
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempAvatarSrc, setTempAvatarSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });

  // 1. Buscar Dados
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

      if (data) {
        setPosts(data.filter(p => p.status === 'approved'));
        setPendingPosts(data.filter(p => p.status === 'pending'));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchPosts(); }, [appId]);

  // 2. Ações de Moderação
  const handleApprove = async (postId: string) => {
    try {
      await supabase.from('community_posts').update({ status: 'approved' }).eq('id', postId);
      // Move localmente para atualizar UI rápido
      const post = pendingPosts.find(p => p.id === postId);
      if (post) {
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
        setPosts(prev => [{ ...post, status: 'approved' }, ...prev]);
      }
    } catch (err) { alert('Erro ao aprovar.'); }
  };

  const handleApproveAll = async () => {
    if (!confirm(`Aprovar todos os ${pendingPosts.length} posts pendentes?`)) return;
    try {
      const pendingIds = pendingPosts.map(p => p.id);
      await supabase.from('community_posts').update({ status: 'approved' }).in('id', pendingIds);

      setPosts(prev => [...pendingPosts.map(p => ({ ...p, status: 'approved' as const })), ...prev]);
      setPendingPosts([]);
    } catch (err) { alert('Erro em massa.'); }
  };

  const handleReject = async (postId: string) => {
    if (!confirm('Rejeitar e excluir este post?')) return;
    try {
      await supabase.from('community_posts').delete().eq('id', postId);
      setPendingPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) { alert('Erro ao rejeitar.'); }
  };

  // 3. Uploads e Editor
  const onAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempAvatarSrc(reader.result as string);
        setCropperOpen(true);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (file: File) => {
    setAvatarFile(file);
    setAuthorAvatar(URL.createObjectURL(file));
    setCropperOpen(false);
  };

  const onPostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onload = () => setPostImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Editor Utils
  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) editorRef.current.focus();
  };

  // 4. Publicar (Como Admin = Aprovado Direto)
  const handlePublish = async () => {
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (!appId || (!plainText && !postImage)) return;

    setPublishing(true);
    try {
      let finalAvatarUrl = authorAvatar;
      let finalImageUrl = null;

      // Uploads...
      if (avatarFile) {
        const path = `avatars/${Date.now()}-${avatarFile.name}`;
        await supabase.storage.from('feed-images').upload(path, avatarFile);
        const { data } = supabase.storage.from('feed-images').getPublicUrl(path);
        finalAvatarUrl = data.publicUrl;
      }
      if (postImage) {
        const path = `community/${Date.now()}-${postImage.name}`;
        await supabase.storage.from('feed-images').upload(path, postImage);
        const { data } = supabase.storage.from('feed-images').getPublicUrl(path);
        finalImageUrl = data.publicUrl;
      }

      const { error } = await supabase.from('community_posts').insert([{
        app_id: appId,
        author_id: 'admin',
        author_type: 'admin',
        author_name: authorName,
        author_avatar: finalAvatarUrl?.startsWith('blob:') ? null : finalAvatarUrl,
        content: htmlContent,
        image_url: finalImageUrl,
        status: 'approved', // Admin posta aprovado direto
        likes_count: 0, comments_count: 0
      }]);

      if (error) throw error;

      alert('Post publicado!');
      setHtmlContent(''); if (editorRef.current) editorRef.current.innerHTML = '';
      setPostImage(null); setPostImagePreview(null);
      setActiveTab('feed');
      fetchPosts();

    } catch (err) { console.error(err); alert('Erro ao publicar.'); } finally { setPublishing(false); }
  };

  // Delete
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

      {/* Modal Crop Avatar */}
      {cropperOpen && tempAvatarSrc && (
        <ImageCropperModal imageSrc={tempAvatarSrc} onClose={() => setCropperOpen(false)} onCropComplete={handleCropComplete} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button onClick={() => navigate('/dashboard/apps')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-2 font-bold text-xs uppercase"><ArrowLeft className="w-3 h-3" /> Voltar</button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Comunidade</h1>
          <p className="text-slate-500 text-sm mt-1">Interaja com seus alunos.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button onClick={() => setActiveTab('create')} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all", activeTab === 'create' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900")}>Criar Post</button>
        <button onClick={() => setActiveTab('feed')} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all", activeTab === 'feed' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900")}>Feed ({posts.length})</button>
        <button onClick={() => setActiveTab('moderation')} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2", activeTab === 'moderation' ? "bg-orange-50 text-orange-600" : "text-slate-500 hover:text-orange-600")}>
          Moderação
          {pendingPosts.length > 0 && <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{pendingPosts.length}</span>}
        </button>
      </div>

      <div className="animate-slide-up">

        {/* --- CRIAÇÃO --- */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Persona */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Persona do Autor</h3>
                <div className="flex flex-col items-center gap-4">
                  <div onClick={() => avatarInputRef.current?.click()} className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 hover:border-brand-blue cursor-pointer overflow-hidden relative group">
                    {authorAvatar ? <img src={authorAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><User /></div>}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ImageIcon className="text-white" /></div>
                  </div>
                  <input ref={avatarInputRef} type="file" hidden accept="image/*" onChange={onAvatarSelect} />
                  <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-center font-bold" placeholder="Nome do Autor" />
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[300px]">
                <div className="flex gap-1 p-2 border-b border-slate-100 dark:border-slate-800">
                  {/* Toolbar simplificada */}
                  <button onClick={() => execCmd('bold')} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><Bold className="w-4 h-4" /></button>
                  <button onClick={() => execCmd('italic')} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><Italic className="w-4 h-4" /></button>
                  <button onClick={() => execCmd('insertUnorderedList')} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><List className="w-4 h-4" /></button>
                </div>
                <div
                  ref={editorRef} contentEditable
                  onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                  className="w-full flex-1 p-6 outline-none text-slate-700 dark:text-slate-300 text-sm prose prose-sm max-w-none"
                  data-placeholder="Escreva algo..."
                />
                {postImagePreview && (
                  <div className="px-6 pb-6 relative inline-block">
                    <img src={postImagePreview} className="max-h-60 rounded-lg border shadow-sm" />
                    <button onClick={() => { setPostImage(null); setPostImagePreview(null); }} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                )}
                <div className="p-4 border-t flex justify-between items-center bg-slate-50/50">
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-blue"><ImageIcon className="w-4 h-4" /> Adicionar Mídia</button>
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={onPostImageSelect} />
                  <Button onClick={handlePublish} disabled={publishing} size="sm" leftIcon={publishing ? Loader2 : Send}>{publishing ? 'Publicando...' : 'Publicar'}</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODERAÇÃO --- */}
        {activeTab === 'moderation' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700 dark:text-white">Pendentes ({pendingPosts.length})</h3>
              {pendingPosts.length > 0 && <Button onClick={handleApproveAll} size="sm" className="bg-green-600 hover:bg-green-700 text-white">Aprovar Todos</Button>}
            </div>

            {pendingPosts.length === 0 ? <div className="text-center py-10 text-slate-400">Tudo limpo! Nenhuma pendência.</div> : pendingPosts.map(post => (
              <div key={post.id} className="bg-orange-50/50 border border-orange-100 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between mb-3">
                  <div className="flex gap-3 items-center">
                    <img src={post.author_avatar || ''} className="w-10 h-10 rounded-full bg-slate-200" />
                    <div><h4 className="font-bold text-sm text-slate-900">{post.author_name}</h4><span className="text-xs text-slate-500">Aluno • {formatDate(post.created_at)}</span></div>
                  </div>
                </div>
                <div className="text-sm text-slate-700 mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />
                {post.image_url && <img src={post.image_url} className="max-h-60 rounded-lg mb-4" />}

                <div className="flex gap-3 pt-3 border-t border-orange-200/50">
                  <button onClick={() => handleApprove(post.id)} className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Aprovar</button>
                  <button onClick={() => handleReject(post.id)} className="flex-1 py-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Rejeitar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- FEED (APROVADOS) --- */}
        {activeTab === 'feed' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center overflow-hidden", post.author_type === 'admin' ? "bg-brand-blue text-white" : "bg-slate-100")}>
                      {post.author_avatar ? <img src={post.author_avatar} className="w-full h-full object-cover" /> : <User />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{post.author_name}</h4>
                      <span className="text-xs text-slate-500">{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  <button onClick={() => setDeleteModal({ open: true, postId: post.id })} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />
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

      {/* Modal Delete */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Excluir?</h3>
            <div className="flex gap-2">
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