import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Profile {
  subscription_status: 'free' | 'trial' | 'active' | 'cancelled';
  subscription_plan: string | null;
}

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 1. Processar o callback do OAuth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Erro ao processar autenticação');
          // Limpar storage e redirecionar para login
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login', { replace: true });
          return;
        }

        if (!session) {
          console.log('No session found after OAuth callback');
          // Limpar storage e redirecionar para login
          localStorage.clear();
          sessionStorage.clear();
          navigate('/login', { replace: true });
          return;
        }

        // 2. Buscar o perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_plan')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          
          // Se o perfil não existe, criar um perfil free e redirecionar para /plans
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating free profile');
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                subscription_status: 'free',
                subscription_plan: null
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              setError('Erro ao criar perfil');
              navigate('/login', { replace: true });
              return;
            }

            // Perfil criado como free - redirecionar para plans
            navigate('/plans', { replace: true });
            return;
          }

          // Outro erro de perfil
          setError('Erro ao carregar perfil');
          navigate('/login', { replace: true });
          return;
        }

        // 3. Redirecionar baseado no status do plano
        const redirectPath = determineRedirectPath(profile);
        console.log(`Redirecting to: ${redirectPath}`, { profile });
        
        navigate(redirectPath, { replace: true });

      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('Erro inesperado');
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    // Executar imediatamente - SEM setTimeout
    handleAuthCallback();
  }, [navigate]);

  // Função pura para determinar o redirecionamento
  const determineRedirectPath = (profile: Profile | null): string => {
    if (!profile) {
      return '/plans';
    }

    const { subscription_status } = profile;

    // Usuários com plano ativo ou trial -> dashboard
    if (subscription_status === 'active' || subscription_status === 'trial') {
      return '/dashboard';
    }

    // Usuários free ou cancelled -> plans
    if (subscription_status === 'free' || subscription_status === 'cancelled') {
      return '/plans';
    }

    // Fallback seguro
    return '/plans';
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro de Autenticação</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processando autenticação...
          </h2>
          <p className="text-gray-600">
            Você será redirecionado em instantes
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;