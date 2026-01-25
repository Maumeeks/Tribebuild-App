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

  // 🔧 CORREÇÃO: Query otimizada com retry
  const fetchProfile = useCallback(async (userId: string, retries = 3): Promise<Profile | null> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[Auth] 🔍 Tentativa ${attempt}/${retries} - Buscando perfil...`);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error(`[Auth] ❌ Erro na tentativa ${attempt}:`, error.message);

          // Se for último retry e ainda não tem perfil, NÃO cria
          if (attempt === retries) {
            console.error('[Auth] 🚨 Todas tentativas falharam');
            return null;
          }

          // Aguarda antes do próximo retry (100ms, 200ms, 300ms)
          await new Promise(resolve => setTimeout(resolve, attempt * 100));
          continue;
        }

        if (!data) {
          console.warn('[Auth] ⚠️ Perfil não encontrado no banco');

          // IMPORTANTE: Não cria perfil automaticamente!
          // O trigger do Supabase deve fazer isso
          return null;
        }

        console.log('[Auth] ✅ Perfil carregado!');
        console.log('[Auth] 📊 Plan:', data.plan, '| Status:', data.plan_status);
        return data as Profile;

      } catch (err: any) {
        console.error(`[Auth] ❌ Exceção na tentativa ${attempt}:`, err.message);

        if (attempt === retries) {
          return null;
        }

        await new Promise(resolve => setTimeout(resolve, attempt * 100));
      }
    }

    return null;
  }, []);

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] 🚀 Inicializando...');

        // Aguarda 200ms para garantir que o Supabase está pronto
        await new Promise(resolve => setTimeout(resolve, 200));

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] ❌ Erro ao buscar sessão:', error);
          if (mounted) setLoading(false);
          return;
        }

        if (mounted && initialSession?.user) {
          console.log('[Auth] ✅ Sessão encontrada:', initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);

          // Aguarda mais 300ms antes de buscar o perfil
          await new Promise(resolve => setTimeout(resolve, 300));

          const userProfile = await fetchProfile(initialSession.user.id);
          if (mounted) {
            setProfile(userProfile);
            setLoading(false);
          }
        } else {
          console.log('[Auth] ℹ️ Nenhuma sessão ativa');
          if (mounted) setLoading(false);
        }
      } catch (error) {
        console.error('[Auth] ❌ Erro fatal na inicialização:', error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listener de mudanças de auth
    const setupAuthListener = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (!mounted) return;

          console.log(`[Auth] 📡 Evento: ${event}`);

          if (event === 'SIGNED_OUT' || !newSession) {
            console.log('[Auth] 👋 Usuário deslogado');
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
          } else if (event === 'SIGNED_IN' && newSession?.user) {
            console.log('[Auth] 👤 Login detectado:', newSession.user.email);
            setSession(newSession);
            setUser(newSession.user);

            // Aguarda 500ms após login para buscar perfil
            await new Promise(resolve => setTimeout(resolve, 500));

            const userProfile = await fetchProfile(newSession.user.id);
            if (mounted) {
              setProfile(userProfile);
              setLoading(false);
            }
          } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
            console.log('[Auth] 🔄 Token atualizado');
            setSession(newSession);
            setUser(newSession.user);
            // Não busca perfil no refresh para evitar chamadas desnecessárias
            setLoading(false);
          } else if (event === 'INITIAL_SESSION') {
            // Ignora INITIAL_SESSION pois já foi tratado no initializeAuth
            console.log('[Auth] ℹ️ INITIAL_SESSION ignorado (já tratado)');
          }
        }
      );

      authSubscription = subscription;
    };

    setupAuthListener();

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

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('[Auth] ❌ Erro no login:', error);
      setLoading(false);
    }
    // Não seta loading false aqui pois o listener vai cuidar disso

    return { error };
  };

  const signOut = async () => {
    console.log('[Auth] 🚪 Fazendo logout...');
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

    console.log('[Auth] 💾 Atualizando perfil...');
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error && profile) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      console.log('[Auth] ✅ Perfil atualizado:', updatedProfile.plan);
    } else if (error) {
      console.error('[Auth] ❌ Erro ao atualizar:', error);
    }

    return { error };
  };

  const refreshProfile = useCallback(async () => {
    if (!user) {
      console.warn('[Auth] ⚠️ Não pode atualizar: usuário não autenticado');
      return;
    }

    console.log('[Auth] 🔄 Atualizando perfil manualmente...');
    setLoading(true);
    const userProfile = await fetchProfile(user.id);
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