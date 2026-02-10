import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bold, Italic, Underline, List, Link as LinkIcon,
  Image as ImageIcon, User, Trash2, Heart, MessageCircle, Send,
  X, Clock, Loader2, Eraser
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';
import { supabase } from '../../lib/supabase';
// Importamos o Modal de Recorte que consertamos antes
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
  likes_count: number;
  comments_count: number;
  created_at: string;
}

type Tab = 'create' | 'list';

const CommunityPage: React.FC = () => {
  const { appId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Estados do Editor Visual
  const [htmlContent, setHtmlContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false, unorderedList: false });

  // Identidade do Admin (Persona)
  const [authorName, setAuthorName] = useState('Admin');
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null); // URL ou Base64 para preview
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // Arquivo real para upload

  // Imagem do Post
  const [postImage, setPostImage] = useState<File | null>(null); // Arquivo real
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null); // Preview

  // Controle do Modal de Recorte
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperType, setCropperType] = useState<'avatar' | 'post'>('avatar'); // Saber o que estamos cortando
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null); // Imagem bruta para o modal

  const fileInputRef = useRef<HTMLInputElement>(null); // Input único reutilizável
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });

  // 1. Buscar Posts
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

  // 2. Editor de Texto
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

  // 3. Gerenciamento de Upload e Crop
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'post') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result as string);
        setCropperType(type);
        setCropperOpen(true);
        // Reseta o input para permitir selecionar a mesma foto se errar
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    const previewUrl = URL.createObjectURL(croppedFile);

    if (cropperType === 'avatar') {
      setAvatarFile(croppedFile);
      setAuthorAvatar(previewUrl);
    } else {
      setPostImage(croppedFile);
      setPostImagePreview(previewUrl);
    }

    setCropperOpen(false);
    setTempImageSrc(null);
  };

  // 4. Publicar Post
  const handlePublish = async () => {
    // Validação básica
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (!appId) return;
    if (!plainText && !postImage) {
      alert('Escreva algo ou adicione uma imagem.');
      return;
    }

    setPublishing(true);
    try {
      let finalAvatarUrl = authorAvatar; // Mantém se for URL antiga, substitui se for upload
      let finalImageUrl = null;

      // A. Upload do Avatar (se for arquivo novo)
      if (avatarFile) {
        const fileExt = 'jpg';
        const fileName = `avatars/${appId}-${Date.now()}.${fileExt}`;
        const { error: upError } = await supabase.storage.from('feed-images').upload(fileName, avatarFile, { contentType: 'image/jpeg' });
        if (upError) throw upError;
        const { data } = supabase.storage.from('feed-images').getPublicUrl(fileName);
        finalAvatarUrl = data.publicUrl;
      }

      // B. Upload da Imagem do Post
      if (postImage) {
        const fileExt = 'jpg';
        const fileName = `community/${appId}-${Date.now()}.${fileExt}`;
        const { error: upError } = await supabase.storage.from('feed-images').upload(fileName, postImage, { contentType: 'image/jpeg' });
        if (upError) throw upError;
        const { data } = supabase.storage.from('feed-images').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      // C. Salvar no Banco
      const newPost = {
        app_id: appId,
        author_id: 'admin-dashboard', // ID fixo para identificar admin
        author_type: 'admin',
        author_name: authorName,
        author_avatar: finalAvatarUrl?.startsWith('blob:') ? null : finalAvatarUrl, // Evita salvar blob URL no banco
        content: htmlContent,
        image_url: finalImageUrl,
        likes_count: 0,
        comments_count: 0
      };

      console.log('Enviando post:', newPost);

      const { error } = await supabase.from('community_posts').insert([newPost]);

      if (error) {
        console.error('Erro Supabase:', error);
        throw error;
      }

      // Sucesso
      alert('Post publicado com sucesso!');
      setHtmlContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setPostImage(null);
      setPostImagePreview(null);
      setAvatarFile(null); // Limpa arquivo do avatar mas mantém o nome/preview visual para o próximo post

      setActiveTab('list');
      fetchPosts();

    } catch (err: any) {
      console.error('Erro detalhado:', err);
      alert(`Erro ao publicar: ${err.message || 'Verifique o console'}`);
    } finally {
      setPublishing(false);
    }
  };

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

      {/* MODAL DE RECORTE */}
      {cropperOpen && tempImageSrc && (
        <ImageCropperModal
          imageSrc={tempImageSrc}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button onClick={() => navigate('/dashboard/apps')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-wide mb-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Comunidade</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie a comunidade e poste como Admin.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button onClick={() => setActiveTab('create')} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all", activeTab === 'create' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>Criar Post</button>
        <button onClick={() => setActiveTab('list')} className={cn("px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all", activeTab === 'list' ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>Feed ({posts.length})</button>
      </div>

      <div className="animate-slide-up">
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Coluna Esquerda: Identidade (Avatar com Crop) */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Identidade</h3>
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    {/* Botão invisível sobre o avatar para abrir file dialog */}
                    <label className="cursor-pointer group relative">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-blue flex items-center justify-center overflow-hidden transition-all bg-slate-50 dark:bg-slate-800">
                        {authorAvatar ? (
                          <img src={authorAvatar} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400 gap-1">
                            <User className="w-6 h-6" />
                            <span className="text-[9px] uppercase font-bold">Foto</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => onFileSelect(e, 'avatar')}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome de Exibição</label>
                    <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm mt-1 focus:ring-2 focus:ring-brand-blue/20 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Editor Visual */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[400px]">

                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-t-xl overflow-x-auto">
                  <div className="flex gap-1 pr-2 border-r border-slate-200 dark:border-slate-700">
                    <ToolbarBtn isActive={activeFormats.bold} onClick={() => execCmd('bold')} icon={<Bold className="w-4 h-4" />} />
                    <ToolbarBtn isActive={activeFormats.italic} onClick={() => execCmd('italic')} icon={<Italic className="w-4 h-4" />} />
                    <ToolbarBtn isActive={activeFormats.underline} onClick={() => execCmd('underline')} icon={<Underline className="w-4 h-4" />} />
                  </div>
                  <div className="flex gap-1 px-2 border-r border-slate-200 dark:border-slate-700">
                    <ToolbarBtn isActive={activeFormats.unorderedList} onClick={() => execCmd('insertUnorderedList')} icon={<List className="w-4 h-4" />} />
                  </div>
                  <div className="flex gap-1 pl-2">
                    <ToolbarBtn onClick={() => { const u = prompt('URL:'); if (u) execCmd('createLink', u) }} icon={<LinkIcon className="w-4 h-4" />} />
                    <ToolbarBtn onClick={() => execCmd('removeFormat')} icon={<Eraser className="w-4 h-4" />} />
                  </div>
                </div>

                {/* Área de Texto */}
                <div
                  ref={editorRef} contentEditable
                  onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                  onKeyUp={checkFormats} onClick={checkFormats}
                  className="w-full flex-1 p-6 outline-none text-slate-700 dark:text-slate-300 text-sm prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-5 leading-relaxed placeholder:text-slate-400"
                  data-placeholder="Escreva algo relevante para a comunidade..."
                />

                {/* Preview de Imagem do Post */}
                {postImagePreview && (
                  <div className="px-6 pb-6 relative group inline-block">
                    <img src={postImagePreview} className="max-h-60 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                    <button onClick={() => { setPostImage(null); setPostImagePreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"><X className="w-3 h-3" /></button>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                  <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors cursor-pointer">
                    <ImageIcon className="w-4 h-4" /> <span className="hidden sm:inline">Adicionar Mídia</span>
                    <input type="file" hidden accept="image/*" onChange={(e) => onFileSelect(e, 'post')} />
                  </label>

                  <Button onClick={handlePublish} disabled={publishing} size="sm" leftIcon={publishing ? Loader2 : Send} className="text-xs font-bold uppercase tracking-wide">
                    {publishing ? 'Publicando...' : 'Publicar Agora'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LISTA DE POSTS */}
        {activeTab === 'list' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Nenhum post na comunidade ainda.</p>
              </div>
            ) : posts.map(post => (
              <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden", post.author_type === 'admin' ? "bg-amber-400" : "bg-slate-200 dark:bg-slate-800 text-slate-400")}>
                      {post.author_avatar ? <img src={post.author_avatar} className="w-full h-full object-cover" /> : post.author_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{post.author_name}</h4>
                        {post.author_type === 'admin' && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded border border-amber-200">Admin</span>}
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  <button onClick={() => setDeleteModal({ open: true, postId: post.id })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>

                {/* Conteúdo Renderizado */}
                <div
                  className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert [&_ul]:list-disc [&_ul]:pl-5 mb-4"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {post.image_url && <div className="rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 mb-4"><img src={post.image_url} className="w-full max-h-96 object-cover" /></div>}

                <div className="flex gap-6 text-xs font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg dark:text-white mb-2">Excluir Post?</h3>
            <p className="text-sm text-slate-500 mb-4">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, postId: null })} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase shadow-lg">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Toolbar Helper
const ToolbarBtn = ({ onClick, icon, isActive }: any) => (
  <button onClick={(e) => { e.preventDefault(); onClick(); }} className={cn("p-1.5 rounded transition-all", isActive ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-inner" : "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800")}>{icon}</button>
);

export default CommunityPage;