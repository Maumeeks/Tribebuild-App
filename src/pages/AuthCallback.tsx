import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // 1. Se carregou e tem usuário, limpa a URL e vai pro dashboard
    if (!loading && user) {
      // Remove o hash (#) e os parâmetros da URL para ficar limpo
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/dashboard');
    }
    
    // 2. Se demorar muito e não tiver usuário, manda de volta pro login por segurança
    if (!loading && !user) {
       const timer = setTimeout(() => {
           navigate('/login');
       }, 3000); // 3 segundos de tolerância
       return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <h2 className="text-white font-bold text-lg">Validando seu acesso...</h2>
        <p className="text-slate-400 text-sm mt-2">Por favor, aguarde um momento.</p>
      </div>
    </div>
  );
};

export default AuthCallback;