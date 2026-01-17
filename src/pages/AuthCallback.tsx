import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // 1. PRIORIDADE TOTAL: Se o usuário existe, não esperamos nada. Vai direto.
    if (user) {
      console.log('[AuthCallback] Usuário identificado. Redirecionando...');
      // Limpa a URL (remove tokens do Supabase da barra de endereço)
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/dashboard', { replace: true });
      return; 
    }
    
    // 2. Timeout de Segurança: Só espera se realmente não tiver usuário ainda
    const timer = setTimeout(() => {
       if (!loading && !user) {
           console.warn('[AuthCallback] Timeout. Voltando ao login.');
           navigate('/login');
       }
    }, 4000); // 4 segundos de tolerância máxima

    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
        <h2 className="text-white font-bold text-lg">Acessando seu painel...</h2>
      </div>
    </div>
  );
};

export default AuthCallback;