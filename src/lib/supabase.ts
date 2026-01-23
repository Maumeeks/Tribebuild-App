import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Configuração do Cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// --- TIPOS (ESSENCIAIS PARA O AUTHCONTEXT) ---

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  avatar_url: string | null;
  plan: 'free' | 'starter' | 'professional' | 'business' | 'enterprise';
  plan_status: 'free' | 'trial' | 'active' | 'canceled' | 'expired';
  products: string[]; // ✅ ADICIONADO: Array de IDs de produtos comprados pelo aluno
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type App = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  language: string; // ✅ ADICIONADO: Conforme seu script SQL
  custom_domain: string | null; // ✅ ADICIONADO: Conforme seu script SQL
  status: 'draft' | 'published'; // ✅ ADICIONADO: Conforme seu script SQL
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  app_id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  checkout_url: string | null; // ✅ ADICIONADO: Essencial para o botão do Cadeado
  price: number;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  app_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: 'active' | 'inactive' | 'blocked';
  source: string;
  products: string[]; // ✅ ADICIONADO: Para controle individual de Upsells por aluno
  external_id: string | null;
  metadata: Record<string, any>;
  last_access_at: string | null;
  created_at: string;
  updated_at: string;
};

// ... restante dos tipos (Module, Lesson, Integration, Subscription) permanecem iguais ...

export type Lesson = {
  id: string;
  module_id: string;
  name: string;
  description: string | null;
  video_url: string | null;
  video_duration: number;
  content: string | null;
  attachments: any[];
  order_index: number;
  is_active: boolean;
  is_free: boolean;
  created_at: string;
  updated_at: string;
};

export default supabase;