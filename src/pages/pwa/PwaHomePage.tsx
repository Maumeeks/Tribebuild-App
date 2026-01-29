import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  ChevronRight,
  Bell,
  Search,
  Zap,
  Trophy,
  Loader2,
  MessageCircle,
  Mail as MailIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

// Tipos
type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: string;
  offer_type: string;
};

type ProductWithProgress = Product & {
  progress: number;
  total_lessons: number;
  completed_lessons: number;
};

export default function PwaHomePage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [products, setProducts] = useState<ProductWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<HTMLDivElement>(null);

  const mockBanners = [
    {
      id: 1,
      title: "Mentoria Elite",
      subtitle: "Acelere seus resultados em 30 dias",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
      badge: "Oportunidade",
      link: "#"
    },
    {
      id: 2,
      title: "Comunidade VIP",
      subtitle: "Networking com os melhores",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      badge: "Exclusivo",
      link: "#"
    },
    {
      id: 3,
      title: "Imersão Presencial",
      subtitle: "Garanta seu ingresso antecipado",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db48e?q=80&w=2060&auto=format&fit=crop",
      badge: "Evento",
      link: "#"
    }
  ];

  const realBanners = appData?.banners
    ?.filter((b: any) => b.image_url)
    .map((b: any, idx: number) => ({
      id: idx + 1,
      title: `Banner ${idx + 1}`,
      subtitle: "Toque para saber mais",
      image: b.image_url,
      badge: "Novidade",
      link: b.link || "#"
    })) || [];

  const banners = realBanners.length > 0 ? realBanners : mockBanners;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    if (bannerScrollRef.current) {
      const width = bannerScrollRef.current.offsetWidth;
      bannerScrollRef.current.scrollTo({
        left: currentBannerIndex * width,
        behavior: 'smooth'
      });
    }
  }, [currentBannerIndex]);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);

        const sessionJson = localStorage.getItem(`@tribebuild:student:${appSlug}`);
        if (!sessionJson) {
          navigate(`/${appSlug}/login`);
          return;
        }
        const session = JSON.parse(sessionJson);

        const { data: app, error: appError } = await supabase
          .from('apps')
          .select('*')
          .eq('slug', appSlug)
          .single();

        if (appError) throw appError;
        setAppData(app);

        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('app_id', app.id)
          .eq('email', session.email)
          .single();

        if (clientError || !clientData) {
          localStorage.removeItem(`@tribebuild:student:${appSlug}`);
          navigate(`/${appSlug}/login`);
          return;
        }

        setClient(clientData);

        const { data: clientProducts, error: cpError } = await supabase
          .from('client_products')
          .select(`
            *,
            products (
              id,
              name,
              description,
              image_url,
              status,
              offer_type
            )
          `)
          .eq('client_id', clientData.id)
          .eq('status', 'active');

        if (cpError) throw cpError;

        const productsWithProgress: ProductWithProgress[] = [];

        for (const cp of clientProducts || []) {
          const product = cp.products;
          if (!product) continue;

          const { data: modules } = await supabase
            .from('modules')
            .select('id')
            .eq('product_id', product.id);

          const moduleIds = modules?.map(m => m.id) || [];

          const { data: lessons } = await supabase
            .from('lessons')
            .select('id')
            .in('module_id', moduleIds);

          const totalLessons = lessons?.length || 0;

          const { data: progress } = await supabase
            .from('client_progress')
            .select('id')
            .eq('client_id', clientData.id)
            .eq('completed', true)
            .in('lesson_id', lessons?.map(l => l.id) || []);

          const completedLessons = progress?.length || 0;
          const progressPercent = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

          productsWithProgress.push({
            ...product,
            progress: progressPercent,
            total_lessons: totalLessons,
            completed_lessons: completedLessons
          });
        }

        productsWithProgress.sort((a, b) => {
          if (a.progress > 0 && b.progress === 0) return -1;
          if (a.progress === 0 && b.progress > 0) return 1;
          return b.progress - a.progress;
        });

        setProducts(productsWithProgress);

      } catch (err) {
        console.error('Erro ao carregar home:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug) initPage();
  }, [appSlug, navigate]);

  const handleSupport = () => {
    if (!appData) return;

    if (appData.support_type === 'email' && appData.support_value) {
      window.location.href = `mailto:${appData.support_value}?subject=Suporte - ${appData.name}`;
    } else if (appData.support_type === 'whatsapp' && appData.support_value) {
      const phone = appData.support_value.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=Olá, preciso de suporte!`, '_blank');
    }
  };

  if (loading || !appData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-950 min-h-screen relative shadow-2xl border-x border-slate-900/50 font-['inter'] text-white pb-24">

        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
              style={{ backgroundColor: appData.primary_color }}
            >
              {client?.full_name?.charAt(0) || client?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">
                Olá, {client?.full_name?.split(' ')[0] || 'Aluno'}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Bem-vindo de volta
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Search size={16} />
            </button>
            <button className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-slate-900" />
            </button>
          </div>
        </header>

        <main className="p-6 space-y-8 animate-fade-in">

          <section className="relative group">
            <div
              ref={bannerScrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {banners.map((banner: any) => (
                <a
                  key={banner.id}
                  href={banner.link}
                  target={banner.link.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="snap-center shrink-0 w-full relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-black/40 mr-4 last:mr-0"
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <span
                      className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded mb-2 inline-block shadow-sm"
                      style={{ backgroundColor: appData.primary_color, color: 'white' }}
                    >
                      {banner.badge}
                    </span>
                    <h3 className="text-xl font-black text-white leading-tight mb-1">
                      {banner.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-300 font-medium">{banner.subtitle}</p>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-[-10px] relative z-10">
              {banners.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    idx === currentBannerIndex ? "w-4 bg-white" : "bg-slate-700 hover:bg-slate-600"
                  )}
                />
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Play size={14} className="text-slate-500" /> Meus Cursos
            </h2>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              {products.length} Disponíveis
            </span>
          </div>

          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                <p className="text-slate-500 text-xs">Você ainda não tem cursos liberados.</p>
              </div>
            ) : (
              products.map((product) => {
                const isBonus = product.offer_type === 'bonus';

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/${appSlug}/product/${product.id}`)}
                    className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-all cursor-pointer group active:scale-[0.98] shadow-sm relative overflow-hidden"
                  >
                    {isBonus && (
                      <div className="absolute top-0 right-0 bg-green-500/10 text-green-500 text-[8px] font-black px-2 py-1 rounded-bl-xl border-l border-b border-green-500/20">
                        BÔNUS
                      </div>
                    )}

                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-800 relative">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xl"
                          style={{
                            backgroundColor: `${appData.primary_color}15`,
                            color: appData.primary_color
                          }}
                        >
                          {product.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                          <Play size={12} fill="white" className="text-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="text-sm font-bold text-white leading-tight mb-1 truncate pr-6">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {product.description || "Toque para acessar o conteúdo."}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: appData.primary_color,
                              width: `${product.progress}%`
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-600">
                          {product.progress}%
                        </span>
                      </div>

                      {product.total_lessons > 0 && (
                        <p className="text-[9px] text-slate-600 mt-1">
                          {product.completed_lessons}/{product.total_lessons} aulas
                        </p>
                      )}
                    </div>

                    <ChevronRight size={16} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                  </div>
                );
              })
            )}
          </div>

          {/* Card de nível - agora dentro de um container fechado */}
          <div className="px-4 pb-6">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Trophy size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-amber-400" />
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    Nível 1
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Iniciante</h3>
                <p className="text-xs text-slate-400 mb-4 max-w-[200px]">
                  Assista às aulas para subir de nível.
                </p>
                <button className="text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors">
                  Ver Conquistas
                </button>
              </div>
            </div>
          </div>

        </main>

        {/* Botão de suporte flutuante */}
        {appData.support_type && appData.support_value && (
          <button
            onClick={handleSupport}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 z-40"
            style={{
              backgroundColor: appData.primary_color,
              boxShadow: `0 10px 30px ${appData.primary_color}40`
            }}
          >
            {appData.support_type === 'email' ? (
              <MailIcon size={20} />
            ) : (
              <MessageCircle size={20} />
            )}
          </button>
        )}

        <BottomNavigation primaryColor={appData.primary_color} />
      </div>
    </div>
  );
}