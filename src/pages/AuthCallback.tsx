import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * AuthCallback.tsx - VERSÃO BLINDADA v3
 * 
 * CORREÇÕES APLICADAS:
 * 1. Retry automático para buscar profile (resolve race condition)
 * 2. Sem setTimeout para lógica de negócio (apenas para retry controlado)
 * 3. Limpeza de sessão inválida
 * 4. Log detalhado para debug
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const hasRedirected = useRef(false);
  
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 1000;

  useEffect(() => {
    // Evita execuções duplicadas
    if (hasRedirected.current) return;

    // 1. Enquanto carregando, aguarda
    if (loading) {
      console.log('[AuthCallback] Aguardando AuthContext...');
      return;
    }

    console.log('[AuthCallback] Estado atual:', {
      hasUser: !!user,
      hasProfile: !!profile,
      planStatus: profile?.plan_status,
      retryCount,
    });

    // 2. Se não tem usuário, limpa qualquer lixo e vai pro login
    if (!user) {
      console.warn('[AuthCallback] Sem sessão válida. Limpando dados...');
      
      // Limpa possíveis tokens inválidos
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      hasRedirected.current = true;
      navigate('/login', { replace: true });
      return;
    }

    // 3. Tem usuário, mas profile ainda não carregou (race condition)
    if (!profile) {
      if (retryCount < MAX_RETRIES) {
        console.log(`[AuthCallback] Profile não encontrado. Retry ${retryCount + 1}/${MAX_RETRIES}...`);
        
        const retryTimer = setTimeout(async () => {
          // Tenta recarregar o profile
          if (refreshProfile) {
            await refreshProfile();
          }
          setRetryCount(prev => prev + 1);
        }, RETRY_DELAY_MS);

        return () => clearTimeout(retryTimer);
      } else {
        // Esgotou os retries - pode ser um novo usuário sem profile
        console.warn('[AuthCallback] Profile não encontrado após retries. Redirecionando para /plans...');
        hasRedirected.current = true;
        navigate('/plans', { replace: true });
        return;
      }
    }

    // 4. Tem usuário E profile - decide o destino
    hasRedirected.current = true;
    
    // Limpa URL (remove ?code= do OAuth)
    window.history.replaceState({}, document.title, window.location.pathname);

    const { plan_status, trial_ends_at } = profile;

    // Verifica se trial ainda está ativo
    const isTrialValid = 
      plan_status === 'trial' && 
      trial_ends_at && 
      new Date(trial_ends_at) > new Date();

    // CENÁRIO A: Plano ativo ou trial válido
    if (plan_status === 'active' || isTrialValid) {
      console.log('[AuthCallback] ✅ Acesso liberado -> Dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }

    // CENÁRIO B: Qualquer outro status (free, canceled, expired, trial expirado)
    console.log(`[AuthCallback] ⚠️ Status "${plan_status}" -> Planos`);
    navigate('/plans', { replace: true });

  }, [user, profile, loading, navigate, retryCount, refreshProfile]);

  // UI de Erro
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h2 className="text-white font-bold text-xl">Ops! Algo deu errado</h2>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="mt-4 px-6 py-3 bg-brand-blue text-white rounded-xl font-semibold hover:bg-brand-blue-dark transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // UI de Loading
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        <h2 className="text-white font-bold text-lg">Verificando acesso...</h2>
        <p className="text-slate-400 text-sm">
          {retryCount > 0 
            ? `Carregando seus dados (${retryCount}/${MAX_RETRIES})...` 
            : 'Aguarde um momento'
          }
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;