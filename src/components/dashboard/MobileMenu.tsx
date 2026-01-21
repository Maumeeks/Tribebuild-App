import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LogOut, GraduationCap, Settings, Gift, LucideIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
          {/* Overlay (Clica fora para fechar) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden mt-[64px]" // mt-16 para começar abaixo do header
            onClick={onClose}
          />

          {/* Menu Dropdown (Descendo do Topo) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[64px] left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-2xl z-[100] lg:hidden flex flex-col max-h-[calc(100vh-64px)] overflow-y-auto"
          >
            {/* Info do Usuário */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center text-white text-sm font-black shadow-sm uppercase">
                    {user.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{user.email}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navegação */}
            <nav className="p-4 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Menu Principal</p>

              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all",
                      active
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-4 h-4", active ? "text-brand-blue" : "text-slate-400")} />
                      {item.name}
                    </div>
                    {active && <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </Link>
                );
              })}

              <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

              {/* Bônus Especial */}
              <Link
                to="/dashboard/bonus"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all mb-4",
                  isActive('/dashboard/bonus')
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                    : "text-slate-500 dark:text-slate-400 hover:bg-purple-50/50 hover:text-purple-600"
                )}
              >
                <Gift className="w-4 h-4 text-purple-500" />
                Seus Bônus
              </Link>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2 mt-4">Outros</p>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="#/academia"
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-blue/30 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-brand-blue transition-all"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-xs font-bold">Academia</span>
                </a>
                <Link
                  to="/dashboard/settings"
                  onClick={onClose}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-brand-blue/30 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-brand-blue transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-xs font-bold">Ajustes</span>
                </Link>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
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