import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Link2,
  Users,
  CreditCard,
  Globe,
  Gift,
  GraduationCap,
  LogOut,
  Menu,
  ChevronDown,
  Settings,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import MobileMenu from './MobileMenu';
import TribeBuildLogo from '../TribeBuildLogo';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface DashboardHeaderProps {
  onLogout: () => Promise<void> | void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const themeContext = useTheme() as any;
  const toggleTheme = themeContext.toggleTheme;
  const isDark = themeContext.isDark !== undefined ? themeContext.isDark : themeContext.theme === 'dark';

  const { user: authUser } = useAuth();

  const user = {
    name: authUser?.user_metadata?.full_name || 'Criador',
    email: authUser?.email || '',
    initials: (authUser?.user_metadata?.full_name || 'C').charAt(0).toUpperCase()
  };

  const navItems = [
    { name: 'Apps', href: '/dashboard/apps', icon: Smartphone },
    { name: 'Integrações', href: '/dashboard/integrations', icon: Link2 },
    { name: 'Clientes', href: '/dashboard/clients', icon: Users },
    { name: 'Planos', href: '/dashboard/plans', icon: CreditCard },
    { name: 'Domínios', href: '/dashboard/domains', icon: Globe },
  ];

  const bonusItem = { name: 'Bônus', href: '/dashboard/bonus', icon: Gift };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleLogout = async () => {
    try {
      await onLogout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <>
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 font-['Inter']">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Lado Esquerdo: Logo e Nav */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                <TribeBuildLogo size="sm" showText={true} />
              </Link>

              {/* Navegação Desktop Clean */}
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                        active
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", active ? "text-brand-blue" : "text-slate-400")} />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Separador */}
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2"></div>

                {/* Bônus */}
                <Link
                  to={bonusItem.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                    isActive(bonusItem.href)
                      ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                      : "text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                  )}
                >
                  <Gift className="w-4 h-4" />
                  {bonusItem.name}
                </Link>
              </nav>
            </div>

            {/* Lado Direito: Ações */}
            <div className="flex items-center gap-3">

              {/* Botão Academia */}
              <a
                href="#/academia"
                className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                title="Acessar Academia"
              >
                <GraduationCap className="w-4 h-4" />
                <span className="hidden 2xl:inline">Academia</span>
              </a>

              {/* Theme Toggle Compacto */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Separador */}
              <div className="hidden lg:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>

              {/* User Menu Desktop */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center text-white text-xs font-black uppercase shadow-sm">
                    {user.initials}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-20 animate-slide-up origin-top-right">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard/settings"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-brand-blue transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Configurações
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 w-full text-left transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sair
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
};

export default DashboardHeader;