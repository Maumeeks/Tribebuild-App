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
  plan_status: 'free' | 'trial' | 'active' | 'canceled' | 'expired';  // DEVE TER 'free' E 'trial'
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id?: string | null;  // DEVE TER ESSE CAMPO
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

export type Product = {
  id: string;
  app_id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type Module = {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

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

export type Client = {
  id: string;
  app_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: 'active' | 'inactive' | 'blocked';
  source: string;
  external_id: string | null;
  metadata: Record<string, any>;
  last_access_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Integration = {
  id: string;
  user_id: string;
  app_id: string;
  platform: string;
  webhook_url: string;
  webhook_secret: string | null;
  is_active: boolean;
  product_mapping: Record<string, any>;
  last_webhook_at: string | null;
  webhook_count: number;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: 'starter' | 'professional' | 'business' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
};

export default supabase;