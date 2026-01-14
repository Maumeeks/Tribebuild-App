import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LogOut, GraduationCap, Settings, Gift, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TribeBuildLogo from '../TribeBuildLogo';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface User {
  name: string;
  email: string;
  initials: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  user: User;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navItems,
  user,
  onLogout
}) => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-[101] lg:hidden flex flex-col border-l border-transparent dark:border-slate-800"
          >
            {/* Header do Menu */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <TribeBuildLogo size="md" showText={true} />
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                aria-label="Fechar menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Info do Usuário */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/10 uppercase">
                  {user.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 dark:text-white tracking-tight truncate">{user.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto p-6 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Menu Principal</p>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all ${
                      isActive(item.href)
                        ? 'bg-brand-blue text-white shadow-xl shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-brand-blue dark:hover:text-blue-400'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : 'text-slate-400 group-hover:text-brand-blue'}`} />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="my-8 border-t border-slate-100 dark:border-slate-800" />
              
              {/* Bônus Especial */}
              <Link
                to="/dashboard/bonus"
                onClick={onClose}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all mb-4 ${
                  isActive('/dashboard/bonus')
                    ? 'bg-gradient-to-r from-brand-coral to-orange-500 text-white shadow-xl shadow-orange-500/30'
                    : 'bg-brand-coral/10 dark:bg-brand-coral/20 text-brand-coral border border-brand-coral/20'
                }`}
              >
                <Gift className="w-5 h-5" />
                🎁 Seus Bônus
              </Link>
              
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recursos & Ajuda</p>

              {/* Links Extras */}
              <div className="space-y-1">
                <a
                  href="#/academia"
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-brand-blue transition-all"
                >
                  <GraduationCap className="w-5 h-5 text-slate-400" />
                  Academia TribeBuild
                </a>
                <Link
                  to="/dashboard/settings"
                  onClick={onClose}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-brand-blue transition-all"
                >
                  <Settings className="w-5 h-5 text-slate-400" />
                  Configurações
                </Link>
              </div>
            </nav>

            {/* Footer - Botão Sair */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50">
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-sm"
              >
                <LogOut className="w-5 h-5" />
                Sair da conta
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;