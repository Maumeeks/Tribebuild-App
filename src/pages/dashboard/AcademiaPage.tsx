import React, { useState } from 'react';
import {
  Play,
  BookOpen,
  Rocket,
  Palette,
  DollarSign,
  Settings,
  Search,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';

// --- DADOS DOS VÍDEOS (MOCK) ---
const categories = [
  { id: 'start', label: 'Comece Aqui', icon: Rocket },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'sales', label: 'Marketing', icon: DollarSign },
  { id: 'advanced', label: 'Avançado', icon: Settings },
];

const videos = [
  {
    id: '1',
    category: 'start',
    title: 'Bem-vindo ao TribeBuild',
    duration: '02:30',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    description: 'Entenda como a plataforma funciona e dê o primeiro passo estratégico.',
    videoId: 'dQw4w9WgXcQ'
  },
  {
    id: '2',
    category: 'start',
    title: 'Criando seu primeiro App',
    duration: '05:45',
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
    description: 'O passo a passo completo para tirar sua ideia do papel e publicar.',
    videoId: 'dQw4w9WgXcQ'
  },
  {
    id: '3',
    category: 'design',
    title: 'Identidade Visual Matadora',
    duration: '08:20',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    description: 'Como escolher cores e logos que geram confiança e conversão.',
    videoId: 'dQw4w9WgXcQ'
  },
  {
    id: '4',
    category: 'sales',
    title: 'Configurando o Pixel do Facebook',
    duration: '12:10',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    description: 'Rastreie seus usuários e otimize suas campanhas de tráfego pago.',
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

  const activeVideoData = videos.find(v => v.id === playingVideo);

  return (
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-brand-blue" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Learning Center</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Academia TribeBuild</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Aprenda a criar, gerenciar e escalar seus aplicativos.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar aula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-medium"
          />
        </div>
      </div>

      {/* Categorias (Pills Style) */}
      {!playingVideo && (
        <div className="flex flex-wrap gap-2 animate-slide-up">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border",
                activeTab === cat.id
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Area de Conteúdo */}
      <div className="animate-slide-up">
        {playingVideo ? (
          <div className="space-y-6">
            {/* Player Container */}
            <div className="bg-black rounded-xl overflow-hidden shadow-2xl aspect-video relative ring-1 ring-white/10">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${activeVideoData?.videoId}?autoplay=1`}
                title="TribeBuild Academy"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setPlayingVideo(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-lg transition-all border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Info After Player */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-2">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{activeVideoData?.title}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-3xl">{activeVideoData?.description}</p>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Voltar para Lista
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setPlayingVideo(video.id)}
                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-brand-blue/50 dark:hover:border-brand-blue/50 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay Play */}
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 border border-white/30 shadow-2xl">
                      <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                    </div>
                  </div>
                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-brand-blue transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-8">
                    {video.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Conteúdo Gratuito
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase">Assista Agora</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredVideos.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <Search className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Nenhum tutorial encontrado nesta categoria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademiaPage;