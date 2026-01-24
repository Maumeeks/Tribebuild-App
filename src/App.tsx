import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Auth Callback e Verificação
import VerifyEmailPage from './pages/VerifyEmailPage';
import AuthCallback from './pages/AuthCallback';

// PWA (Área do Aluno)
import PwaLoginPage from './pages/pwa/PwaLoginPage';
import PwaRegisterPage from './pages/pwa/PwaRegisterPage';
import PwaForgotPasswordPage from './pages/pwa/PwaForgotPasswordPage';
import PwaHomePage from './pages/pwa/PwaHomePage';
import PwaProductPage from './pages/pwa/PwaProductPage';
import PwaLessonPage from './pages/pwa/PwaLessonPage';
import PwaFeedPage from './pages/pwa/PwaFeedPage';
import PwaCommunityPage from './pages/pwa/PwaCommunityPage';
import PwaProfilePage from './pages/pwa/PwaProfilePage';

// Dashboard (Área do Criador)
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

// Admin Master
import AdminLayout from './layouts/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminSecurityPage from './pages/admin/AdminSecurityPage';

// Dev
import DevToolsPage from './pages/DevToolsPage';

// 🧠 Componente de Roteamento Inteligente
const AppRoutes: React.FC = () => {
  // Verifica se está no subdomínio "app." (Ex: app.tribebuild.pro ou app.localhost)
  const hostname = window.location.hostname;
  const isStudentSubdomain = hostname.startsWith('app.');

  // 1️⃣ ROTAS DO ALUNO (SUBDOMÍNIO app.)
  // Estrutura: app.tribebuild.pro/nome-do-curso/login
  if (isStudentSubdomain) {
    return (
      <Routes>
        <Route path="/:appSlug/login" element={<PwaLoginPage />} />
        <Route path="/:appSlug/register" element={<PwaRegisterPage />} />
        <Route path="/:appSlug/forgot-password" element={<PwaForgotPasswordPage />} />

        {/* Rotas Protegidas do App do Aluno */}
        <Route path="/:appSlug/home" element={<PwaHomePage />} />
        <Route path="/:appSlug/product/:productId" element={<PwaProductPage />} />
        <Route path="/:appSlug/lesson/:lessonId" element={<PwaLessonPage />} />
        <Route path="/:appSlug/feed" element={<PwaFeedPage />} />
        <Route path="/:appSlug/community" element={<PwaCommunityPage />} />
        <Route path="/:appSlug/profile" element={<PwaProfilePage />} />

        {/* Redirecionamento padrão no subdomínio: vai para login se não achar nada */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // 2️⃣ ROTAS DO CRIADOR / ADMIN / SITE (DOMÍNIO PRINCIPAL)
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/plans" element={<PlansPage />} />

      {/* Auth & System */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
      <Route path="/subscription/cancel" element={<SubscriptionCancelPage />} />
      <Route path="/dev" element={<DevToolsPage />} />

      {/* Admin Master Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="security" element={<AdminSecurityPage />} />
      </Route>

      {/* ⚠️ PWA Antigo (Fallback para testes locais sem subdomínio) */}
      {/* Mantivemos apenas por segurança, mas o foco é o subdomínio acima */}
      <Route path="/app/:appSlug/login" element={<PwaLoginPage />} />
      <Route path="/app/:appSlug/home" element={<PwaHomePage />} />
      <Route path="/app/:appSlug/lesson/:lessonId" element={<PwaLessonPage />} />

      {/* Protected Dashboard Routes */}
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