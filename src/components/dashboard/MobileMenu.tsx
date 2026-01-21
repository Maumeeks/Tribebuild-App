import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LogOut, GraduationCap, Settings, Gift, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TribeBuildLogo from '../TribeBuildLogo';
import { cn } from '../../lib/utils';

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
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] lg:hidden"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-slate-950 shadow-2xl z-[101] lg:hidden flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Header do Menu */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <TribeBuildLogo size="sm" showText={true} />
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info do Usuário */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center text-white text-sm font-black shadow-sm uppercase">
                  {user.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto p-5 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Menu Principal</p>

              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      active
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", active ? "text-brand-blue" : "text-slate-400")} />
                    {item.name}
                  </Link>
                );
              })}

              <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

              {/* Bônus Especial */}
              <Link
                to="/dashboard/bonus"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-4",
                  isActive('/dashboard/bonus')
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                    : "text-slate-500 dark:text-slate-400 hover:bg-purple-50/50 hover:text-purple-600"
                )}
              >
                <Gift className="w-4 h-4 text-purple-500" />
                Seus Bônus
              </Link>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Ajuda & Configurações</p>

              <a
                href="#/academia"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <GraduationCap className="w-4 h-4" />
                Academia TribeBuild
              </a>
              <Link
                to="/dashboard/settings"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Link>
            </nav>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
              >
                <LogOut className="w-4 h-4" />
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