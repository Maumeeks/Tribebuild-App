import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // 1. Verificar sessão
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!currentSession) {
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(currentSession);

        // 2. Buscar profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (mounted) {
          setProfile(userProfile as Profile | null);
          setLoading(false);
        }

      } catch (err) {
        console.error('[ProtectedRoute] Erro:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setProfile(null);
          return;
        }

        if (newSession) {
          setSession(newSession);
          // Buscar profile atualizado
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();

          if (mounted) {
            setProfile(userProfile as Profile | null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Loading state
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

  // Não autenticado -> login
  if (!session) {
    console.log('[ProtectedRoute] Sem sessão, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Autenticado mas sem plano válido -> plans
  if (profile) {
    const hasValidPlan =
      profile.plan_status === 'active' ||
      (profile.plan_status === 'trial' &&
        profile.trial_ends_at &&
        new Date(profile.trial_ends_at) > new Date());

    if (!hasValidPlan) {
      console.log('[ProtectedRoute] Plano inválido, redirecionando para plans');
      return <Navigate to="/plans" replace />;
    }
  }

  // Tudo OK -> renderizar children
  return <>{children}</>;
};

export default ProtectedRoute;