import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Configuração do Cliente (incluindo o PKCE para corrigir o loop)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// --- É AQUI QUE O ERRO ACONTECE: ESSES TIPOS PRECISAM EXISTIR ---

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  avatar_url: string | null;
  plan: 'free' | 'starter' | 'professional' | 'business' | 'enterprise';
  plan_status: 'trial' | 'active' | 'canceled' | 'expired';
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
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
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
};

// Adicionei os outros tipos essenciais para evitar erros futuros
export type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: 'starter' | 'professional' | 'business' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  created_at: string;
  updated_at: string;
};

export default supabase;