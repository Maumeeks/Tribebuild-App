import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth(); // <--- Agora precisamos do profile também

  useEffect(() => {
    // Se ainda está carregando o AuthContext, aguarda.
    if (loading) return;

    // Se não tem usuário, manda pro login
    if (!user) {
        const timer = setTimeout(() => navigate('/login'), 3000);
        return () => clearTimeout(timer);
    }

    // A BLITZ: Só entra no Dashboard se tiver plano Ativo ou Trial
    if (profile) {
        console.log('[AuthCallback] Verificando plano:', profile.plan_status);
        
        if (profile.plan_status === 'active' || profile.plan_status === 'trial') {
            // Plano OK -> Dashboard
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/dashboard', { replace: true });
        } else {
            // Sem plano ou cancelado -> Vai comprar
            console.warn('[AuthCallback] Sem plano ativo. Redirecionando para Planos.');
            navigate('/plans', { replace: true });
        }
    } else {
        // Se o usuário existe mas o perfil demorou para carregar...
        // Por segurança para NOVOS usuários, mandamos para /plans
        // (Quem já tem conta consegue clicar em "Login" lá na página de planos se for engano)
        const timer = setTimeout(() => {
             navigate('/plans', { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
    }

  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
        <h2 className="text-white font-bold text-lg">Verificando sua assinatura...</h2>
      </div>
    </div>
  );
};

export default AuthCallback;