import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppsProvider } from './contexts/AppsContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import PlansPage from './pages/PlansPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import SubscriptionCancelPage from './pages/SubscriptionCancelPage';

// Auth Callback
import VerifyEmailPage from './pages/VerifyEmailPage';
import AuthCallback from './pages/AuthCallback';

// PWA (Área do Aluno)
import PwaLoginPage from './pages/pwa/PwaLoginPage';
import PwaRegisterPage from './pages/pwa/PwaRegisterPage';
import PwaForgotPasswordPage from './pages/pwa/PwaForgotPasswordPage';
import PwaUpdatePasswordPage from './pages/pwa/PwaUpdatePasswordPage';
import PwaHomePage from './pages/pwa/PwaHomePage';
import PwaProductPage from './pages/pwa/PwaProductPage';
import PwaLessonPage from './pages/pwa/PwaLessonPage';
import PwaFeedPage from './pages/pwa/PwaFeedPage';
import PwaCommunityPage from './pages/pwa/PwaCommunityPage';
import PwaProfilePage from './pages/pwa/PwaProfilePage';

// Dashboard
import DashboardLayout from './layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import AppsPage from './pages/dashboard/AppsPage';
import AppBuilder from './pages/dashboard/AppBuilder';
import ContentManager from './pages/dashboard/ContentManager';
import Analytics from './pages/dashboard/Analytics';
import Settings from './pages/dashboard/Settings';
import ProductsPage from './pages/dashboard/ProductsPage';
import FeedPage from './pages/dashboard/FeedPage';
import CommunityPage from './pages/dashboard/CommunityPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import IntegrationsPage from './pages/dashboard/IntegrationsPage';
import ClientsPage from './pages/dashboard/ClientsPage';
import DashboardPlansPage from './pages/dashboard/PlansPage';
import DomainsPage from './pages/dashboard/DomainsPage';
import BonusPage from './pages/dashboard/BonusPage';
import AcademiaPage from './pages/dashboard/AcademiaPage';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminSecurityPage from './pages/admin/AdminSecurityPage';

import DevToolsPage from './pages/DevToolsPage';

// 🔄 Componente Auxiliar para Redirecionamento
const RedirectToLogin = () => {
  const { appSlug } = useParams();
  if (!appSlug) return <Navigate to="/" replace />;
  return <Navigate to={`/${appSlug}/login`} replace />;
};

const AppRoutes: React.FC = () => {
  const hostname = window.location.hostname;
  // Verifica se é subdomínio de aluno (produção)
  const isStudentSubdomain = hostname.startsWith('app.');

  // =========================================================
  // 1️⃣ ROTAS DE PRODUÇÃO (SUBDOMÍNIO app.tribebuild.pro)
  // URL esperada: https://app.tribebuild.pro/slug-do-app/pagina
  // =========================================================
  if (isStudentSubdomain) {
    return (
      <Routes>
        <Route path="/:appSlug" element={<RedirectToLogin />} />

        {/* Auth */}
        <Route path="/:appSlug/login" element={<PwaLoginPage />} />
        <Route path="/:appSlug/register" element={<PwaRegisterPage />} />
        <Route path="/:appSlug/forgot-password" element={<PwaForgotPasswordPage />} />
        <Route path="/:appSlug/update-password" element={<PwaUpdatePasswordPage />} />

        {/* App Logado */}
        <Route path="/:appSlug/home" element={<PwaHomePage />} />
        <Route path="/:appSlug/product/:productId" element={<PwaProductPage />} />
        <Route path="/:appSlug/lesson/:lessonId" element={<PwaLessonPage />} />
        <Route path="/:appSlug/feed" element={<PwaFeedPage />} />
        <Route path="/:appSlug/community" element={<PwaCommunityPage />} />

        {/* ✅ ROTA DO PERFIL (ESSENCIAL PARA FUNCIONAR NO SUBDOMÍNIO) */}
        <Route path="/:appSlug/profile" element={<PwaProfilePage />} />

        {/* Catch-all do aluno */}
        <Route path="*" element={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Página não encontrada no App.</div>} />
      </Routes>
    );
  }

  // =========================================================
  // 2️⃣ ROTAS DO SITE / DASHBOARD / LOCALHOST
  // =========================================================
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
      <Route path="/subscription/cancel" element={<SubscriptionCancelPage />} />
      <Route path="/dev" element={<DevToolsPage />} />

      {/* Rotas Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="security" element={<AdminSecurityPage />} />
      </Route>

      {/* =========================================================
          FALLBACK PARA TESTES (LOCALHOST ou sem subdomínio)
          Permite acessar via /app/slug-do-app/pagina
         ========================================================= */}
      <Route path="/app/:appSlug" element={<RedirectToLogin />} />
      <Route path="/app/:appSlug/login" element={<PwaLoginPage />} />
      <Route path="/app/:appSlug/register" element={<PwaRegisterPage />} />
      <Route path="/app/:appSlug/home" element={<PwaHomePage />} />
      <Route path="/app/:appSlug/product/:productId" element={<PwaProductPage />} />
      <Route path="/app/:appSlug/lesson/:lessonId" element={<PwaLessonPage />} />

      {/* ✅ AQUI ESTAVA FALTANDO A ROTA PARA QUANDO VOCÊ TESTA NO LOCALHOST OU /app/ */}
      <Route path="/app/:appSlug/profile" element={<PwaProfilePage />} />

      {/* Rotas Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="academia" element={<AcademiaPage />} />
        <Route path="apps" element={<AppsPage />} />
        <Route path="apps/:appId/products" element={<ProductsPage />} />
        <Route path="apps/:appId/feed" element={<FeedPage />} />
        <Route path="apps/:appId/community" element={<CommunityPage />} />
        <Route path="apps/:appId/notifications" element={<NotificationsPage />} />
        <Route path="builder" element={<AppBuilder />} />
        <Route path="content" element={<ContentManager />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="my-apps" element={<AppsPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="plans" element={<DashboardPlansPage />} />
        <Route path="domains" element={<DomainsPage />} />
        <Route path="bonus" element={<BonusPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppsProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeProvider>
      </AppsProvider>
    </AuthProvider>
  );
};

export default App;