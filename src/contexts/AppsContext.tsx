import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

// ✅ 1. Adicionado login_type na definição do App
export interface App {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  primaryColor: string;
  language: string;
  createdAt: string;
  accessLink: string;
  customDomain: string | null;
  status: 'draft' | 'published';
  login_type: 'email_password' | 'magic_link';
}

interface AppsContextType {
  apps: App[];
  loading: boolean;
  // Atualizei a tipagem do addApp para aceitar o login_type
  addApp: (appData: Omit<App, 'id' | 'createdAt' | 'accessLink' | 'status'>) => Promise<string>;
  updateApp: (id: string, data: Partial<App>) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  getApp: (id: string) => App | undefined;
  planLimit: number;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  starter: 1,
  professional: 3,
  business: 5,
  enterprise: 10
};

const AppsContext = createContext<AppsContextType | undefined>(undefined);

export const AppsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const [cachedPlan, setCachedPlan] = useState(() => {
    return localStorage.getItem('tribebuild_cached_plan');
  });

  useEffect(() => {
    if (profile?.plan) {
      const plan = profile.plan;
      setCachedPlan(plan);
      localStorage.setItem('tribebuild_cached_plan', plan);
    }
  }, [profile]);

  const effectivePlan = profile?.plan || cachedPlan || 'starter';
  const currentPlan = effectivePlan.toLowerCase().trim();
  const planLimit = PLAN_LIMITS[currentPlan] || 1;

  // --- SINCROZINAÇÃO COM SUPABASE ---

  const fetchApps = useCallback(async () => {
    if (!user) {
      setApps([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedApps: App[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          logo: item.logo,
          primaryColor: item.primary_color,
          language: item.language,
          createdAt: item.created_at,
          customDomain: item.custom_domain,
          status: item.status as 'draft' | 'published',
          // ✅ 2. Lendo do banco (com valor padrão se estiver vazio)
          login_type: item.login_type || 'email_password',
          accessLink: item.custom_domain ? `https://${item.custom_domain}` : `https://app.tribebuild.pro/${item.slug}`,
        }));
        setApps(mappedApps);
      }
    } catch (err) {
      console.error('[Apps] Erro ao buscar apps:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const addApp = async (appData: Omit<App, 'id' | 'createdAt' | 'accessLink' | 'status'>): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    if (apps.length >= planLimit) {
      const errorMsg = `Limite atingido! O plano ${currentPlan.toUpperCase()} permite apenas ${planLimit} app(s).`;
      alert(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { data, error } = await supabase
        .from('apps')
        .insert([{
          user_id: user.id,
          name: appData.name,
          slug: appData.slug,
          description: appData.description,
          logo: appData.logo,
          primary_color: appData.primaryColor,
          language: appData.language,
          custom_domain: appData.customDomain,
          status: 'draft',
          // ✅ 3. Salvando no banco
          login_type: appData.login_type || 'email_password'
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newApp: App = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          logo: data.logo,
          primaryColor: data.primary_color,
          language: data.language,
          createdAt: data.created_at,
          customDomain: data.custom_domain,
          status: data.status,
          login_type: data.login_type || 'email_password',
          accessLink: data.custom_domain ? `https://${data.custom_domain}` : `https://app.tribebuild.pro/${data.slug}`
        };
        setApps(prev => [newApp, ...prev]);
        return data.id;
      }
      return '';
    } catch (err: any) {
      console.error('[Apps] Erro ao criar app:', err);
      if (err.code === '23505') {
        alert('Já existe um app com este identificador (slug). Tente outro.');
        throw new Error('Slug duplicado');
      }
      throw new Error(err.message || 'Erro ao criar aplicativo');
    }
  };

  const updateApp = async (id: string, data: Partial<App>) => {
    try {
      const dbData: any = {};
      if (data.name) dbData.name = data.name;
      if (data.slug) dbData.slug = data.slug;
      if (data.description) dbData.description = data.description;
      if (data.logo) dbData.logo = data.logo;
      if (data.primaryColor) dbData.primary_color = data.primaryColor;
      if (data.language) dbData.language = data.language;
      if (data.customDomain) dbData.custom_domain = data.customDomain;
      if (data.status) dbData.status = data.status;
      // ✅ 4. Atualizando no banco
      if (data.login_type) dbData.login_type = data.login_type;

      const { error } = await supabase
        .from('apps')
        .update(dbData)
        .eq('id', id);

      if (error) throw error;

      setApps(prev => prev.map(app =>
        app.id === id ? { ...app, ...data } : app
      ));
    } catch (err) {
      console.error('[Apps] Erro ao atualizar:', err);
      alert('Erro ao salvar alterações.');
    }
  };

  const deleteApp = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este app? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('apps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApps(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      console.error('[Apps] Erro ao deletar:', err);
      alert('Erro ao excluir aplicativo. Verifique se não há produtos vinculados.');
    }
  };

  const getApp = (id: string) => {
    return apps.find(app => app.id === id);
  };

  return (
    <AppsContext.Provider value={{ apps, loading, addApp, updateApp, deleteApp, getApp, planLimit }}>
      {children}
    </AppsContext.Provider>
  );
};

export const useApps = () => {
  const context = useContext(AppsContext);
  if (!context) {
    throw new Error('useApps must be used within AppsProvider');
  }
  return context;
};