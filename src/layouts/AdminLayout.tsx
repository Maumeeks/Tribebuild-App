import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Bell,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import TribeBuildLogo from '../components/TribeBuildLogo';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/admin' },
    { icon: Users, label: 'Clientes', path: '/admin/users' },
    { icon: CreditCard, label: 'Assinaturas', path: '/admin/subscriptions' },
    { icon: ShieldCheck, label: 'Segurança', path: '/admin/security' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Inter'] flex flex-col">

      {/* --- TOP HEADER --- */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">

          {/* Esquerda: Logo e Nav Desktop */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <TribeBuildLogo size="sm" showText={false} />
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white text-sm leading-none tracking-tight">TribeBuild</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Admin</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) => cn(
                    "px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all uppercase tracking-wide",
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Direita: Ações e Perfil */}
          <div className="flex items-center gap-4">

            {/* Search Bar (Fake) */}
            <div className="hidden md:flex items-center relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 outline-none w-48 transition-all focus:w-64"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>

            {/* Notificações */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 pl-1 pr-3 py-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-full transition-all group"
              >
                <div className="w-7 h-7 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 text-xs font-black">
                  A
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden md:block">Admin</span>
                <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", userMenuOpen && "rotate-180")} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-20 animate-slide-up origin-top-right">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Super Admin</p>
                      <p className="text-[10px] text-slate-500">root@tribebuild.com</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-colors">
                      <LogOut className="w-3.5 h-3.5" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE MENU (Dropdown) --- */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-slide-down shadow-xl absolute w-full z-40">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all",
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
            <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-left transition-colors">
              <LogOut className="w-5 h-5" />
              Sair do Painel
            </button>
          </nav>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>

    </div>
  );
}