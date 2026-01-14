import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardHelpBar from '../components/dashboard/DashboardHelpBar';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const [showHelpBar, setShowHelpBar] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Hook para saber em qual página estamos
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Verifica se estamos na página de criação (Builder)
  const isBuilderPage = location.pathname.includes('/builder');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      {/* Background Decorativo Global para Dashboard */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-coral/5 dark:bg-brand-coral/10 rounded-full blur-[150px] animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/3 dark:bg-cyan-500/5 rounded-full blur-[180px]"></div>
      </div>

      {/* Barra de Ajuda */}
      {showHelpBar && (
        <DashboardHelpBar onClose={() => setShowHelpBar(false)} />
      )}
      
      {/* Header Superior Horizontal */}
      <DashboardHeader onLogout={handleLogout} />
      
      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      
      {/* WhatsApp Floating Button - SÓ APARECE SE NÃO ESTIVER NO BUILDER */}
      {!isBuilderPage && (
        <a
          href="https://wa.me/5561982199922"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 active:scale-90 transition-all duration-300 z-50 group"
          aria-label="Fale conosco no WhatsApp"
        >
          <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20 group-hover:opacity-0"></div>
          <svg className="w-8 h-8 relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}
    </div>
  );
};

export default DashboardLayout;