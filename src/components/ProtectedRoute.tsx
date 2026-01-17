import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePayment?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requirePayment = true }) => {
  const { user, profile, loading, isTrialActive } = useAuth();
  const location = useLocation();

  // Enquanto está carregando user ou profile, mostra spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário logado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se ainda não carregou o profile, espera (evita erro)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  // Verifica se precisa de plano pago
  if (requirePayment) {
    const hasActivePlan = profile.plan_status === 'active';
    const hasActiveTrial = profile.plan_status === 'trial' && isTrialActive;

    if (!hasActivePlan && !hasActiveTrial) {
      return (
        <Navigate 
          to="/plans" 
          state={{ 
            expired: true,
            message: hasActiveTrial === false && profile.plan_status === 'trial' 
              ? 'Seu período de teste acabou. Escolha um plano para continuar.' 
              : 'Escolha um plano para acessar o dashboard completo.'
          }} 
          replace 
        />
      );
    }
  }

  // Tudo liberado
  return <>{children}</>;
};

export default ProtectedRoute;