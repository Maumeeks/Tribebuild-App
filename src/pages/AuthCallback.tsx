import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Evita navegacao duplicada
    if (hasNavigated.current) return;
    
    // Aguarda loading terminar
    if (loading) {
      console.log('[Callback] Aguardando...');
      return;
    }

    console.log('[Callback] Decidindo:', { user: !!user, profile: !!profile, status: profile?.plan_status });

    // Sem usuario = login
    if (!user) {
      hasNavigated.current = true;
      navigate('/login', { replace: true });
      return;
    }

    // Tem usuario mas sem profile = aguarda mais um pouco ou vai pra plans
    if (!profile) {
      // Espera 2s e tenta de novo via reload
      setTimeout(() => {
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          window.location.href = '/plans';
        }
      }, 2000);
      return;
    }

    // Tem usuario E profile
    hasNavigated.current = true;
    
    const { plan_status, trial_ends_at } = profile;
    const isTrialValid = plan_status === 'trial' && trial_ends_at && new Date(trial_ends_at) > new Date();

    if (plan_status === 'active' || isTrialValid) {
      console.log('[Callback] -> Dashboard');
      window.location.href = '/dashboard';
    } else {
      console.log('[Callback] -> Plans');
      window.location.href = '/plans';
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
        <p className="text-white font-bold">Verificando acesso...</p>
        <p className="text-slate-400 text-sm">Aguarde um momento</p>
      </div>
    </div>
  );
};

export default AuthCallback;