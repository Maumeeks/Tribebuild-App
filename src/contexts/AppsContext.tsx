import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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
}

interface AppsContextType {
  apps: App[];
  loading: boolean; // Adicionado para saber quando está carregando do banco
  addApp: (appData: Omit<App, 'id' | 'createdAt' | 'accessLink' | 'status'>) => Promise<string>;
  updateApp: (id: string, data: Partial<App>) => Promise<void>; // Agora é Promise (async)
  deleteApp: (id: string) => Promise<void>; // Agora é Promise (async)
  getApp: (id: string) => App | undefined;
  planLimit: number;
}

// REGRAS DE NEGÓCIO (LIMITES EXATOS DA OFERTA)
const PLAN_LIMITS: Record<string, number> = {
  free: 1,          // Fallback
  starter: 1,       // Oferta: 1 App
  professional: 3,  // Oferta: 3 Apps
  business: 5,      // Oferta: 5 Apps
  enterprise: 10    // Oferta: 10 Apps
};

const AppsContext = createContext<AppsContextType | undefined>(undefined);

export const AppsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  // --- 🛡️ CORREÇÃO DO BUG "PISCA-STARTER" (Mantida) ---
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

  // --- ☁️ SINCROZINAÇÃO COM SUPABASE ---

  // 1. Buscar Apps do Banco
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
        // Converte do formato do Banco (snake_case) para o App (camelCase)
        const mappedApps: App[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          logo: item.logo,
          primaryColor: item.primary_color, // Banco: primary_color -> App: primaryColor
          language: item.language,
          createdAt: item.created_at,
          customDomain: item.custom_domain,
          status: item.status as 'draft' | 'published',
          accessLink: `https://app.tribebuild.com/app/${item.slug}`,
        }));
        setApps(mappedApps);
      }
    } catch (err) {
      console.error('[Apps] Erro ao buscar apps:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carrega apps ao iniciar ou mudar usuário
  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  // 2. Adicionar App (Salva no Banco)
  const addApp = async (appData: Omit<App, 'id' | 'createdAt' | 'accessLink' | 'status'>): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    // Validação de Limite
    if (apps.length >= planLimit) {
      const errorMsg = `Limite atingido! O plano ${currentPlan.toUpperCase()} permite apenas ${planLimit} app(s).`;
      alert(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Inserir no Supabase
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
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualiza estado local imediatamente (Optimistic UI)
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
          accessLink: `https://app.tribebuild.com/app/${data.slug}`
        };
        setApps(prev => [newApp, ...prev]);
        return data.id;
      }
      return '';
    } catch (err: any) {
      console.error('[Apps] Erro ao criar app:', err);
      // Se for erro de slug duplicado (código 23505 no Postgres), avisar
      if (err.code === '23505') {
        alert('Já existe um app com este identificador (slug). Tente outro.');
        throw new Error('Slug duplicado');
      }
      throw new Error(err.message || 'Erro ao criar aplicativo');
    }
  };

  // 3. Atualizar App (Salva no Banco)
  const updateApp = async (id: string, data: Partial<App>) => {
    try {
      // Prepara dados para o banco (mapeando camelCase -> snake_case)
      const dbData: any = {};
      if (data.name) dbData.name = data.name;
      if (data.slug) dbData.slug = data.slug;
      if (data.description) dbData.description = data.description;
      if (data.logo) dbData.logo = data.logo;
      if (data.primaryColor) dbData.primary_color = data.primaryColor;
      if (data.language) dbData.language = data.language;
      if (data.customDomain) dbData.custom_domain = data.customDomain;
      if (data.status) dbData.status = data.status;

      const { error } = await supabase
        .from('apps')
        .update(dbData)
        .eq('id', id);

      if (error) throw error;

      // Atualiza estado local
      setApps(prev => prev.map(app =>
        app.id === id ? { ...app, ...data } : app
      ));
    } catch (err) {
      console.error('[Apps] Erro ao atualizar:', err);
      alert('Erro ao salvar alterações.');
    }
  };

  // 4. Deletar App (Remove do Banco)
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