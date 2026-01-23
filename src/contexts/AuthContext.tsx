import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 🛡️ BUSCA DE PERFIL COM AUTO-HEALING
  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Perfil não existe
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              email: userEmail || '',
              full_name: 'Novo Criador',
              plan: 'starter',
              plan_status: 'active',
              avatar_url: null,
              cpf: null,
              phone: null,
              stripe_customer_id: null
            }])
            .select()
            .single();

          if (!createError) return newProfile as Profile;
        }
        return null;
      }
      return data as Profile;
    } catch (err) {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          const p = await fetchProfile(initialSession.user.id, initialSession.user.email);
          if (mounted) setProfile(p);
        }
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const p = await fetchProfile(newSession.user.id, newSession.user.email);
        if (mounted) setProfile(p);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string) => {
    return await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName } }
    });
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Não autenticado') };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error && profile) setProfile({ ...profile, ...updates });
    return { error: error as any };
  };

  const refreshProfile = async () => {
    if (user) {
      setLoading(true);
      const p = await fetchProfile(user.id, user.email);
      setProfile(p);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}; 
