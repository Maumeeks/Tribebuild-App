import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  addApp: (appData: Omit<App, 'id' | 'createdAt' | 'accessLink'>) => Promise<string>;
  updateApp: (id: string, data: Partial<App>) => void;
  deleteApp: (id: string) => void;
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
  const { profile } = useAuth(); // Pegamos o loading se necessário, mas a lógica abaixo resolve

  // --- 💾 PERSISTÊNCIA DE APPS (MVP) ---
  useEffect(() => {
    const savedApps = localStorage.getItem('tribebuild_apps');
    if (savedApps) {
      try {
        setApps(JSON.parse(savedApps));
      } catch (e) {
        console.error("Failed to parse saved apps", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tribebuild_apps', JSON.stringify(apps));
  }, [apps]);

  // --- 🛡️ CORREÇÃO DO BUG "PISCA-STARTER" ---

  // 1. Estado para guardar o último plano conhecido (Cache Local)
  const [cachedPlan, setCachedPlan] = useState(() => {
    // Tenta recuperar do localStorage ao iniciar
    return localStorage.getItem('tribebuild_cached_plan');
  });

  // 2. Atualiza o cache sempre que o profile real do Supabase chegar
  useEffect(() => {
    if (profile?.plan) {
      const plan = profile.plan;
      setCachedPlan(plan);
      localStorage.setItem('tribebuild_cached_plan', plan);
    }
  }, [profile]);

  // 3. CÁLCULO INTELIGENTE DO PLANO:
  // - Prioridade A: Perfil Real (Se já carregou)
  // - Prioridade B: Cache Local (Se está carregando, usa o último conhecido)
  // - Prioridade C: 'starter' (Se é usuário novo e nunca logou)
  const effectivePlan = profile?.plan || cachedPlan || 'starter';

  // 4. Normalização
  const currentPlan = effectivePlan.toLowerCase().trim();

  // 5. Definição do Limite
  const planLimit = PLAN_LIMITS[currentPlan] || 1;

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addApp = async (appData: Omit<App, 'id' | 'createdAt' | 'accessLink'>): Promise<string> => {
    // --- A BLINDAGEM ---
    if (apps.length >= planLimit) {
      const errorMsg = `Limite atingido! O plano ${currentPlan.toUpperCase()} permite apenas ${planLimit} app(s).`;
      alert(errorMsg);
      throw new Error(errorMsg);
    }
    // -------------------

    const id = generateId();
    const newApp: App = {
      ...appData,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      accessLink: `https://app.tribebuild.com/app/${appData.slug}`,
    };

    setApps(prev => [...prev, newApp]);
    return id;
  };

  const updateApp = (id: string, data: Partial<App>) => {
    setApps(prev => prev.map(app =>
      app.id === id ? { ...app, ...data } : app
    ));
  };

  const deleteApp = (id: string) => {
    setApps(prev => prev.filter(app => app.id !== id));
  };

  const getApp = (id: string) => {
    return apps.find(app => app.id === id);
  };

  return (
    <AppsContext.Provider value={{ apps, addApp, updateApp, deleteApp, getApp, planLimit }}>
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