import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  refreshProfile: () => Promise<void>;
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, cpf?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  isTrialActive: boolean;
  trialDaysLeft: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar perfil do usuário
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false); // <--- nova linha
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      setLoading(false); // <--- nova linha
      return null;
    }
  };

  // Inicializar autenticação
  useEffect(() => {
    // Verificar sessão existente
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      }
    };

    initAuth();

    // Listener para mudanças de autenticação
        // Listener para mudanças de autenticação (versão melhorada)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('[Auth] Estado de login mudou:', event);

          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            const userProfile = await fetchProfile(newSession.user.id);
            setProfile(userProfile || null);
            setLoading(false);
          } else {
            setProfile(null);
            setLoading(false);
          }
        }
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Cadastro
  const signUp = async (email: string, password: string, fullName: string, cpf?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            cpf: cpf || null,
          },
        },
      });

      if (error) return { error };

      // Atualizar profile com CPF se fornecido
      if (data.user && cpf) {
        await supabase
          .from('profiles')
          .update({ cpf, full_name: fullName })
          .eq('id', data.user.id);
      }

      return { error: null };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  // Logout
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Resetar senha
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { error };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) return { error };

      // Atualizar estado local
      if (profile) {
        setProfile({ ...profile, ...updates });
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Calcular trial
  const calculateTrialStatus = () => {
    if (!profile?.trial_ends_at) {
      return { isActive: false, daysLeft: 0 };
    }

    const trialEnd = new Date(profile.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      isActive: diffDays > 0 && profile.plan_status === 'trial',
      daysLeft: Math.max(0, diffDays),
    };
  };

  const { isActive: isTrialActive, daysLeft: trialDaysLeft } = calculateTrialStatus();

    // Função para atualizar os dados do usuário manualmente (usaremos depois do pagamento)
  const refreshProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const userProfile = await fetchProfile(user.id);
    setProfile(userProfile);
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    isTrialActive,
    trialDaysLeft,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
