import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Lock, ChevronRight, Bell, Search, Zap, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';

// Tipo para o Produto
type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: string;
  offer_type: string; // 'main', 'bonus', etc
};

export default function PwaHomePage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // --- LÓGICA DE BANNERS ROTATIVOS ---
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<HTMLDivElement>(null);

  // Mocks de Banner (Futuramente virá do banco 'banners' ou produtos 'upsell')
  const banners = [
    {
      id: 1,
      title: "Mentoria Elite",
      subtitle: "Acelere seus resultados em 30 dias",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
      badge: "Oportunidade"
    },
    {
      id: 2,
      title: "Comunidade VIP",
      subtitle: "Networking com os melhores",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      badge: "Exclusivo"
    },
    {
      id: 3,
      title: "Imersão Presencial",
      subtitle: "Garanta seu ingresso antecipado",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db48e?q=80&w=2060&auto=format&fit=crop",
      badge: "Evento"
    }
  ];

  // Auto-Play dos Banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000); // 4 Segundos

    return () => clearInterval(interval);
  }, [banners.length]);

  // Scroll suave quando o índice muda
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
        const sessionJson = localStorage.getItem(`@tribebuild:student:${appSlug}`);
        if (!sessionJson) {
          navigate(`/${appSlug}/login`);
          return;
        }
        setStudent(JSON.parse(sessionJson));

        const { data: app, error: appError } = await supabase
          .from('apps')
          .select('*')
          .eq('slug', appSlug)
          .single();

        if (appError) throw appError;
        setAppData(app);

        // Busca produtos REAIS
        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('app_id', app.id)
          .eq('status', 'published')
          .neq('offer_type', 'upsell') // Não mostra upsell na lista principal (vai pros banners futuramente)
          .order('created_at', { ascending: false });

        if (prodError) throw prodError;
        setProducts(productsData || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (appSlug) initPage();
  }, [appSlug, navigate]);

  if (loading || !appData) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-800 border-t-slate-500 rounded-full animate-spin"></div></div>;
  }

  return (
    // ✨ CORREÇÃO DESKTOP: Centraliza o app numa coluna de max-w-md (estilo celular) no meio da tela preta
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">

      <div className="w-full max-w-md bg-slate-950 min-h-screen relative shadow-2xl border-x border-slate-900/50 font-['inter'] text-white pb-24">

        {/* --- HEADER --- */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
              style={{ backgroundColor: appData.primary_color }}
            >
              {student?.name?.charAt(0) || student?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Olá, {student?.name?.split(' ')[0] || 'Aluno'}</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Bem-vindo de volta</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Search size={16} />
            </button>
            <button className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-slate-900"></span>
            </button>
          </div>
        </header>

        <main className="p-6 space-y-8 animate-fade-in">

          {/* --- 1. BANNERS ROTATIVOS --- */}
          <section className="relative group">
            {/* Scroll Container */}
            <div
              ref={bannerScrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {banners.map((banner, index) => (
                <div key={banner.id} className="snap-center shrink-0 w-full relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-black/40 mr-4 last:mr-0">
                  <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-700 hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <span
                      className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded mb-2 inline-block shadow-sm"
                      style={{ backgroundColor: appData.primary_color, color: 'white' }}
                    >
                      {banner.badge}
                    </span>
                    <h3 className="text-xl font-black text-white leading-tight mb-1">{banner.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-300 font-medium">{banner.subtitle}</p>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-1.5 mt-[-10px] relative z-10">
              {banners.map((_, idx) => (
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

          {/* --- 2. MEUS CURSOS (LISTA REAL) --- */}
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Play size={14} className="text-slate-500" /> Meus Cursos
              </h2>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{products.length} Disponíveis</span>
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
                      onClick={() => navigate(`/app/${appSlug}/product/${product.id}`)}
                      className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-4 hover:border-slate-700 transition-all cursor-pointer group active:scale-[0.98] shadow-sm relative overflow-hidden"
                    >
                      {/* Tag de Bônus (se houver) */}
                      {isBonus && (
                        <div className="absolute top-0 right-0 bg-green-500/10 text-green-500 text-[8px] font-black px-2 py-1 rounded-bl-xl border-l border-b border-green-500/20">
                          BÔNUS
                        </div>
                      )}

                      {/* Imagem (Esquerda) */}
                      <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-800 relative">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xl" style={{ backgroundColor: `${appData.primary_color}15`, color: appData.primary_color }}>
                            {product.name.charAt(0)}
                          </div>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                            <Play size={12} fill="white" className="text-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo (Direita) */}
                      <div className="flex-1 min-w-0 py-1">
                        <h3 className="text-sm font-bold text-white leading-tight mb-1 truncate pr-6">{product.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                          {product.description || "Toque para acessar o conteúdo."}
                        </p>

                        {/* Barra de Progresso Fictícia (Pode conectar depois com a tabela de progresso) */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-[0%] rounded-full" style={{ backgroundColor: appData.primary_color }}></div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-600">0%</span>
                        </div>
                      </div>

                      <ChevronRight size={16} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* --- 3. GAMIFICATION --- */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10"><Trophy size={80} /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-amber-400" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Nível 1</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Iniciante</h3>
              <p className="text-xs text-slate-400 mb-4 max-w-[200px]">Assista às aulas para subir de nível.</p>
              <button className="text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors">
                Ver Conquistas
              </button>
            </div>
          </div>

        </main>

        <BottomNavigation primaryColor={appData.primary_color} />
      </div>
    </div>
  );
}