import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Se carregou e tem usuário, sucesso
    if (!loading && user) {
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/dashboard');
    }
    
    // Se carregou e NÃO tem usuário, timeout e login
    if (!loading && !user) {
       const timer = setTimeout(() => {
           navigate('/login');
       }, 2500);
       return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <h2 className="text-white font-bold text-lg">Validando acesso...</h2>
      </div>
    </div>
  );
};

export default Callback;