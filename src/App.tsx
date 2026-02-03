import React, { Suspense } from 'react'; // ✅ Adicionado Suspense
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppsProvider } from './contexts/AppsContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react'; // ✅ Importado para o Loading

// Páginas públicas (Mantive estáticas pois são leves e críticas)
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

// ✅ OTIMIZAÇÃO: Importações Dinâmicas (Lazy Loading) para o PWA
// O navegador só vai baixar esses arquivos quando o usuário clicar neles
const PwaLoginPage = React.lazy(() => import('./pages/pwa/PwaLoginPage'));
const PwaRegisterPage = React.lazy(() => import('./pages/pwa/PwaRegisterPage'));
const PwaForgotPasswordPage = React.lazy(() => import('./pages/pwa/PwaForgotPasswordPage'));
const PwaUpdatePasswordPage = React.lazy(() => import('./pages/pwa/PwaUpdatePasswordPage'));
const PwaHomePage = React.lazy(() => import('./pages/pwa/PwaHomePage'));
const PwaProductPage = React.lazy(() => import('./pages/pwa/PwaProductPage'));
const PwaLessonPage = React.lazy(() => import('./pages/pwa/PwaLessonPage'));
const PwaFeedPage = React.lazy(() => import('./pages/pwa/PwaFeedPage'));
const PwaCommunityPage = React.lazy(() => import('./pages/pwa/PwaCommunityPage'));
const PwaProfilePage = React.lazy(() => import('./pages/pwa/PwaProfilePage'));

// Dashboard (Também podemos otimizar, mas o foco agora é o PWA)
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

// ✅ IMPORTAÇÃO NOVA DO LAYOUT DE IDENTIDADE (Ícones e Manifesto)
import StudentLayout from './layouts/StudentLayout';

// ✅ COMPONENTE DE LOADING OTIMIZADO
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
  </div>
);

// 🔄 COMPONENTE DE LIMPEZA DE URL (REMOVE O /app/ EXTRA)
const RedirectStripAppPrefix = ({ targetPath }: { targetPath?: string }) => {
  const { appSlug } = useParams<{ appSlug: string }>();
  const finalPath = targetPath || '';

  if (!appSlug) return <Navigate to="/" replace />;
  return <Navigate to={`/${appSlug}/${finalPath}`} replace />;
};

const RedirectToLogin = () => {
  const { appSlug } = useParams<{ appSlug: string }>();
  if (!appSlug) return <Navigate to="/" replace />;
  return <Navigate to={`/${appSlug}/login`} replace />;
};

const AppRoutes: React.FC = () => {
  const hostname = window.location.hostname;
  const isStudentSubdomain = hostname.startsWith('app.');

  // =========================================================
  // 1️⃣ ROTAS DE PRODUÇÃO (SUBDOMÍNIO app.tribebuild.pro)
  // =========================================================
  if (isStudentSubdomain) {
    return (
      // ✅ Suspense envolve as rotas PWA para mostrar o loading enquanto baixa o código
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* --- ROTAS CORRETAS (LIMPAS) --- */}
          <Route path="/:appSlug" element={<RedirectToLogin />} />

          {/* ✅ ENVOLVENDO AS ROTAS COM O STUDENTLAYOUT */}
          <Route element={<StudentLayout />}>
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
            <Route path="/:appSlug/profile" element={<PwaProfilePage />} />
          </Route>

          {/* --- 🚨 CORREÇÃO DE SEGURANÇA: CAPTURA URLs COM /app/ E REDIRECIONA --- */}
          <Route path="/app/:appSlug/profile" element={<RedirectStripAppPrefix targetPath="profile" />} />
          <Route path="/app/:appSlug/home" element={<RedirectStripAppPrefix targetPath="home" />} />
          <Route path="/app/:appSlug/login" element={<RedirectStripAppPrefix targetPath="login" />} />
          <Route path="/app/:appSlug" element={<RedirectStripAppPrefix targetPath="" />} />

          {/* Catch-all genérico para limpar qualquer outra rota /app/ */}
          <Route path="/app/:appSlug/*" element={<RedirectStripAppPrefix targetPath="home" />} />

          {/* Erro 404 final */}
          <Route path="*" element={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Página não encontrada no App.</div>} />
        </Routes>
      </Suspense>
    );
  }

  // =========================================================
  // 2️⃣ ROTAS DO SITE / DASHBOARD (tribebuild.pro)
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

      {/* Dashboard */}
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

      {/* Fallbacks legados para o domínio principal também, por precaução */}
      <Route path="/app/:appSlug" element={<RedirectToLogin />} />
      <Route path="/app/:appSlug/login" element={<RedirectStripAppPrefix targetPath="login" />} /> {/* Corrigido aqui para usar o componente */}
      <Route path="/app/:appSlug/profile" element={<RedirectStripAppPrefix targetPath="profile" />} />

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