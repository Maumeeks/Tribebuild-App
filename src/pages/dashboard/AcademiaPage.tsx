import React, { useState } from 'react';
import { 
  Play, 
  BookOpen, 
  Rocket, 
  Palette, 
  DollarSign, 
  Settings,
  Search,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';

// --- DADOS DOS VÍDEOS (MOCK) ---
const categories = [
  { id: 'start', label: 'Primeiros Passos', icon: Rocket },
  { id: 'design', label: 'Design & Customização', icon: Palette },
  { id: 'sales', label: 'Vendas & Marketing', icon: DollarSign },
  { id: 'advanced', label: 'Configurações Avançadas', icon: Settings },
];

const videos = [
  {
    id: '1',
    category: 'start',
    title: 'Bem-vindo ao TribeBuild',
    duration: '02:30',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    description: 'Entenda como a plataforma funciona e dê o primeiro passo.',
    videoId: 'dQw4w9WgXcQ' // Exemplo
  },
  {
    id: '2',
    category: 'start',
    title: 'Criando seu primeiro App',
    duration: '05:45',
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
    description: 'O passo a passo completo para tirar sua ideia do papel.',
    videoId: 'dQw4w9WgXcQ'
  },
  {
    id: '3',
    category: 'design',
    title: 'Identidade Visual Matadora',
    duration: '08:20',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    description: 'Como escolher cores e logos que convertem.',
    videoId: 'dQw4w9WgXcQ'
  },
  {
    id: '4',
    category: 'sales',
    title: 'Configurando o Pixel do Facebook',
    duration: '12:10',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    description: 'Rastreie seus usuários e otimize suas campanhas.',
    videoId: 'dQw4w9WgXcQ'
  }
];

const AcademiaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('start');
  const [search, setSearch] = useState('');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const filteredVideos = videos.filter(video => {
    const matchesTab = video.category === activeTab;
    const matchesSearch = video.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 font-['Inter'] pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-brand-blue">
               <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-brand-blue uppercase tracking-widest">Central de Conhecimento</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Academia TribeBuild</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xl">
            Tutoriais, estratégias e guias práticos para você escalar seus aplicativos.
          </p>
        </div>

        <div className="relative w-full md:w-72">
           <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
           </div>
           <input 
             type="text" 
             placeholder="Buscar aula..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold transition-all"
           />
        </div>
      </div>

      {/* Categorias (Tabs) */}
      <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveTab(cat.id); setPlayingVideo(null); }}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
              activeTab === cat.id
                ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-500/20"
                : "bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Vídeos */}
      {playingVideo ? (
         // Player de Vídeo (Simulado)
         <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in aspect-video relative group">
            <div className="absolute inset-0 flex items-center justify-center">
               <iframe 
                 width="100%" 
                 height="100%" 
                 src={`https://www.youtube.com/embed/${videos.find(v => v.id === playingVideo)?.videoId || 'dQw4w9WgXcQ'}?autoplay=1`} 
                 title="YouTube video player" 
                 frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
               ></iframe>
            </div>
            <button 
              onClick={() => setPlayingVideo(null)}
              className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              Fechar Aula
            </button>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {filteredVideos.map((video) => (
            <div 
              key={video.id}
              onClick={() => setPlayingVideo(video.id)}
              className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden">
                 <img 
                   src={video.thumbnail} 
                   alt={video.title} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Play className="w-6 h-6 text-white fill-current ml-1" />
                    </div>
                 </div>
                 <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white">
                    {video.duration}
                 </div>
              </div>
              <div className="p-6">
                 <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-brand-blue transition-colors">
                   {video.title}
                 </h3>
                 <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                   {video.description}
                 </p>
                 <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" />
                    Assistir Agora
                 </div>
              </div>
            </div>
          ))}
          
          {filteredVideos.length === 0 && (
             <div className="col-span-full py-20 text-center">
                <p className="text-slate-400 font-bold">Nenhuma aula encontrada nesta categoria.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademiaPage;