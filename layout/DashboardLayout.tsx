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
      
      {/* O Botão Flutuante do WhatsApp foi removido completamente daqui */}
    </div>
  );
};

export default DashboardLayout;