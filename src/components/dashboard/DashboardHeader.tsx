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
  Moon
} from 'lucide-react';
import MobileMenu from './MobileMenu';
import TribeBuildLogo from '../TribeBuildLogo';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardHeaderProps {
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user: authUser } = useAuth(); // Pegando dados reais do usuário se disponível

  // Dados do usuário (Fallback se o AuthContext não tiver nome ainda)
  const user = {
    name: authUser?.user_metadata?.full_name || 'Usuário TribeBuild',
    email: authUser?.email || 'usuario@tribebuild.com',
    initials: (authUser?.user_metadata?.full_name || 'U').charAt(0).toUpperCase()
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

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <TribeBuildLogo size="md" showText={true} />
            </Link>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold tracking-tight transition-all flex items-center gap-2 ${
                    isActive(item.href)
                      ? 'bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              
              {/* Bônus - Destaque especial */}
              <Link
                to={bonusItem.href}
                className={`ml-2 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-tight transition-all flex items-center gap-2 ${
                  isActive(bonusItem.href)
                    ? 'bg-gradient-to-r from-brand-coral to-orange-500 text-white shadow-lg shadow-brand-coral/30'
                    : 'bg-brand-coral/10 dark:bg-brand-coral/20 text-brand-coral hover:bg-brand-coral/20 dark:hover:bg-brand-coral/30 border border-brand-coral/20'
                }`}
              >
                <Gift className="w-4 h-4" />
                {bonusItem.name}
              </Link>
            </nav>

            {/* Lado Direito */}
            <div className="flex items-center gap-4">
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Academia - Desktop */}
              <a 
                href="#/academia"
                className="hidden xl:flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-brand-blue transition-colors px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Academia</span>
              </a>

              {/* Menu do Usuário - Desktop */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-brand-blue/20 group-hover:scale-105 transition-transform uppercase">
                    {user.initials}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown do Usuário */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-20 animate-slide-up origin-top-right">
                      <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 mb-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 font-medium truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard/settings"
                        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-brand-blue/5 dark:hover:bg-slate-800 hover:text-brand-blue transition-all"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair da Conta
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Menu Hamburger - Mobile (CORRIGIDO PARA SER VISÍVEL) */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-3 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all active:scale-95"
                aria-label="Abrir menu"
              >
                <Menu className="w-6 h-6" />
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
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