import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  // Pegamos o estado do AuthContext
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // 1. REGRA DE OURO: Enquanto estiver carregando, NÃO FAÇA NADA.
    // Isso impede que o código tome decisões com dados incompletos.
    if (loading) return;

    console.log('[AuthCallback] Decidindo destino...', { 
        hasUser: !!user, 
        hasProfile: !!profile, 
        plan: profile?.plan_status 
    });

    // 2. Se terminou de carregar e NÃO tem usuário, vai pro Login.
    if (!user) {
        console.warn('[AuthCallback] Sem sessão. Redirecionando para Login.');
        navigate('/login', { replace: true });
        return;
    }

    // 3. Se tem usuário, verificamos o perfil
    if (user) {
        // Limpa a URL (remove o ?code=... do Supabase para ficar limpo)
        window.history.replaceState({}, document.title, window.location.pathname);

        if (profile) {
            // Cenário A: Usuário com Plano Ativo ou Trial
            if (profile.plan_status === 'active' || profile.plan_status === 'trial') {
                console.log('[AuthCallback] Acesso Permitido -> Dashboard');
                navigate('/dashboard', { replace: true });
            } 
            // Cenário B: Usuário Free, Cancelado ou Expirado
            else {
                console.warn('[AuthCallback] Plano inválido -> Planos');
                navigate('/plans', { replace: true });
            }
        } else {
            // Cenário C: Novo Usuário (Profile ainda não foi criado ou retornou nulo)
            // Por segurança, mandamos para a seleção de planos.
            console.warn('[AuthCallback] Perfil não encontrado -> Planos');
            navigate('/plans', { replace: true });
        }
    }

  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        <h2 className="text-white font-bold text-lg">Verificando acesso...</h2>
        <p className="text-slate-400 text-sm">Aguarde um momento</p>
      </div>
    </div>
  );
};

export default AuthCallback;