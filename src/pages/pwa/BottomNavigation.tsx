import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

  // Extrair appSlug da URL automaticamente
  const pathParts = location.pathname.split('/');
  const slug = pathParts[1] || '';

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: `/${slug}/home`
    },
    {
      id: 'feed',
      label: 'Feed',
      icon: Newspaper,
      path: `/${slug}/feed`
    },
    {
      id: 'community',
      label: 'Comunidade',
      icon: Users,
      path: `/${slug}/community`
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      path: `/${slug}/profile`
    },
  ];

  const isActive = (itemId: string) => {
    const currentPath = location.pathname;

    if (itemId === 'home') {
      // Home é ativa na home, product e lesson pages
      return currentPath.includes('/home') ||
        currentPath.includes('/product/') ||
        currentPath.includes('/lesson/');
    }
    if (itemId === 'feed') return currentPath.includes('/feed');
    if (itemId === 'community') return currentPath.includes('/community');
    if (itemId === 'profile') return currentPath.includes('/profile');

    return false;
  };

  const handleNavigation = (path: string, itemId: string) => {
    // Páginas que ainda não existem mostram alerta
    if (['feed', 'community', 'profile'].includes(itemId)) {
      alert('Esta funcionalidade estará disponível em breve!');
      return;
    }
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md pointer-events-auto">
        <div className="bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 min-w-[64px]",
                  active
                    ? "bg-slate-800"
                    : "hover:bg-slate-800/50 active:scale-95"
                )}
              >
                <Icon
                  size={20}
                  className="transition-colors mb-1"
                  style={{ color: active ? primaryColor : '#64748b' }}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold transition-colors",
                    active ? "text-white" : "text-slate-500"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Safe area para iPhone */}
        <div className="h-safe-area-inset-bottom bg-slate-900/95" />
      </div>
    </nav>
  );
};

export default BottomNavigation;