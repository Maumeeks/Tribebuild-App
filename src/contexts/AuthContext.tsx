import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  // ✅ ATUALIZADO: Agora aceita phone como parâmetro opcional
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

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log('[Auth] Buscando profile para:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[Auth] Erro ao buscar profile:', error.message);
        return null;
      }
      console.log('[Auth] Profile encontrado, status:', data?.plan_status);
      return data as Profile;
    } catch (err) {
      console.error('[Auth] Erro critico:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initialize = async () => {
      try {
        console.log('[Auth] Inicializando...');
        
        // Primeiro: configura o listener ANTES de pegar a sessão
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('[Auth] Evento:', event);
            
            if (!mounted) return;

            if (event === 'SIGNED_OUT') {
              setSession(null);
              setUser(null);
              setProfile(null);
              setLoading(false);
              return;
            }

            if (newSession?.user) {
              setSession(newSession);
              setUser(newSession.user);
              
              // Busca profile em background
              const userProfile = await fetchProfile(newSession.user.id);
              if (mounted) {
                setProfile(userProfile);
                setLoading(false);
              }
            } else {
              setSession(null);
              setUser(null);
              setProfile(null);
              setLoading(false);
            }
          }
        );
        
        authSubscription = subscription;

        // Segundo: pega sessão atual (pode já existir)
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted && currentSession?.user) {
          console.log('[Auth] Sessao existente encontrada');
          setSession(currentSession);
          setUser(currentSession.user);
          
          const userProfile = await fetchProfile(currentSession.user.id);
          if (mounted) {
            setProfile(userProfile);
          }
        }
        
        // Sempre finaliza loading
        if (mounted) {
          setLoading(false);
        }

      } catch (err) {
        console.error('[Auth] Falha na inicializacao:', err);
        if (mounted) setLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // ✅ FUNÇÃO CORRIGIDA: Recebe phone e envia para o Supabase
  const signUp = async (email: string, password: string, fullName: string, cpf?: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName, 
          cpf: cpf || null,
          phone: phone || null // Agora salva o telefone no banco
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