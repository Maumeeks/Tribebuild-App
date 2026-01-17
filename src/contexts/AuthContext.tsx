import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
// A linha abaixo vai parar de dar erro agora que você salvou o PASSO 1
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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) return null;
      return data as Profile;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            const userProfile = await fetchProfile(initialSession.user.id);
            if (mounted) setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error("Erro auth:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
           if (newSession?.user) {
             const userProfile = await fetchProfile(newSession.user.id);
             if (mounted) setProfile(userProfile);
           }
        } else if (event === 'SIGNED_OUT') {
           if (mounted) {
             setProfile(null);
             setUser(null);
           }
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, cpf?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName, cpf: cpf || null } },
      });
      if (error) return { error };
      return { error: null };
    } catch (err) { return { error: err as AuthError }; }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) { return { error: err as AuthError }; }
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err) { return { error: err as AuthError }; }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) return { error };
      if (profile) setProfile({ ...profile, ...updates });
      return { error: null };
    } catch (err) { return { error: err as Error }; }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userProfile = await fetchProfile(user.id);
    setProfile(userProfile);
  };

  const isTrialActive = Boolean(profile?.plan_status === 'trial' && profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date());
  const trialDaysLeft = profile?.trial_ends_at ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  const value: AuthContextType = {
    user, profile, session, loading, signUp, signIn, signOut, resetPassword, updateProfile, refreshProfile, isTrialActive, trialDaysLeft,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;