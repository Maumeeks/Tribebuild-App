export enum PlanType {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: PlanType;
}

// ⚠️ Interface legada (mantenha se tiver outros arquivos usando, mas a principal agora é 'App')
export interface PWAApp {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  language: string;
  status: 'draft' | 'published';
  stats: {
    users: number;
    views: number;
    engagement: number;
  };
  customDomain?: string | null;
  description?: string;
  // Adicionado para compatibilidade caso algo use essa interface
  login_type?: 'email_password' | 'magic_link';
}

export interface Product {
  id: string;
  appId: string;
  title: string;
  description: string;
  type: 'ebook' | 'video' | 'course';
  price?: number;
  thumbnailUrl?: string;
}

export interface Post {
  id: string;
  appId: string;
  content: string;
  publishedAt: string;
  stats: {
    likes: number;
    comments: number;
  };
}

// ✅ ESTA É A INTERFACE PRINCIPAL QUE O APP BUILDER USA
export interface App {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string | null;
  primaryColor: string;
  language?: string;
  status: 'draft' | 'published' | 'archived';
  customDomain?: string | null;
  createdAt: string;

  // Adicionado para evitar erro na AppsPage
  accessLink?: string;

  // ✅ CORREÇÃO DO ERRO NO APP BUILDER:
  login_type?: 'email_password' | 'magic_link';
}