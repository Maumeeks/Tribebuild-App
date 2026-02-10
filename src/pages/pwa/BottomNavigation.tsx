import React, { useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, Newspaper, Users, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavigationProps {
  primaryColor?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  primaryColor = '#f59e0b'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // 1. Tenta pegar o slug do Router (useParams)
  // 2. Se falhar, pega o primeiro segmento da URL (ex: /001/home -> 001)
  const slug = params.appSlug || params.slug || location.pathname.split('/').filter(Boolean)[0];

  // Debug: Se a barra não aparecer, olhe o Console (F12) para ver isso:
  useEffect(() => {
    if (!slug) console.warn('BottomNavigation: Slug não detectado!', { params, pathname: location.pathname });
  }, [slug, params, location]);

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: `/${slug}/home`,
      enabled: true
    },
    {
      id: 'feed',
      label: 'Feed',
      icon: Newspaper,
      path: `/${slug}/feed`,
      enabled: true
    },
    {
      id: 'community',
      label: 'Comunidade',
      icon: Users,
      path: `/${slug}/community`,
      enabled: true
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      path: `/${slug}/profile`,
      enabled: true
    }
  ];

  const isActive = (itemId: string) => {
    const currentPath = location.pathname;

    if (itemId === 'home') {
      return currentPath.includes('/home') ||
        currentPath.includes('/product/') ||
        currentPath.includes('/lesson/');
    }
    if (itemId === 'feed') return currentPath.includes('/feed');
    if (itemId === 'community') return currentPath.includes('/community');
    if (itemId === 'profile') return currentPath.includes('/profile');

    return false;
  };

  const handleNavigation = (path: string, enabled: boolean) => {
    if (!enabled) {
      alert('Esta funcionalidade estará disponível em breve!');
      return;
    }

    if (slug) {
      navigate(path);
    } else {
      console.error("Erro Crítico: Slug perdido, não é possível navegar.");
      // Tenta recuperar voltando para home
      navigate('/');
    }
  };

  // Se realmente não tiver slug, não renderiza nada para não quebrar a UI
  if (!slug) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center pointer-events-none">
      <div className="w-full max-w-md pointer-events-auto">
        {/* Container Flutuante */}
        <div className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-3 pb-6 flex items-center justify-around shadow-2xl">
          {navItems.map((item) => {
            const active = isActive(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.enabled)}
                className={cn(
                  "flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all duration-300 min-w-[64px]",
                  active
                    ? "bg-slate-800 translate-y-[-4px] shadow-lg shadow-black/20"
                    : "hover:bg-slate-800/40 active:scale-95",
                  !item.enabled && "opacity-40 grayscale cursor-not-allowed"
                )}
              >
                <Icon
                  size={22}
                  className={cn("transition-all duration-300 mb-1.5", active && "animate-pulse-slow")}
                  style={{
                    color: active ? primaryColor : '#64748b',
                    strokeWidth: active ? 2.5 : 2
                  }}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold transition-colors tracking-wide",
                    active ? "text-white" : "text-slate-500"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;