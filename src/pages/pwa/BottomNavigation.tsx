import React from 'react';
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

  // Captura o slug da URL (ex: '001')
  const { appSlug } = useParams<{ appSlug: string }>();

  // Garante que temos um slug válido, senão tenta pegar da URL bruta
  const slug = appSlug || location.pathname.split('/').filter(Boolean)[0] || '';

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
      enabled: true // ✅ HABILITADO
    },
    {
      id: 'community',
      label: 'Comunidade',
      icon: Users,
      path: `/${slug}/community`,
      enabled: true // ✅ HABILITADO
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
      console.error("Slug não encontrado, navegação bloqueada");
    }
  };

  if (!slug) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md pointer-events-auto">
        {/* Container com Blur e Borda */}
        <div className="bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around pb-safe">
          {navItems.map((item) => {
            const active = isActive(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.enabled)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 min-w-[64px]",
                  active
                    ? "bg-slate-800"
                    : "hover:bg-slate-800/50 active:scale-95",
                  !item.enabled && "opacity-50 grayscale"
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

        {/* Espaçador para iPhone (Safe Area) */}
        <div className="h-safe-area-inset-bottom bg-slate-900/95" />
      </div>
    </nav>
  );
};

export default BottomNavigation;