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
  addApp: (appData: Omit<App, 'id' | 'createdAt' | 'accessLink'>) => Promise<string>; // Alterado para Promise para permitir await
  updateApp: (id: string, data: Partial<App>) => void;
  deleteApp: (id: string) => void;
  getApp: (id: string) => App | undefined;
  planLimit: number;
}

// REGRAS DE NEGÓCIO (LIMITES EXATOS DA OFERTA)
const PLAN_LIMITS: Record<string, number> = {
  free: 1,          // Degustação / Erro
  starter: 1,       // Oferta: 1 App
  professional: 3,  // Oferta: 3 Apps
  business: 5,      // Oferta: 5 Apps
  enterprise: 10    // Oferta: 10 Apps
};

const AppsContext = createContext<AppsContextType | undefined>(undefined);

export const AppsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<App[]>([]);
  const { profile } = useAuth();

  // Carrega apps do localStorage (Persistência Local para MVP)
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

  // Salva no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('tribebuild_apps', JSON.stringify(apps));
  }, [apps]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- A MÁGICA DA CORREÇÃO ---
  // 1. Pega o plano ou assume 'free'
  // 2. Transforma em minúsculo (.toLowerCase()) para garantir que "Professional" vire "professional"
  const rawPlan = profile?.plan || 'free';
  const currentPlan = rawPlan.toLowerCase();

  // 3. Busca o limite correto na tabela. Se não achar, garante 1 (fallback seguro).
  const planLimit = PLAN_LIMITS[currentPlan] || 1;

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