import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('[AuthCallback] Processando callback...');

        // 1. Obter sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthCallback] Erro de sessão:', sessionError);
          setError('Erro ao processar autenticação');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
          return;
        }

        if (!session) {
          console.log('[AuthCallback] Sem sessão, redirecionando para login');
          navigate('/login', { replace: true });
          return;
        }

        console.log('[AuthCallback] Sessão encontrada, buscando profile...');

        // 2. Buscar profile do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('[AuthCallback] Erro ao buscar profile:', profileError);

          // Se profile não existe, criar um novo como 'free'
          if (profileError.code === 'PGRST116') {
            console.log('[AuthCallback] Criando profile para novo usuário...');

            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || null,
                plan: 'free',
                plan_status: 'free',
                trial_ends_at: null
              });

            if (insertError) {
              console.error('[AuthCallback] Erro ao criar profile:', insertError);
              setError('Erro ao criar perfil');
              setTimeout(() => navigate('/login', { replace: true }), 2000);
              return;
            }

            // Profile criado como free -> vai para plans
            console.log('[AuthCallback] Profile criado, redirecionando para /plans');
            navigate('/plans', { replace: true });
            return;
          }

          // Outro erro
          setError('Erro ao carregar perfil');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
          return;
        }

        // 3. Determinar redirecionamento baseado no plan_status (CAMPO CORRETO!)
        const redirectPath = determineRedirectPath(profile as Profile);
        console.log('[AuthCallback] Redirecionando para:', redirectPath, '| plan_status:', profile?.plan_status);

        navigate(redirectPath, { replace: true });

      } catch (err) {
        console.error('[AuthCallback] Erro inesperado:', err);
        setError('Erro inesperado');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Função para determinar redirecionamento baseada SOMENTE no status
  const determineRedirectPath = (profile: Profile | null): string => {
    if (!profile) {
      return '/plans';
    }

    const { plan_status } = profile;

    // Se o status for 'active' (pago) ou 'trial' (período de teste válido), libera o dashboard.
    // O Stripe/Webhook são responsáveis por mudar 'trial' para 'active' ou 'expired'.
    if (plan_status === 'active' || plan_status === 'trial') {
      return '/dashboard';
    }

    // Qualquer outro status (free, canceled, expired, null) manda para planos
    return '/plans';
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Erro de Autenticação
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
            <p className="text-sm text-slate-500">Redirecionando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-blue mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Processando autenticação...
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Você será redirecionado em instantes
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;