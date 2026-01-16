import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Agora isso vai funcionar!
import { Loader2 } from 'lucide-react';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Verifica se a sessão foi criada com sucesso pelo link do email
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erro no callback:', error.message);
        navigate('/login');
      } else if (data.session) {
        // Sucesso! Redireciona para os planos
        navigate('/plans');
      } else {
        // Se não pegou a sessão, tenta ouvir a mudança de estado (fallback)
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            navigate('/plans');
          }
        });
        
        // Se em 2s não acontecer nada, manda pro login
        setTimeout(() => {
            navigate('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Validando acesso...</h2>
        <p className="text-slate-500 text-sm mt-2">Estamos confirmando seu e-mail.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;