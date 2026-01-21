import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardHelpBar from '../components/dashboard/DashboardHelpBar';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const [showHelpBar, setShowHelpBar] = useState(true);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative font-['Inter'] selection:bg-brand-blue/20">
      {/* Background Sutil (Estilo Profissional) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Gradiente de topo muito suave */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent dark:from-slate-900 dark:to-transparent opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Barra de Ajuda */}
        {showHelpBar && (
          <DashboardHelpBar onClose={() => setShowHelpBar(false)} />
        )}

        {/* Header Superior (Onde o bug provavelmente vive!) */}
        <DashboardHeader onLogout={handleLogout} />

        {/* Conteúdo Principal */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;