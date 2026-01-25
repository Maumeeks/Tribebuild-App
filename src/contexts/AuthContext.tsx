import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase'; // Certifique-se que Profile está exportado corretamente

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, cpf?: string, phone?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 🛡️ PROTEÇÃO 1: Busca de perfil robusta com Timeout e Auto-Criação
  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<Profile | null> => {
    try {
      // Timeout Promise: Rejeita se demorar mais de 6s (margem de segurança)
      const timeoutPromise = new Promise<{ data: null; error: { code: string; message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao buscar perfil')), 6000)
      );

      // Busca do Supabase
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Corrida: Banco de Dados vs Timeout
      // @ts-ignore - Supabase types compatibility
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      const { data, error } = result;

      if (error) {
        // 🛡️ PROTEÇÃO 3: Auto-Healing (Se não achar, cria!)
        // PGRST116: JSON object requested, multiple (or no) rows returned
        if (error.code === 'PGRST116') {
          console.warn('[Auth] Perfil não encontrado. Criando perfil de emergência...');

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              email: userEmail || '',
              full_name: 'Usuário',
              plan: 'starter',
              plan_status: 'active',
              // Adicione aqui outros campos obrigatórios do seu banco com valores default
            }])
            .select()
            .single();

          if (!createError && newProfile) {
            console.log('[Auth] Perfil de emergência criado.');
            return newProfile as Profile;
          }

          console.error('[Auth] Falha ao criar perfil de emergência:', createError);
        }

        // Se for outro erro, apenas loga e retorna null
        if (error.code !== 'PGRST116') {
          console.error('[Auth] Erro ao buscar profile:', error.message);
        }
        return null;
      }

      return data as Profile;

    } catch (err) {
      console.error('[Auth] Exceção no fetchProfile:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // 1. Verificar sessão atual imediatamente
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            const userProfile = await fetchProfile(initialSession.user.id, initialSession.user.email);
            if (mounted) setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('[Auth] Erro na inicialização:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Configurar Listener para mudanças futuras
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log(`[Auth] Evento: ${event}`);

        if (event === 'SIGNED_OUT' || !newSession) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (newSession?.user) {
          // Apenas atualiza se a sessão for diferente ou se o usuário mudou
          setSession(newSession);
          setUser(newSession.user);

          // Se for login ou token refresh, garantimos o perfil atualizado
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            // Opcional: Só busca se ainda não tiver profile carregado ou se for um evento crítico
            const userProfile = await fetchProfile(newSession.user.id, newSession.user.email);
            if (mounted) setProfile(userProfile);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string, cpf?: string, phone?: string) => {
    // 1. Cria usuário no Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          cpf: cpf || null,
          phone: phone || null
        }
      },
    });

    // 2. Se sucesso e auto-confirmado, força a criação do profile imediatamente
    // Isso evita depender apenas do Auto-Healing no primeiro load
    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          email: email,
          full_name: fullName,
          plan: 'starter',
          plan_status: 'active'
        }]);

      if (profileError) console.warn('[Auth] Aviso: Profile não criado no cadastro (será criado no healing).', profileError);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Garante que o estado limpe se der erro
      setLoading(false);
    }
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // O Listener (SIGNED_OUT) cuidará de limpar o estado e setar loading false
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // Ajuste a rota conforme seu app
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Usuário não autenticado') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error && profile) {
      // Atualização otimista da UI
      setProfile({ ...profile, ...updates });
    }
    return { error };
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true); // Feedback visual opcional
    const userProfile = await fetchProfile(user.id, user.email);
    setProfile(userProfile);
    setLoading(false);
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signUp, signIn, signOut, resetPassword, updateProfile, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;