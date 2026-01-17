
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Added X to the lucide-react imports
import { Play, Lock, Clock, ChevronRight, Gift, ExternalLink, Bell, Sparkles, Trophy, X } from 'lucide-react';
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

// Mock de usuário logado
const mockUser = {
  name: 'Maria',
  email: 'maria@email.com',
  avatar: null
};

// Mock de produtos do usuário
const mockProducts = [
  {
    id: '1',
    name: 'Treino Completo',
    image: null,
    totalLessons: 12,
    completedLessons: 7,
    status: 'available',
    lastLesson: {
      module: 'Módulo 3',
      lesson: 'Aula 5',
      title: 'Treino de Pernas'
    }
  },
  {
    id: '2',
    name: 'Nutrição Fitness',
    image: null,
    totalLessons: 8,
    completedLessons: 2,
    status: 'available',
    lastLesson: null
  },
  {
    id: '3',
    name: 'Mindset Campeão',
    image: null,
    totalLessons: 5,
    completedLessons: 0,
    status: 'available',
    lastLesson: null
  },
  {
    id: '4',
    name: 'Bônus: Receitas Fit',
    image: null,
    totalLessons: 10,
    completedLessons: 0,
    status: 'locked',
    releaseDate: '2025-05-03',
    lastLesson: null
  }
];

// Mock de order bump
const mockOrderBump = {
  id: 'ob1',
  title: 'Módulo Avançado',
  description: 'Leve seu treino para o próximo nível com técnicas de fisiculturismo.',
  originalPrice: 197,
  price: 97,
  discount: 50,
  checkoutUrl: 'https://pay.hotmart.com/XXXXX'
};

