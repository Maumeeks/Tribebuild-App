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

  // 🛡️ PROTEÇÃO 1: Busca de perfil com Timeout e Auto-Criação
  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<Profile | null> => {
    try {
      console.log('[Auth] Buscando profile para:', userId);

      // Timeout Promise: Rejeita se demorar mais de 5s
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao buscar perfil')), 5000)
      );

      // Corrida: Banco de Dados vs Timeout
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        // 🛡️ PROTEÇÃO 3: Auto-Healing (Se não achar, cria!)
        if (error.code === 'PGRST116') {
          console.warn('[Auth] Perfil não encontrado. Tentando criar perfil de emergência...');
          // Tenta criar um perfil básico na hora
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              email: userEmail || 'no-email',
              full_name: 'Usuário',
              plan: 'starter',
              plan_status: 'active'
            }])
            .select()
            .single();

          if (!createError && newProfile) {
            console.log('[Auth] Perfil de emergência criado com sucesso!');
            return newProfile as Profile;
          }
        }

        console.warn('[Auth] Erro ao buscar profile:', error.message);
        return null;
      }

      console.log('[Auth] Profile encontrado, status:', data?.plan_status);
      return data as Profile;

    } catch (err) {
      console.error('[Auth] Erro ou Timeout:', err);
      // Em caso de timeout, retornamos null para não travar o app
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initialize = async () => {
      try {
        console.log('[Auth] Inicializando...');

        // Configura Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('[Auth] Evento:', event);
            if (!mounted) return;

            if (event === 'SIGNED_OUT') {
              setSession(null);
              setUser(null);
              setProfile(null);
              setLoading(false);
            } else if (newSession?.user) {
              setSession(newSession);
              setUser(newSession.user);

              // Tenta buscar profile, mas garante setLoading(false) no final
              try {
                const userProfile = await fetchProfile(newSession.user.id, newSession.user.email);
                if (mounted) setProfile(userProfile);
              } finally {
                // 🛡️ PROTEÇÃO 2: Garantia de destravar o loading
                if (mounted) setLoading(false);
              }
            } else {
              setLoading(false);
            }
          }
        );

        authSubscription = subscription;

        // Pega sessão inicial
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (mounted && currentSession?.user) {
          console.log('[Auth] Sessão existente encontrada');
          setSession(currentSession);
          setUser(currentSession.user);

          try {
            const userProfile = await fetchProfile(currentSession.user.id, currentSession.user.email);
            if (mounted) setProfile(userProfile);
          } catch (e) {
            console.error('Erro no fetch inicial', e);
          }
        }

      } catch (err) {
        console.error('[Auth] Falha na inicializacao:', err);
      } finally {
        // 🛡️ PROTEÇÃO 2: Garantia de destravar o loading (para a inicialização)
        if (mounted) {
          // Pequeno delay para evitar flash se o listener já tiver resolvido
          setTimeout(() => setLoading(false), 100);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string, cpf?: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({
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
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user') };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error && profile) setProfile({ ...profile, ...updates });
    return { error };
  };

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    console.log('[Auth] Refresh manual do profile...');
    const userProfile = await fetchProfile(user.id, user.email);
    setProfile(userProfile);
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