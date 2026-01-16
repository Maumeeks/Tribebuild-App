import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AppsProvider } from '../contexts/AppsContext';
import ProtectedRoute from '../components/ProtectedRoute';

// ✅ CORREÇÃO AQUI: Importando o novo arquivo "Callback" (sem o "Auth" no nome para o Git não travar)
import Callback from './pages/Callback';

// Páginas públicas
import PlansPage from '../pages/PlansPage';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import SubscriptionSuccessPage from '../pages/SubscriptionSuccessPage';
import SubscriptionCancelPage from '../pages/SubscriptionCancelPage';

// PWA 2026
import PwaLoginPage from '../pages/pwa/PwaLoginPage';
import PwaRegisterPage from '../pages/pwa/PwaRegisterPage';
import PwaForgotPasswordPage from '../pages/pwa/PwaForgotPasswordPage';
import PwaHomePage from '../pages/pwa/PwaHomePage';
import PwaProductPage from '../pages/pwa/PwaProductPage';
import PwaLessonPage from '../pages/pwa/PwaLessonPage';
import PwaFeedPage from '../pages/pwa/PwaFeedPage';
import PwaCommunityPage from '../pages/pwa/PwaCommunityPage';
import PwaProfilePage from '../pages/pwa/PwaProfilePage';

// Dashboard
import DashboardLayout from '../layout/DashboardLayout';
import DashboardHome from '../pages/dashboard/DashboardHome';
import AppsPage from '../pages/dashboard/AppsPage';
import AppBuilder from '../pages/dashboard/AppBuilder';
import ContentManager from '../pages/dashboard/ContentManager';
import Analytics from '../pages/dashboard/Analytics';
import Settings from '../pages/dashboard/Settings';
import ProductsPage from '../pages/dashboard/ProductsPage';
import FeedPage from '../pages/dashboard/FeedPage';
import CommunityPage from '../pages/dashboard/CommunityPage';
import NotificationsPage from '../pages/dashboard/NotificationsPage';
import IntegrationsPage from '../pages/dashboard/IntegrationsPage';
import ClientsPage from '../pages/dashboard/ClientsPage';
import DashboardPlansPage from '../pages/dashboard/PlansPage';
import DomainsPage from '../pages/dashboard/DomainsPage';
import BonusPage from '../pages/dashboard/BonusPage';

// Admin
import AdminLayout from '../layouts/AdminLayout';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminSubscriptionsPage from '../pages/admin/AdminSubscriptionsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminSecurityPage from '../pages/admin/AdminSecurityPage';

// Dev
import DevToolsPage from '../pages/DevToolsPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppsProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* ✅ CORREÇÃO AQUI: Usando o componente <Callback /> */}
              <Route path="/auth/callback" element={<Callback />} />
              
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/plans" element={<PlansPage />} />

              {/* Subscription Callback Routes */}
              <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
              <Route path="/subscription/cancel" element={<SubscriptionCancelPage />} />

              {/* Dev Tools - Página Escondida */}
              <Route path="/dev" element={<DevToolsPage />} />

              {/* Master Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="security" element={<AdminSecurityPage />} />
              </Route>

              {/* PWA End-User Routes */}
              <Route path="/app/:appSlug/login" element={<PwaLoginPage />} />
              <Route path="/app/:appSlug/register" element={<PwaRegisterPage />} />
              <Route path="/app/:appSlug/forgot-password" element={<PwaForgotPasswordPage />} />
              <Route path="/app/:appSlug/home" element={<PwaHomePage />} />
              <Route path="/app/:appSlug/product/:productId" element={<PwaProductPage />} />
              <Route path="/app/:appSlug/lesson/:lessonId" element={<PwaLessonPage />} />
              <Route path="/app/:appSlug/feed" element={<PwaFeedPage />} />
              <Route path="/app/:appSlug/community" element={<PwaCommunityPage />} />
              <Route path="/app/:appSlug/profile" element={<PwaProfilePage />} />

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

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;