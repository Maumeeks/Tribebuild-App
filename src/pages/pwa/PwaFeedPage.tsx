
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Heart,
  MessageCircle,
  FileText,
  Download,
  Image as ImageIcon,
  Link as LinkIcon,
  ExternalLink,
  Sparkles,
  MoreVertical,
  Bell,
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

// Tipos
interface PostAttachment {
  type: 'image' | 'file' | 'link';
  url: string;
  title?: string;
  thumbnail?: string;
}

interface FeedPost {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  attachments: PostAttachment[];
  likes: number;
  comments: number;
  liked: boolean;
  createdAt: string;
}

// Mock de posts
const mockPosts: FeedPost[] = [
  {
    id: '1',
    authorName: 'Academia Fit',
    authorAvatar: null,
    content: '🎉 Nova aula disponível!\n\nPessoal, acabei de liberar o módulo 4 com treinos avançados de hipertrofia. Corram lá conferir!\n\n#treino #hipertrofia #novidade',
    attachments: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800' }
    ],
    likes: 24,
    comments: 8,
    liked: false,
    createdAt: '2025-04-26T10:00:00'
  },
  {
    id: '2',
    authorName: 'Academia Fit',
    authorAvatar: null,
    content: '💧 Dica rápida: Não esqueçam de se hidratar durante os treinos!\n\nPelo menos 2 litros de água por dia, e mais se você treina intenso. A hidratação é essencial para sua performance e recuperação.',
    attachments: [],
    likes: 45,
    comments: 12,
    liked: true,
    createdAt: '2025-04-25T14:30:00'
  },
  {
    id: '3',
    authorName: 'Academia Fit',
    authorAvatar: null,
    content: '📎 Material exclusivo!\n\nBaixem a planilha de treino atualizada para abril. Organizei tudo certinho pra vocês seguirem direitinho o programa.',
    attachments: [
      { type: 'file', url: '#', title: 'Planilha_Treino_Abril_2025.pdf' }
    ],
    likes: 67,
    comments: 5,
    liked: false,
    createdAt: '2025-04-23T09:15:00'
  },
  {
    id: '4',
    authorName: 'Academia Fit',
    authorAvatar: null,
    content: '🔥 Live amanhã às 20h!\n\nVamos fazer um treino ao vivo juntos? Preparem-se! O link da live já está disponível abaixo.',
    attachments: [
      { type: 'link', url: 'https://youtube.com/live/xxxxx', title: 'Live: Treino em Casa Explosivo', thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800' }
    ],
    likes: 89,
    comments: 23,
    liked: true,
    createdAt: '2025-04-20T18:00:00'
  }
];

export default function PwaFeedPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const [posts, setPosts] = useState<FeedPost[]>(mockPosts);

  const appData = appSlug ? mockAppData[appSlug] : null;

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center ">
        <div className="space-y-4 animate-pulse">
           <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Carregando Feed...</p>
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

    if (diffMins < 1) return 'Agora mesmo';
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
            <h1 className="text-white font-black text-base tracking-tight leading-none">Novidades</h1>
            <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mt-0.5">Feed do {appData.name}</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-colors">
          <Bell className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Lista de Posts */}
      <main className="p-6 space-y-6 animate-slide-up">
        {posts.map((post, idx) => (
          <article 
            key={post.id}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Header do Post */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
                        style={{ backgroundColor: appData.primaryColor, boxShadow: `0 8px 15px -4px ${appData.primaryColor}40` }}
                    >
                        {appData.logo ? (
                            <img src={appData.logo} alt={post.authorName} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            post.authorName.charAt(0)
                        )}
                    </div>
                    <div>
                        <p className="font-black text-slate-900 tracking-tight leading-none">{post.authorName}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatRelativeTime(post.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Conteúdo do Post */}
            <div className="px-6 pb-6">
              <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-line">{post.content}</p>
            </div>

            {/* Anexos */}
            {post.attachments.length > 0 && (
              <div className="px-6 pb-6">
                {post.attachments.map((attachment, index) => (
                  <div key={index} className="rounded-[1.5rem] overflow-hidden">
                    {/* Imagem */}
                    {attachment.type === 'image' && (
                      <div className="relative group">
                          <img 
                            src={attachment.url} 
                            alt="Anexo"
                            className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}

                    {/* Arquivo Estilizado */}
                    {attachment.type === 'file' && (
                      <a
                        href={attachment.url}
                        download
                        className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-blue-50 hover:border-blue-100 transition-all group"
                      >
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm bg-white"
                        >
                          <FileText className="w-6 h-6" style={{ color: appData.primaryColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block font-black text-slate-800 text-sm truncate leading-tight">
                            {attachment.title}
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Download Disponível</span>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all border border-slate-100">
                          <Download className="w-4 h-4" />
                        </div>
                      </a>
                    )}

                    {/* Link Estilizado */}
                    {attachment.type === 'link' && (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-3xl overflow-hidden border border-slate-100 bg-white hover:border-blue-100 hover:shadow-xl transition-all group"
                      >
                        {attachment.thumbnail && (
                          <div className="h-40 overflow-hidden relative">
                              <img 
                                src={attachment.thumbnail} 
                                alt={attachment.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
                                  <LinkIcon size={16} />
                              </div>
                          </div>
                        )}
                        <div className="p-5 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <span className="block font-black text-slate-800 text-sm truncate leading-tight">
                                {attachment.title || attachment.url}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Acesse a Plataforma Externa</span>
                          </div>
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                             <ExternalLink size={18} />
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ações e Métricas */}
            <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2.5 transition-all active:scale-90"
                  >
                    <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                        post.liked ? "bg-red-50 text-red-500" : "bg-white text-slate-300 border border-slate-100 shadow-sm"
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

        {/* Fim do Feed - Visual Clean */}
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
             <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-slate-900 font-black tracking-tight leading-none text-base">Você está em dia! ✨</p>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-2 leading-relaxed">
            Não há novas publicações no momento.<br/>Fique atento às notificações!
          </p>
        </div>
      </main>

      {/* Footer Branding sutil */}
      <div className="text-center pb-12 opacity-30">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Tecnologia TribeBuild • Feed do Aluno
          </p>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation primaryColor={appData.primaryColor} />
    </div>
  );
}
