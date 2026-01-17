import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  // Precisamos do profile e loading para decidir
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // 1. Enquanto carrega dados do banco, não fazemos nada
    if (loading) return;

    // 2. Se terminou de carregar e NÃO tem usuário, manda pro login
    if (!user) {
        const timer = setTimeout(() => navigate('/login'), 3000);
        return () => clearTimeout(timer);
    }

    // 3. A BLITZ: Se tem usuário, verificamos o Plano
    if (user) {
        console.log('[AuthCallback] Usuário identificado. Verificando plano...');

        // Limpa a URL (remove tokens)
        window.history.replaceState({}, document.title, window.location.pathname);

        if (profile) {
            // Se já temos o perfil carregado, verificamos o status
            if (profile.plan_status === 'active' || profile.plan_status === 'trial') {
                navigate('/dashboard', { replace: true });
            } else {
                // Status cancelado, free, ou null -> PLANOS
                console.warn('[AuthCallback] Plano inválido ou inexistente. Redirecionando para Planos.');
                navigate('/plans', { replace: true });
            }
        } else {
            // Se tem User mas o Profile veio nulo (usuário 100% novo sem registro no banco ainda)
            // MANDA PARA PLANOS para ele criar a assinatura
            navigate('/plans', { replace: true });
        }
    }

  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
        <h2 className="text-white font-bold text-lg">Verificando sua assinatura...</h2>
        <p className="text-slate-400 text-sm mt-2">Aguarde um momento.</p>
      </div>
    </div>
  );
};

export default AuthCallback;