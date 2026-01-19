import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppsProvider } from './contexts/AppsContext'; // ✅ Adicionado para não quebrar a Home

// Componentes de Proteção
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import DashboardLayout from './layout/DashboardLayout'; // Certifique-se que este arquivo existe (era o antigo AdminLayout ou DashboardLayout)

// Pages - Públicas
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PlansPage from './pages/PlansPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import SubscriptionCancelPage from './pages/SubscriptionCancelPage';

// Pages - Dashboard (Recuperadas do arquivo antigo)
import DashboardHome from './pages/dashboard/DashboardHome';
import AppsPage from './pages/dashboard/AppsPage';
import AppBuilder from './pages/dashboard/AppBuilder';
import IntegrationsPage from './pages/dashboard/IntegrationsPage';
import ClientsPage from './pages/dashboard/ClientsPage';
import DashboardPlansPage from './pages/dashboard/PlansPage'; // Página de planos interna
import DomainsPage from './pages/dashboard/DomainsPage';
import BonusPage from './pages/dashboard/BonusPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppsProvider> {/* ✅ O contexto de Apps precisa envolver as rotas */}
        <ThemeProvider>
          <HashRouter>
            <Routes>
              {/* === ROTAS PÚBLICAS === */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Rotas de Assinatura (Checkout) */}
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
              <Route path="/subscription/cancel" element={<SubscriptionCancelPage />} />

              {/* === ROTAS PROTEGIDAS DO DASHBOARD === */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* ✅ AQUI ESTÁ O SEGREDO: Rota Index carrega a Home automaticamente */}
                <Route index element={<DashboardHome />} />

                {/* Rotas Internas */}
                <Route path="apps" element={<AppsPage />} />
                <Route path="builder" element={<AppBuilder />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="plans" element={<DashboardPlansPage />} />
                <Route path="domains" element={<DomainsPage />} />
                <Route path="bonus" element={<BonusPage />} />
              </Route>

              {/* Rota de Redirecionamento (Catch-all) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </ThemeProvider>
      </AppsProvider>
    </AuthProvider>
  );
};

export default App;