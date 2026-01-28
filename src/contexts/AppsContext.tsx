import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

// ✅ ÚNICA DECLARAÇÃO DA INTERFACE APP (com todos os campos)
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

  // ✅ NOVOS CAMPOS (adicionados aqui!)
  banners: Array<{
    image_url: string | null;
    link: string;
  }>;
  support_type: 'email' | 'whatsapp' | null;
  support_value: string;
}

interface AppsContextType {
  apps: App[];
  loading: boolean;
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

  // --- SINCRONIZAÇÃO COM SUPABASE ---

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
          description: item.description || '',
          logo: item.logo || null,
          primaryColor: item.primary_color || '#0066FF',
          language: item.language || 'PT',
          createdAt: item.created_at,
          customDomain: item.custom_domain || null,
          status: item.status as 'draft' | 'published',
          login_type: item.login_type || 'email_password',
          accessLink: item.custom_domain
            ? `https://${item.custom_domain}`
            : `https://app.tribebuild.pro/${item.slug}`,
          // ✅ Novos campos
          banners: item.banners || [
            { image_url: null, link: '' },
            { image_url: null, link: '' },
            { image_url: null, link: '' }
          ],
          support_type: item.support_type || null,
          support_value: item.support_value || ''
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
          description: appData.description || '',
          logo: appData.logo || null,
          primary_color: appData.primaryColor || '#0066FF',
          language: appData.language || 'PT',
          custom_domain: appData.customDomain || null,
          status: 'draft',
          login_type: appData.login_type || 'email_password',
          // ✅ Novos campos
          banners: appData.banners || [
            { image_url: null, link: '' },
            { image_url: null, link: '' },
            { image_url: null, link: '' }
          ],
          support_type: appData.support_type || null,
          support_value: appData.support_value || ''
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newApp: App = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          logo: data.logo || null,
          primaryColor: data.primary_color || '#0066FF',
          language: data.language || 'PT',
          createdAt: data.created_at,
          customDomain: data.custom_domain || null,
          status: data.status,
          login_type: data.login_type || 'email_password',
          accessLink: data.custom_domain
            ? `https://${data.custom_domain}`
            : `https://app.tribebuild.pro/${data.slug}`,
          // ✅ Novos campos
          banners: data.banners || [
            { image_url: null, link: '' },
            { image_url: null, link: '' },
            { image_url: null, link: '' }
          ],
          support_type: data.support_type || null,
          support_value: data.support_value || ''
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
      if (data.name !== undefined) dbData.name = data.name;
      if (data.slug !== undefined) dbData.slug = data.slug;
      if (data.description !== undefined) dbData.description = data.description;
      if (data.logo !== undefined) dbData.logo = data.logo;
      if (data.primaryColor !== undefined) dbData.primary_color = data.primaryColor;
      if (data.language !== undefined) dbData.language = data.language;
      if (data.customDomain !== undefined) dbData.custom_domain = data.customDomain;
      if (data.status !== undefined) dbData.status = data.status;
      if (data.login_type !== undefined) dbData.login_type = data.login_type;
      // ✅ Novos campos
      if (data.banners !== undefined) dbData.banners = data.banners;
      if (data.support_type !== undefined) dbData.support_type = data.support_type;
      if (data.support_value !== undefined) dbData.support_value = data.support_value;

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