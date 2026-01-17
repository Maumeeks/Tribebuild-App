import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext'; // <--- Importação para verificar o plano

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
  addApp: (appData: Omit<App, 'id' | 'createdAt' | 'accessLink'>) => string;
  updateApp: (id: string, data: Partial<App>) => void;
  deleteApp: (id: string) => void;
  getApp: (id: string) => App | undefined;
}

// Regras de Negócio (Limites por Plano)
const PLAN_LIMITS = {
  free: 1,
  starter: 1,
  professional: 3,
  business: 5,
  enterprise: 10
};

const AppsContext = createContext<AppsContextType | undefined>(undefined);

export const AppsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<App[]>([]);
  
  // Pegamos o perfil do usuário para saber qual é o plano atual
  const { profile } = useAuth(); 

  // Load from localStorage on mount
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

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('tribebuild_apps', JSON.stringify(apps));
  }, [apps]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addApp = (appData: Omit<App, 'id' | 'createdAt' | 'accessLink'>) => {
    // --- LÓGICA DE LIMITE (BLINDAGEM) ---
    // Se não tiver perfil carregado, assume 'free' por segurança
    const userPlan = profile?.plan || 'free'; 
    const limit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS] || 1;

    // Verifica se já atingiu o limite
    if (apps.length >= limit) {
      const message = `Limite atingido! O plano ${userPlan.toUpperCase()} permite apenas ${limit} aplicativo(s).`;
      alert(message); // Alerta visual simples para o usuário
      throw new Error(message); // Interrompe a execução
    }
    // ------------------------------------

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
    <AppsContext.Provider value={{ apps, addApp, updateApp, deleteApp, getApp }}>
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