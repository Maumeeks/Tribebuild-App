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

  // 🔧 CORREÇÃO: Query com logging detalhado
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log('[Auth] 🔍 Buscando perfil para:', userId);

      // Query DIRETA
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // 🚨 LOG DETALHADO DO ERRO
      if (error) {
        console.error('[Auth] ❌ ERRO CRÍTICO ao buscar perfil:');
        console.error('Código:', error.code);
        console.error('Mensagem:', error.message);
        console.error('Detalhes:', error.details);
        console.error('Hint:', error.hint);

        // 🛡️ FALLBACK: Tenta criar perfil se não existir
        if (error.code === 'PGRST116' || !data) {
          console.warn('[Auth] Tentando criar perfil de emergência...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user?.email || '',
              full_name: 'Usuário',
              plan: 'enterprise', // 🔧 FORÇA Enterprise!
              plan_status: 'active'
            })
            .select()
            .maybeSingle();

          if (createError) {
            console.error('[Auth] ❌ Falha ao criar perfil:', createError);
          } else {
            console.log('[Auth] ✅ Perfil criado:', newProfile);
            return newProfile as Profile;
          }
        }

        return null;
      }

      if (!data) {
        console.warn('[Auth] ⚠️ Perfil não encontrado (data é null)');
        return null;
      }

      console.log('[Auth] ✅ Perfil carregado com sucesso!');
      console.log('[Auth] Plan:', data.plan);
      console.log('[Auth] Status:', data.plan_status);
      return data as Profile;

    } catch (err: any) {
      console.error('[Auth] ❌ EXCEÇÃO no fetchProfile:', err);
      console.error('[Auth] Stack:', err.stack);
      return null;
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Inicializando autenticação...');

        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (mounted && initialSession?.user) {
          console.log('[Auth] Sessão encontrada');
          setSession(initialSession);
          setUser(initialSession.user);

          const userProfile = await fetchProfile(initialSession.user.id);
          if (mounted) setProfile(userProfile);
        }
      } catch (error) {
        console.error('[Auth] Erro na inicialização:', error);
      } finally {
        if (mounted) {
          console.log('[Auth] Inicialização concluída');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 🔧 Listener simplificado
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

          // Só busca perfil no SIGNED_IN
          if (event === 'SIGNED_IN') {
            const userProfile = await fetchProfile(newSession.user.id);
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

    // O trigger handle_new_user() vai criar o profile automaticamente
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
    console.log('[Auth] Atualizando perfil...');
    const userProfile = await fetchProfile(user.id);
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