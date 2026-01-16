import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erro no callback:', error.message);
        navigate('/login');
      } else if (data.session) {
        navigate('/plans');
      } else {
        // Fallback: Tenta ouvir a mudança de estado se a sessão não vier direto
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            navigate('/plans');
          }
        });
        
        // Timeout de segurança
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
      </div>
    </div>
  );
};

export default AuthCallbackPage;