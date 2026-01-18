import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Lazy load das páginas do dashboard (serão criadas conforme necessário)
// Por enquanto, criamos componentes placeholder

const DashboardHome: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
      Bem-vindo ao TribeBuild
    </h1>
    <p className="text-slate-600 dark:text-slate-400">
      Selecione uma opção no menu para começar.
    </p>
  </div>
);

const AppsPage: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Apps</h1>
    <p className="text-slate-600 dark:text-slate-400">Gerencie seus aplicativos aqui.</p>
  </div>
);

const IntegrationsPage: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Integrações</h1>
    <p className="text-slate-600 dark:text-slate-400">Configure suas integrações aqui.</p>
  </div>
);

const ClientsPage: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Clientes</h1>
    <p className="text-slate-600 dark:text-slate-400">Gerencie seus clientes aqui.</p>
  </div>
);

const PlansPage: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Planos</h1>
    <p className="text-slate-600 dark:text-slate-400">Gerencie seus planos aqui.</p>
  </div>
);

const DomainsPage: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Domínios</h1>
    <p className="text-slate-600 dark:text-slate-400">Gerencie seus domínios aqui.</p>
  </div>
);

const BonusPage: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Bônus</h1>
    <p className="text-slate-600 dark:text-slate-400">Confira seus bônus exclusivos aqui.</p>
  </div>
);

const SettingsPage: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Configurações</h1>
    <p className="text-slate-600 dark:text-slate-400">Ajuste suas configurações aqui.</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <DashboardHeader onLogout={handleLogout} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="apps/*" element={<AppsPage />} />
            <Route path="integrations/*" element={<IntegrationsPage />} />
            <Route path="clients/*" element={<ClientsPage />} />
            <Route path="plans/*" element={<PlansPage />} />
            <Route path="domains/*" element={<DomainsPage />} />
            <Route path="bonus/*" element={<BonusPage />} />
            <Route path="settings/*" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;