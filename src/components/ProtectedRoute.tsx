import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePayment?: boolean;
}

/**
 * ProtectedRoute.tsx - VERSÃO BLINDADA v2
 * 
 * CORREÇÕES:
 * 1. Tratamento explícito do status 'free'
 * 2. Verificação de trial expirado
 * 3. Mensagens de redirecionamento mais claras
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requirePayment = true }) => {
  const { user, profile, loading, isTrialActive, trialDaysLeft } = useAuth();
  const location = useLocation();

  // 1. Loading: Mostra spinner enquanto AuthContext inicializa
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

  // 2. Sem usuário: Redireciona para login
  if (!user) {
    console.log('[ProtectedRoute] Sem usuário -> Login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Sem profile: Aguarda ou redireciona
  // (profile pode demorar a carregar em alguns casos)
  if (!profile) {
    // Mostra loading temporário em vez de redirecionar imediatamente
    // para evitar flicker em conexões lentas
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  // 4. Verifica plano (se necessário)
  if (requirePayment) {
    const { plan_status, trial_ends_at } = profile;
    
    // Status válidos para acesso
    const hasActivePlan = plan_status === 'active';
    
    // Trial válido: status 'trial' E data não expirada
    const hasValidTrial = 
      plan_status === 'trial' && 
      trial_ends_at && 
      new Date(trial_ends_at) > new Date();

    // Se não tem plano ativo nem trial válido
    if (!hasActivePlan && !hasValidTrial) {
      // Determina a mensagem apropriada
      let message = 'Escolha um plano para acessar o dashboard.';
      
      if (plan_status === 'free') {
        message = 'Você está no plano gratuito. Escolha um plano para acessar todos os recursos.';
      } else if (plan_status === 'trial' && !hasValidTrial) {
        message = 'Seu período de teste expirou. Escolha um plano para continuar.';
      } else if (plan_status === 'canceled') {
        message = 'Sua assinatura foi cancelada. Escolha um plano para reativar.';
      } else if (plan_status === 'expired') {
        message = 'Sua assinatura expirou. Renove para continuar.';
      }

      console.log(`[ProtectedRoute] Status "${plan_status}" -> Planos`);
      
      return (
        <Navigate 
          to="/plans" 
          state={{ 
            expired: plan_status !== 'free',
            message,
            returnTo: location.pathname
          }} 
          replace 
        />
      );
    }
  }

  // 5. Tudo OK - renderiza children
  return <>{children}</>;
};

export default ProtectedRoute;