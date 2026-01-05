
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  AlignLeft,
  Link as LinkIcon,
  Type,
  Image as ImageIcon,
  User,
  Upload,
  Trash2,
  Edit3,
  Heart,
  MessageCircle,
  Send,
  X,
  Plus,
  ChevronRight
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

// Mock de posts da comunidade
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
  
  // Estado de exclusão
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; postId: string | null }>({
    open: false,
    postId: null
  });

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
    
    // Limpar formulário
    setAuthorName('');
    setAuthorAvatar(null);
    setContent('');
    setImage(null);
    
    alert('Post publicado na comunidade!');
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
    <div className="space-y-10 font-['Inter']">
      {/* Header */}
      <div className="space-y-3 animate-slide-up">
        <button
          onClick={() => navigate('/dashboard/apps')}
          className="group inline-flex items-center gap-2 text-slate-400 hover:text-brand-blue font-black uppercase tracking-widest text-[10px] transition-all"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-50 group-hover:text-brand-blue transition-colors">
              <ArrowLeft className="w-4 h-4" />
          </div>
          Voltar para Meus Apps
        </button>
        <h1 className="text-3xl font-black text-brand-blue tracking-tighter">Gerenciar Comunidade</h1>
        <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
          Crie posts simulando usuários para gerar engajamento inicial ou modere as interações reais dos seus alunos. A interatividade é a chave da retenção.
        </p>
      </div>

      {/* Tabs Design */}
      <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center w-fit animate-slide-up" style={{ animationDelay: '50ms' }}>
          <button
            onClick={() => setActiveTab('create')}
            className={cn(
                "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'create' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Criar Post
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={cn(
                "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'list' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Lista de Posts
          </button>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        {/* Tab: Criar Post */}
        {activeTab === 'create' && (
          <div className="space-y-8 max-w-4xl">
            {/* Informações do Autor */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Identidade do Autor</h4>
                </div>
                
                <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="flex-1 w-full">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nome do Aluno Simulado</label>
                        <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="Ex: Maria Clara"
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                        />
                    </div>

                    <div className="flex-shrink-0">
                        {/* Avatar do Autor - UPLOAD DE FOTO */}
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Avatar</label>
                          
                          {authorAvatar ? (
                            // Preview da foto com botão remover
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-blue shadow-md">
                                <img src={authorAvatar} alt="Avatar" className="w-full h-full object-cover" />
                              </div>
                              <button
                                onClick={() => setAuthorAvatar(null)}
                                className="text-xs font-black text-red-500 hover:text-red-600 uppercase tracking-widest"
                              >
                                Remover foto
                              </button>
                            </div>
                          ) : (
                            // Área de upload
                            <div 
                              className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue hover:bg-blue-50/50 transition-all group"
                              onClick={() => document.getElementById('avatar-upload')?.click()}
                            >
                              <Upload className="w-6 h-6 text-slate-300 group-hover:text-brand-blue mb-1" />
                              <span className="text-[10px] font-black text-slate-400 group-hover:text-brand-blue uppercase tracking-widest">Upload</span>
                            </div>
                          )}
                          
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setAuthorAvatar(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <p className="text-[10px] text-slate-400 font-medium mt-3 leading-relaxed">Foto de perfil do aluno simulado</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo do Post */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">O que este usuário diria?</label>
                    
                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:text-white dark:text-white"><Bold size={18} /></button>
                        <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:text-white dark:text-white"><Italic size={18} /></button>
                        <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:text-white dark:text-white"><Underline size={18} /></button>
                        <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:text-white dark:text-white"><Strikethrough size={18} /></button>
                        <div className="w-px h-6 bg-slate-100 dark:bg-slate-700 mx-1 self-center" />
                        <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:text-white dark:text-white"><List size={18} /></button>
                        <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-900 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:text-white dark:text-white"><AlignLeft size={18} /></button>
                    </div>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Digite o depoimento ou dúvida do aluno..."
                        rows={6}
                        className="w-full p-6 bg-white text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-[2rem] focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all resize-none"
                    />
                </div>

                <div className="p-8">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Anexar Imagem (Opcional)</label>
                    <div className="border-4 border-dashed border-slate-50 rounded-[2rem] p-10 text-center hover:border-brand-blue hover:bg-blue-50/30 transition-all cursor-pointer group">
                        <ImageIcon className="w-10 h-10 text-slate-200 mx-auto mb-3 group-hover:scale-110 group-hover:text-brand-blue transition-all" />
                        <p className="text-slate-900 dark:text-white font-black text-sm tracking-tight">Carregar imagem do post</p>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-50 bg-slate-50/20 flex justify-end">
                    <Button
                        onClick={handlePublish}
                        className="h-16 px-12 font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20"
                        leftIcon={Send}
                    >
                        Publicar na Comunidade
                    </Button>
                </div>
            </div>
          </div>
        )}

        {/* Tab: Lista de Posts */}
        {activeTab === 'list' && (
          <div className="space-y-6 max-w-4xl">
            {posts.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-16 text-center shadow-sm">
                <p className="text-slate-400 font-bold">Nenhum post na comunidade ainda.</p>
              </div>
            ) : (
              posts.map((post, idx) => (
                <div key={post.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 overflow-hidden flex-shrink-0 shadow-sm">
                                {post.authorAvatar ? (
                                    <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <User size={24} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{post.authorName}</h4>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(post.createdAt)}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                            <button 
                                onClick={() => setDeleteModal({ open: true, postId: post.id })}
                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <p className="text-slate-700 font-bold leading-relaxed whitespace-pre-wrap text-lg mb-6">{post.content}</p>
                    
                    {/* Imagem (se tiver) */}
                    {post.image && (
                      <div className="mb-6 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                        <img src={post.image} alt="Post content" className="w-full object-cover max-h-96" />
                      </div>
                    )}

                    <div className="pt-6 border-t border-slate-50 flex items-center gap-8">
                        <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                            <Heart className="w-4 h-4 text-red-400" />
                            {post.likes} Curtidas
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            {post.comments} Comentários
                        </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de Exclusão */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setDeleteModal({ open: false, postId: null })} 
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Remover este post?
            </h3>
            <p className="text-slate-500 text-center mb-10 font-medium leading-relaxed">
              Esta ação removerá o post permanentemente da comunidade do seu aplicativo. Deseja continuar?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 transition-all active:scale-95"
              >
                Sim, excluir permanentemente
              </button>
              <button
                onClick={() => setDeleteModal({ open: false, postId: null })}
                className="w-full py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Cancelar e Manter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
