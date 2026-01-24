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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔧 CORREÇÃO 1: Timeout reduzido e controle de requisições
  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<Profile | null> => {
    try {
      // 🔧 Timeout de 3 segundos (reduzido de 6s)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao buscar perfil')), 3000)
      );

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        // 🔧 NÃO cria perfil automaticamente em qualquer erro
        if (error.code === 'PGRST116') {
          console.warn('[Auth] Perfil não encontrado. Tentando buscar novamente...');

          // Tenta buscar novamente SEM timeout
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(); // maybeSingle permite retornar null se não achar

          if (!retryError && retryData) {
            return retryData as Profile;
          }

          // Se ainda não encontrou, cria apenas para NOVOS usuários
          console.warn('[Auth] Criando perfil inicial...');
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
            .maybeSingle();

          if (!createError && newProfile) {
            console.log('[Auth] Perfil criado com sucesso.');
            return newProfile as Profile;
          }

          console.error('[Auth] Falha ao criar perfil:', createError);
        } else {
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
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (mounted && initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          const userProfile = await fetchProfile(initialSession.user.id, initialSession.user.email);
          if (mounted) setProfile(userProfile);
        }
      } catch (error) {
        console.error('[Auth] Erro na inicialização:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // 🔧 Listener otimizado - só busca perfil UMA VEZ no login
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
          setSession(newSession);
          setUser(newSession.user);

          // 🛡️ Só busca perfil no SIGNED_IN (não em INITIAL_SESSION)
          if (event === 'SIGNED_IN') {
            console.log('[Auth] Login detectado, buscando perfil...');
            const userProfile = await fetchProfile(newSession.user.id, newSession.user.email);
            if (mounted) setProfile(userProfile);
          }

          setLoading(false);
        }
      }
    );

    authSubscription = subscription;

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string, cpf?: string, phone?: string) => {
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
    if (error) {
      setLoading(false);
    }
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
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
      setProfile({ ...profile, ...updates });
    }
    return { error };
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
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