
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import TribeBuildLogo from '../components/TribeBuildLogo';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Usuários', path: '/admin/users' },
    { icon: CreditCard, label: 'Assinaturas', path: '/admin/subscriptions' },
    { icon: Shield, label: 'Segurança 2FA', path: '/admin/security' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    // In a real app, clear tokens here
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter'] flex">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-slate-900 text-white z-[70] transform transition-all duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl",
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/5">
          <div className="flex items-center gap-3 group">
            <TribeBuildLogo size="md" showText={false} />
            <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter leading-none">Tribe<span className="text-blue-400">Build</span></span>
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] mt-1">Admin Panel</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-4">Geral</p>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold group",
                isActive 
                  ? 'bg-brand-blue text-white shadow-xl shadow-blue-500/20' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              )}
            >
              {/* Fix for line 82: Wrapped children in a function to access isActive state from NavLink */}
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/20 group-hover:text-white")} />
                  <span className="text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-red-50/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
               <Shield className="w-4 h-4 text-amber-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ambiente Mestre Seguro</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 bg-slate-50 text-slate-400 hover:text-brand-blue rounded-xl transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all group"
              >
                <div className="flex flex-col items-end mr-1 hidden sm:flex">
                    <span className="text-xs font-black text-slate-900 leading-none">Super Admin</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dono do SaaS</span>
                </div>
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <span className="font-black text-sm">A</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform", userMenuOpen && "rotate-180")} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-slide-up origin-top-right overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50 mb-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Conta</p>
                        <p className="text-sm font-bold text-slate-900 truncate">admin@tribebuild.com</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-5 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 w-full text-left transition-all">
                      <LogOut className="w-4 h-4" />
                      Encerrar Sessão
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
