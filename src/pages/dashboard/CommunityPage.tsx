import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bold, Italic, Underline, List, Link as LinkIcon,
  Image as ImageIcon, User, Trash2, Heart, MessageCircle, Send,
  X, Clock, Loader2, Eraser, CheckCircle, XCircle, ShieldCheck
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';
import ImageCropperModal from '../../components/modals/ImageCropperModal';

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

  // Uploads & Persona
  const [authorName, setAuthorName] = useState('Suporte');
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);

  // Crop Avatar
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempAvatarSrc, setTempAvatarSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });

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
    } catch (err) { console.error("Erro ao buscar posts:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, [appId]);

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
    const url = prompt('Insira a URL:');
    if (url) execCmd('createLink', url);
  };

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

  const handlePublish = async () => {
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (!appId || (!plainText && !postImage)) return;

    setPublishing(true);
    try {
      let finalAvatarUrl = authorAvatar;
      let finalImageUrl = null;

      if (avatarFile) {
        const path = `avatars/${appId}/${Date.now()}.png`;
        const { error: upErr } = await supabase.storage.from('feed-images').upload(path, avatarFile);
        if (upErr) throw upErr;
        finalAvatarUrl = supabase.storage.from('feed-images').getPublicUrl(path).data.publicUrl;
      }

      if (postImage) {
        const path = `posts/${appId}/${Date.now()}-${postImage.name}`;
        const { error: upErr } = await supabase.storage.from('feed-images').upload(path, postImage);
        if (upErr) throw upErr;
        finalImageUrl = supabase.storage.from('feed-images').getPublicUrl(path).data.publicUrl;
      }

      const sanitizedHTML = DOMPurify.sanitize(htmlContent);
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from('community_posts').insert([{
        app_id: appId,
        author_id: `admin_${userData.user?.id}`,
        author_type: 'admin',
        author_name: authorName,
        author_avatar: finalAvatarUrl,
        content: sanitizedHTML,
        image_url: finalImageUrl,
        status: 'approved',
        likes_count: 0,
        comments_count: 0
      }]);

      if (error) throw error;

      setHtmlContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setPostImage(null);
      setPostImagePreview(null);
      setActiveTab('feed');
      fetchPosts();

    } catch (err: any) {
      console.error(err);
      alert(`Erro: ${err.message}`);
    } finally { setPublishing(false); }
  };

  const handleApprove = async (postId: string) => {
    try {
      const { error } = await supabase.from('community_posts').update({ status: 'approved' }).eq('id', postId);
      if (error) throw error;
      fetchPosts();
    } catch (err) { alert('Erro ao aprovar.'); }
  };

  const handleReject = async (postId: string) => {
    if (!confirm('Deseja realmente rejeitar e excluir este post?')) return;
    try {
      const { error } = await supabase.from('community_posts').delete().eq('id', postId);
      if (error) throw error;
      fetchPosts();
    } catch (err) { alert('Erro ao rejeitar.'); }
  };

  const handleDelete = async () => {
    if (!deleteModal.postId) return;
    try {
      const { error } = await supabase.from('community_posts').delete().eq('id', deleteModal.postId);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== deleteModal.postId));
      setDeleteModal({ open: false, postId: null });
    } catch (err) { alert('Erro ao deletar.'); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in text-slate-900 dark:text-slate-100">

      {cropperOpen && tempAvatarSrc && (
        <ImageCropperModal
          imageSrc={tempAvatarSrc}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-2 font-bold text-xs uppercase">
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Comunidade</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Gerencie o engajamento e a moderação do seu PWA.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        {[
          { id: 'create', label: 'Criar Post' },
          { id: 'feed', label: `Feed (${posts.length})` },
          { id: 'moderation', label: 'Moderação', count: pendingPosts.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-[10px] animate-pulse">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="animate-slide-up">
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Persona */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-[0.1em]">Publicar Como</h3>
                <div className="flex flex-col items-center gap-4">
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer overflow-hidden relative group bg-slate-50 dark:bg-slate-800 transition-all duration-300"
                  >
                    {authorAvatar ? (
                      <img src={authorAvatar} className="w-full h-full object-cover" alt="Avatar Preview" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-1">
                        <User className="w-7 h-7" />
                        <span className="text-[8px] uppercase font-black tracking-widest">Upload</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="text-white w-6 h-6" />
                    </div>
                  </div>
                  <input ref={avatarInputRef} type="file" hidden accept="image/*" onChange={onAvatarSelect} />
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-center font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Nome da Persona"
                  />
                </div>
              </div>
            </div>

            {/* Coluna Editor */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[400px]">
                {/* Toolbar */}
                <div className="flex items-center gap-1.5 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-2xl">
                  <ToolbarBtn isActive={activeFormats.bold} onClick={() => execCmd('bold')} icon={<Bold className="w-4 h-4" />} />
                  <ToolbarBtn isActive={activeFormats.italic} onClick={() => execCmd('italic')} icon={<Italic className="w-4 h-4" />} />
                  <ToolbarBtn isActive={activeFormats.underline} onClick={() => execCmd('underline')} icon={<Underline className="w-4 h-4" />} />
                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1.5" />
                  <ToolbarBtn isActive={activeFormats.unorderedList} onClick={() => execCmd('insertUnorderedList')} icon={<List className="w-4 h-4" />} />
                  <ToolbarBtn onClick={addLink} icon={<LinkIcon className="w-4 h-4" />} />
                  <ToolbarBtn onClick={() => execCmd('removeFormat')} icon={<Eraser className="w-4 h-4" />} />
                </div>

                {/* Área Editável */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                  onKeyUp={checkFormats}
                  onClick={checkFormats}
                  className="w-full flex-1 p-8 outline-none text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed prose prose-slate max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-5 min-h-[250px]"
                  data-placeholder="No que você está pensando hoje?"
                />

                {/* Preview da Imagem no Editor */}
                {postImagePreview && (
                  <div className="px-8 pb-8 relative inline-block">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl group/img">
                      <img src={postImagePreview} className="max-h-[350px] w-auto object-contain bg-slate-100 dark:bg-slate-800" alt="Preview" />
                      <button
                        onClick={() => { setPostImage(null); setPostImagePreview(null); }}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-all transform hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer do Editor */}
                <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/20 dark:bg-slate-950/20">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors py-2 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10"
                  >
                    <ImageIcon className="w-4 h-4" /> Anexar Mídia
                  </button>
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={onPostImageSelect} />
                  <Button
                    onClick={handlePublish}
                    disabled={publishing || (!htmlContent.trim() && !postImage)}
                    size="sm"
                    className="px-6 rounded-xl"
                    leftIcon={publishing ? Loader2 : Send}
                  >
                    {publishing ? 'Publicando...' : 'Postar Agora'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed e Moderação */}
        {activeTab !== 'create' && (
          <div className="max-w-3xl mx-auto space-y-8">
            {(activeTab === 'moderation' ? pendingPosts : posts).length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                  <MessageCircle className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">A comunidade está silenciosa</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Os posts aprovados aparecerão aqui em tempo real.</p>
              </div>
            ) :
              (activeTab === 'moderation' ? pendingPosts : posts).map(post => (
                <div key={post.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group/card hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-sm",
                          post.author_type === 'admin' ? "border-blue-500/30 bg-blue-50" : "border-slate-100 bg-slate-50"
                        )}>
                          {post.author_avatar ? (
                            <img src={post.author_avatar} className="w-full h-full object-cover" alt={post.author_name} />
                          ) : <User className="text-slate-400 w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-[15px] flex items-center gap-2">
                            {post.author_name}
                            {post.author_type === 'admin' && (
                              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1 rounded-full">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </h4>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        {activeTab === 'moderation' && (
                          <button
                            onClick={() => handleApprove(post.id)}
                            className="text-white bg-green-600 font-bold text-[10px] uppercase px-4 py-2 rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all"
                          >
                            Aprovar
                          </button>
                        )}
                        <button
                          onClick={() => activeTab === 'moderation' ? handleReject(post.id) : setDeleteModal({ open: true, postId: post.id })}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div
                        className="text-sm text-slate-700 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />

                      {post.image_url && (
                        <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-950">
                          <img src={post.image_url} className="w-full max-h-[550px] object-contain" alt="Conteúdo do Post" />
                        </div>
                      )}
                    </div>
                  </div>

                  {activeTab === 'feed' && (
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 flex gap-5 text-xs font-black text-slate-400 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer group/stat">
                        <Heart className="w-4.5 h-4.5 group-hover/stat:fill-red-500 transition-all" /> {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1.5 hover:text-blue-500 transition-colors cursor-pointer group/stat">
                        <MessageCircle className="w-4.5 h-4.5 group-hover/stat:fill-blue-500 transition-all" /> {post.comments_count}
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal de Exclusão */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6 rotate-3">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-2xl mb-2 text-slate-900 dark:text-white tracking-tight">Excluir conteúdo?</h3>
            <p className="text-slate-500 text-[15px] mb-8 leading-relaxed font-medium">Esta ação é irreversível e o post desaparecerá do PWA de todos os alunos imediatamente.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal({ open: false, postId: null })}
                className="flex-1 py-3 font-bold text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 font-bold text-sm bg-red-600 text-white rounded-2xl hover:bg-red-700 shadow-xl shadow-red-500/30 transition-all transform active:scale-95"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolbarBtn = ({ onClick, icon, isActive }: any) => (
  <button
    onClick={(e) => { e.preventDefault(); onClick(); }}
    className={cn(
      "p-2.5 rounded-xl transition-all",
      isActive
        ? "text-blue-600 bg-blue-100 dark:bg-blue-900/40 shadow-inner"
        : "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
    )}
  >
    {icon}
  </button>
);

export default CommunityPage;