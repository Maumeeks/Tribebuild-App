import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  // 1. Carregando: Mostra a tela de loading enquanto verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Verificando sua assinatura...</p>
        </div>
      </div>
    );
  }

  // 2. Não logado: Manda para Login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Verificação de Pagamento (O Teste Real)
  // Aceita se estiver 'active' (pago) ou 'trial' (teste grátis)
  const isPaid = profile?.plan_status === 'active' || profile?.plan_status === 'trial';

  // Se o usuário existe, mas não pagou (está 'free' ou 'canceled'), manda pagar.
  if (profile && !isPaid) {
    console.log('[Bloqueio] Usuário sem plano ativo. Redirecionando para planos.');
    return <Navigate to="/plans" replace />;
  }

  // 4. Acesso Liberado
  return <>{children}</>;
};

export default ProtectedRoute;