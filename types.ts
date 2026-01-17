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
  // Adicionado para evitar erros no AppBuilder
  customDomain?: string | null;
  description?: string;
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