import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // ✅ Usa o Context centralizado (já corrigido) em vez de buscar manualmente
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  // 1. Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
          <p className="text-slate-600 dark:text-slate-400">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // 2. Não autenticado -> login
  if (!session) {
    console.log('[ProtectedRoute] Sem sessão, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Verificação de Plano Simplificada
  // O Webhook define 'active' (pago) ou 'trial' (período de teste válido).
  // Ambos concedem acesso ao dashboard.
  const hasAccess = profile?.plan_status === 'active' || profile?.plan_status === 'trial';

  if (!profile || !hasAccess) {
    console.log('[ProtectedRoute] Acesso negado. Status:', profile?.plan_status);
    return <Navigate to="/plans" replace />;
  }

  // Tudo OK -> renderizar children
  return <>{children}</>;
};

export default ProtectedRoute;