export default function PwaHomePage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();
  const [showOrderBump, setShowOrderBump] = useState(true);

  // Buscar dados do app
  const appData = appSlug ? mockAppData[appSlug] : null;

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center ">
        <div className="space-y-4 animate-pulse">
           <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Buscando Aplicativo...</p>
        </div>
      </div>
    );
  }

  // Calcular progresso
  const getProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Formatar data de liberação
  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Disponível';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays <= 7) return `Em ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  // Encontrar produto com último acesso
  const lastAccessedProduct = mockProducts.find(p => p.lastLesson && p.status === 'available');

  return (
    <div className="min-h-screen bg-slate-50 pb-24 ">
      {/* Header Estilizado */}
      <header 
        className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg"
        style={{ 
            backgroundColor: appData.primaryColor,
            boxShadow: `0 4px 20px ${appData.primaryColor}20` 
        }}
      >
        <div className="flex items-center gap-4">
          {appData.logo ? (
            <img src={appData.logo} alt={appData.name} className="w-10 h-10 rounded-xl object-cover shadow-inner" />
          ) : (
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-sm">
              <span className="text-white font-black text-xl leading-none">
                {appData.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-white font-black tracking-tight leading-none text-base">{appData.name}</h2>
            <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mt-1">Área do Aluno</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-colors border border-white/10">
          <Bell className="w-5 h-5 text-white" />
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="p-6 space-y-8 animate-slide-up">
        {/* Saudação */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Olá, {mockUser.name}! 👋
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">É bom ter você de volta</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
             <Trophy className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Card de Continuar Assistindo - Estilo Tribe Elite */}
        {lastAccessedProduct && lastAccessedProduct.lastLesson && (
          <div 
            className="rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl group active:scale-[0.98] transition-all"
            style={{ 
                backgroundColor: appData.primaryColor,
                boxShadow: `0 20px 40px -10px ${appData.primaryColor}40`
            }}
          >
            {/* Efeitos visuais */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-widest mb-4">
                <Play className="w-3 h-3 fill-current" />
                <span>Continuar de onde parou</span>
                </div>
                
                <h3 className="text-2xl font-black mb-1 tracking-tight leading-tight">
                {lastAccessedProduct.lastLesson.title}
                </h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-8">
                {lastAccessedProduct.lastLesson.module} • {lastAccessedProduct.lastLesson.lesson}
                </p>

                <button 
                onClick={() => navigate(`/app/${appSlug}/product/${lastAccessedProduct.id}`)}
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all group"
                style={{ color: appData.primaryColor }}
                >
                Retomar Aula
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
          </div>
        )}

        {/* Meus Produtos - Grid Visual */}
        <div>
          <div className="flex items-center gap-3 mb-6">
             <div className="w-2 h-2 rounded-full bg-blue-400" />
             <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Seu Conteúdo
             </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            {mockProducts.map((product, idx) => {
              const progress = getProgress(product.completedLessons, product.totalLessons);
              const isLocked = product.status === 'locked';
              
              return (
                <div
                  key={product.id}
                  onClick={() => !isLocked && navigate(`/app/${appSlug}/product/${product.id}`)}
                  className={cn(
                    "bg-white rounded-[2rem] border-2 overflow-hidden transition-all duration-300 animate-slide-up",
                    isLocked 
                        ? 'opacity-60 grayscale border-slate-100' 
                        : 'cursor-pointer hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 active:scale-95 border-transparent shadow-sm'
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Imagem ou Placeholder com Cor do App */}
                  <div 
                    className="h-28 flex items-center justify-center relative group"
                    style={{ backgroundColor: isLocked ? '#F1F5F9' : `${appData.primaryColor}08` }}
                  >
                    {isLocked ? (
                      <div className="bg-white p-3 rounded-2xl shadow-sm">
                        <Lock className="w-6 h-6 text-slate-300" />
                      </div>
                    ) : product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/10"
                        style={{ backgroundColor: appData.primaryColor }}
                      >
                        {product.name.charAt(0)}
                      </div>
                    )}

                    {!isLocked && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-[8px] font-black text-slate-400 uppercase border border-white">
                            {product.totalLessons} Aulas
                        </div>
                    )}
                  </div>
                  
                  {/* Info do Produto */}
                  <div className="p-5">
                    <h3 className="font-black text-slate-900 text-sm tracking-tight leading-tight line-clamp-2 min-h-[40px]">
                      {product.name}
                    </h3>
                    
                    {isLocked ? (
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">
                        <Clock className="w-3 h-3" />
                        <span>Libera {formatReleaseDate(product.releaseDate!)}</span>
                      </div>
                    ) : (
                      <div className="mt-5 space-y-2">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: appData.primaryColor 
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{progress}% concluído</span>
                            {progress === 100 && <Sparkles className="w-3 h-3 text-amber-400" />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Bump / Oferta Especial - Premium Glassmorphism */}
        {showOrderBump && mockOrderBump && (
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden animate-slide-up shadow-2xl shadow-slate-900/20" style={{ animationDelay: '400ms' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                            <Gift className="w-4 h-4 text-slate-900" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">OFERTA VIP</span>
                    </div>
                    <button 
                        onClick={() => setShowOrderBump(false)}
                        className="text-white/30 hover:text-white transition-colors p-2"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                <h3 className="text-xl font-black text-white mb-2 tracking-tight leading-tight">
                {mockOrderBump.title}
                </h3>
                <p className="text-white/50 text-xs font-medium mb-6 leading-relaxed">
                {mockOrderBump.description}
                </p>
                
                <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div>
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">De R$ {mockOrderBump.originalPrice}</p>
                        <p className="text-2xl font-black text-white tracking-tighter">R$ {mockOrderBump.price}</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-[10px] font-black rounded-xl uppercase tracking-tighter border border-green-500/20">
                        -{mockOrderBump.discount}% OFF
                    </span>
                </div>
                
                <a 
                href={mockOrderBump.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 flex items-center justify-center gap-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.15em] text-xs hover:bg-slate-100 transition-all shadow-xl"
                >
                Garantir Desconto
                <ExternalLink className="w-4 h-4" />
                </a>
            </div>
          </div>
        )}
      </main>

      {/* Powered by / Footer sutil */}
      <div className="text-center pb-12 pt-4 px-6 opacity-30">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Tecnologia TribeBuild • White-Label PWA
          </p>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation primaryColor={appData.primaryColor} />
    </div>
  );
}
