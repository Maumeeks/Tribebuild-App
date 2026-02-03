import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 🛡️ PROTEÇÃO: Tenta iniciar com o cache do LocalStorage para evitar "piscar"
  const [profile, setProfile] = useState<Profile | null>(() => {
    const cached = localStorage.getItem('tribebuild_cached_profile');
    return cached ? JSON.parse(cached) : null;
  });

  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<Profile | null> => {
    try {
      const timeoutPromise = new Promise<{ data: null; error: { code: string; message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao buscar perfil')), 6000)
      );

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // @ts-ignore
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      const { data, error } = result;

      if (error) {
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
            }])
            .select()
            .single();

          if (!createError && newProfile) {
            // 🔥 ATUALIZA CACHE
            localStorage.setItem('tribebuild_cached_profile', JSON.stringify(newProfile));
            return newProfile as Profile;
          }
        }
        return null;
      }

      // 🔥 ATUALIZA CACHE COM O DADO FRESCO
      localStorage.setItem('tribebuild_cached_profile', JSON.stringify(data));
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
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            // Busca o perfil atualizado, mas já temos o cache para mostrar algo
            const userProfile = await fetchProfile(initialSession.user.id, initialSession.user.email);
            if (mounted && userProfile) setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('[Auth] Erro na inicialização:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !newSession) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          // 🔥 LIMPEZA DE CACHE CRÍTICA
          localStorage.removeItem('tribebuild_cached_profile');
          localStorage.removeItem('tribebuild_cached_plan');
        } else if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            const userProfile = await fetchProfile(newSession.user.id, newSession.user.email);
            if (mounted && userProfile) setProfile(userProfile);
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, cpf: cpf || null, phone: phone || null }
      },
    });

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
      if (profileError) console.warn('[Auth] Aviso: Profile não criado no cadastro.', profileError);
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    // 🔥 LIMPEZA DE CACHE MANUAL (Redundância de segurança)
    localStorage.removeItem('tribebuild_cached_profile');
    localStorage.removeItem('tribebuild_cached_plan');
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
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
      const newProfile = { ...profile, ...updates };
      setProfile(newProfile);
      // 🔥 ATUALIZA CACHE
      localStorage.setItem('tribebuild_cached_profile', JSON.stringify(newProfile));
    }
    return { error };
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const userProfile = await fetchProfile(user.id, user.email);
    if (userProfile) setProfile(userProfile);
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