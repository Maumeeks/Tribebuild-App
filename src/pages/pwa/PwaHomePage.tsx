import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  ChevronRight,
  ChevronLeft,
  Bell,
  Search,
  Loader2,
  MessageCircle,
  Mail as MailIcon,
  Lock,
  Star,
  Gift,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

// Tipos
type Product = {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  offer_type: string;
};

type ProductWithProgress = Product & {
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  isLocked?: boolean;
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

  // Mock de banners (fallback)
  const mockBanners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
      link: "#"
    },
  ];

  // Banners reais do banco (SEM título)
  const realBanners = appData?.banners
    ?.filter((b: any) => b.image_url)
    .map((b: any, idx: number) => ({
      id: idx + 1,
      image: b.image_url,
      link: b.link || "#"
    })) || [];

  const banners = realBanners.length > 0 ? realBanners : mockBanners;

  // Auto-Play dos banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Scroll do banner
  useEffect(() => {
    if (bannerScrollRef.current) {
      const width = bannerScrollRef.current.offsetWidth;
      bannerScrollRef.current.scrollTo({
        left: currentBannerIndex * width,
        behavior: 'smooth'
      });
    }
  }, [currentBannerIndex]);

  const goToNextBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrevBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleBannerClick = (link: string) => {
    if (link && link !== '#') {
      window.open(link, '_blank');
    }
  };

  // Inicialização
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

        // 1. Buscar produtos que o cliente TEM ACESSO
        const { data: clientProducts } = await supabase
          .from('client_products')
          .select(`
            *,
            products (
              id,
              name,
              description,
              thumbnail_url,
              status,
              offer_type
            )
          `)
          .eq('client_id', clientData.id)
          .eq('status', 'active');

        const clientProductIds = clientProducts?.map(cp => cp.products?.id).filter(Boolean) || [];

        // 2. Buscar TODOS os produtos do app (para mostrar upsells bloqueados)
        const { data: allAppProducts } = await supabase
          .from('products')
          .select('*')
          .eq('app_id', app.id)
          .eq('status', 'active');

        const productsWithProgress: ProductWithProgress[] = [];

        // Processar produtos que o cliente TEM
        for (const cp of clientProducts || []) {
          const product = cp.products;
          if (!product) continue;

          const { data: modules } = await supabase
            .from('modules')
            .select('id')
            .eq('product_id', product.id);

          const moduleIds = modules?.map(m => m.id) || [];

          let totalLessons = 0;
          let completedLessons = 0;

          if (moduleIds.length > 0) {
            const { data: lessons } = await supabase
              .from('lessons')
              .select('id')
              .in('module_id', moduleIds);

            totalLessons = lessons?.length || 0;

            if (lessons && lessons.length > 0) {
              const { data: progress } = await supabase
                .from('client_progress')
                .select('id')
                .eq('client_id', clientData.id)
                .eq('completed', true)
                .in('lesson_id', lessons.map(l => l.id));

              completedLessons = progress?.length || 0;
            }
          }

          const progressPercent = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

          productsWithProgress.push({
            ...product,
            progress: progressPercent,
            total_lessons: totalLessons,
            completed_lessons: completedLessons,
            isLocked: false
          });
        }

        // 3. Adicionar produtos UPSELL/DOWNSELL que o cliente NÃO TEM
        for (const product of allAppProducts || []) {
          const isUpsellType = ['upsell', 'downsell', 'order_bump'].includes(product.offer_type);
          const clientAlreadyHas = clientProductIds.includes(product.id);

          if (isUpsellType && !clientAlreadyHas) {
            productsWithProgress.push({
              ...product,
              progress: 0,
              total_lessons: 0,
              completed_lessons: 0,
              isLocked: true
            });
          }
        }

        // Ordenar: em progresso > não iniciados > bloqueados
        productsWithProgress.sort((a, b) => {
          if (a.isLocked && !b.isLocked) return 1;
          if (!a.isLocked && b.isLocked) return -1;
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

  const primaryColor = appData.primary_color || '#f59e0b';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      <div className="w-full max-w-md bg-slate-950 min-h-screen relative shadow-2xl border-x border-slate-900/50 font-['Inter'] text-white pb-24">

        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/50 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {client?.full_name?.charAt(0) || client?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">
                Olá, {client?.full_name?.split(' ')[0] || 'Aluno'}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                Bem-vindo de volta
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all">
              <Search size={18} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950" />
            </button>
          </div>
        </header>

        <main className="p-5 space-y-6">

          {/* BANNER - SEM TEXTO */}
          <section className="relative">
            <div
              ref={bannerScrollRef}
              className="flex overflow-x-hidden snap-x snap-mandatory scroll-smooth"
            >
              {banners.map((banner: any) => (
                <div
                  key={banner.id}
                  className="snap-center shrink-0 w-full relative h-44 rounded-2xl overflow-hidden cursor-pointer shadow-lg"
                  onClick={() => handleBannerClick(banner.link)}
                >
                  <img
                    src={banner.image}
                    alt="Banner"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  {/* Texto sutil */}
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <p className="text-[10px] text-white/40 font-medium">
                      Toque para saber mais
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Botões de navegação */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={goToPrevBanner}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 transition-all z-10"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={goToNextBanner}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/60 transition-all z-10"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Indicadores */}
            {banners.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {banners.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBannerIndex(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      idx === currentBannerIndex
                        ? "w-6"
                        : "w-1.5 bg-slate-700 hover:bg-slate-600"
                    )}
                    style={idx === currentBannerIndex ? { backgroundColor: primaryColor } : {}}
                  />
                ))}
              </div>
            )}
          </section>

          {/* MEUS CURSOS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Play size={14} style={{ color: primaryColor }} /> Meus Cursos
              </h2>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {products.filter(p => !p.isLocked).length} Disponíveis
              </span>
            </div>

            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                  <p className="text-slate-500 text-sm">Você ainda não tem cursos liberados.</p>
                </div>
              ) : (
                products.map((product) => {
                  const isBonus = product.offer_type === 'bonus';
                  const isUpsell = product.offer_type === 'upsell';
                  const isDownsell = product.offer_type === 'downsell';
                  const isOrderBump = product.offer_type === 'order_bump';
                  const isLocked = product.isLocked;

                  const getBadge = () => {
                    if (isBonus) return { text: 'BÔNUS', color: 'emerald', icon: Gift };
                    if (isUpsell) return { text: 'PREMIUM', color: 'amber', icon: Lock };
                    if (isDownsell) return { text: 'OFERTA', color: 'blue', icon: Star };
                    if (isOrderBump) return { text: 'EXTRA', color: 'purple', icon: Star };
                    return null;
                  };

                  const badge = getBadge();

                  return (
                    <div
                      key={product.id}
                      onClick={() => !isLocked && navigate(`/${appSlug}/product/${product.id}`)}
                      className={cn(
                        "bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 transition-all cursor-pointer group relative overflow-hidden",
                        isLocked
                          ? "opacity-80"
                          : "hover:border-slate-700 active:scale-[0.98]"
                      )}
                    >
                      {/* Badge */}
                      {badge && (
                        <div
                          className={cn(
                            "absolute top-0 right-0 text-[8px] font-bold px-2.5 py-1 rounded-bl-xl border-l border-b flex items-center gap-1",
                            badge.color === 'emerald' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                            badge.color === 'amber' && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                            badge.color === 'blue' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                            badge.color === 'purple' && "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          )}
                        >
                          <badge.icon size={10} />
                          {badge.text}
                        </div>
                      )}

                      {/* THUMBNAIL */}
                      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-800 relative">
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={cn(
                            "w-full h-full flex items-center justify-center text-2xl font-bold absolute inset-0",
                            product.thumbnail_url ? "hidden" : ""
                          )}
                          style={{
                            backgroundColor: `${primaryColor}20`,
                            color: primaryColor
                          }}
                        >
                          {product.name.charAt(0)}
                        </div>

                        {!isLocked && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <Play size={16} fill="white" className="text-white ml-0.5" />
                            </div>
                          </div>
                        )}

                        {isLocked && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Lock size={24} className="text-white/60" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 py-1">
                        <h3 className="text-sm font-bold text-white leading-tight mb-1 truncate pr-8">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                          {product.description || "Toque para acessar o conteúdo."}
                        </p>

                        {!isLocked && (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    backgroundColor: primaryColor,
                                    width: `${product.progress}%`
                                  }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">
                                {product.progress}%
                              </span>
                            </div>

                            {product.total_lessons > 0 && (
                              <p className="text-[10px] text-slate-600 mt-1.5">
                                {product.completed_lessons}/{product.total_lessons} aulas
                              </p>
                            )}
                          </>
                        )}

                        {isLocked && (
                          <button
                            className="mt-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                            style={{
                              backgroundColor: `${primaryColor}20`,
                              color: primaryColor
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Abrir checkout do produto');
                            }}
                          >
                            <ShoppingCart size={12} />
                            Liberar Acesso
                          </button>
                        )}
                      </div>

                      {!isLocked && (
                        <ChevronRight size={18} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </main>

        {/* Botão de Suporte */}
        {appData.support_type && appData.support_value && (
          <button
            onClick={handleSupport}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-xl shadow-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 z-40"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 10px 30px ${primaryColor}40`
            }}
          >
            {appData.support_type === 'email' ? (
              <MailIcon size={22} />
            ) : (
              <MessageCircle size={22} />
            )}
          </button>
        )}

        <BottomNavigation primaryColor={primaryColor} />
      </div>
    </div>
  );
}