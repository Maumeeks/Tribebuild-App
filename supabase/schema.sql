-- ============================================================
-- TRIBEBUILD - SCHEMA DO BANCO DE DADOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: profiles (dados extras do usuário)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  cpf TEXT,
  phone TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'business', 'enterprise')),
  plan_status TEXT DEFAULT 'trial' CHECK (plan_status IN ('trial', 'active', 'canceled', 'expired')),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: apps (aplicativos criados pelos produtores)
-- ============================================================
CREATE TABLE public.apps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2563EB',
  secondary_color TEXT DEFAULT '#FF6B6B',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: products (cursos/produtos dentro de um app)
-- ============================================================
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: modules (módulos de um produto/curso)
-- ============================================================
CREATE TABLE public.modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: lessons (aulas de um módulo)
-- ============================================================
CREATE TABLE public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_duration INTEGER DEFAULT 0, -- em segundos
  content TEXT, -- conteúdo em markdown
  attachments JSONB DEFAULT '[]',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT false, -- aula gratuita para preview
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: clients (alunos/membros de um app)
-- ============================================================
CREATE TABLE public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  password_hash TEXT, -- para login no PWA
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  source TEXT DEFAULT 'manual', -- manual, webhook, import
  external_id TEXT, -- ID da plataforma externa (Hotmart, Kiwify, etc)
  metadata JSONB DEFAULT '{}',
  last_access_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, email)
);

-- ============================================================
-- TABELA: client_products (acesso do cliente aos produtos)
-- ============================================================
CREATE TABLE public.client_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'refunded')),
  expires_at TIMESTAMPTZ,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by TEXT DEFAULT 'manual', -- manual, webhook, admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, product_id)
);

-- ============================================================
-- TABELA: client_progress (progresso do cliente nas aulas)
-- ============================================================
CREATE TABLE public.client_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  progress_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, lesson_id)
);

-- ============================================================
-- TABELA: integrations (webhooks configurados)
-- ============================================================
CREATE TABLE public.integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('hotmart', 'kiwify', 'eduzz', 'monetizze', 'ticto', 'perfectpay', 'cartpanda', 'kirvano', 'cakto', 'lastlink', 'payt', 'tribopay', 'frendz', 'b4you', 'custom')),
  webhook_url TEXT NOT NULL UNIQUE,
  webhook_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  product_mapping JSONB DEFAULT '{}', -- mapeamento produto externo -> produto interno
  last_webhook_at TIMESTAMPTZ,
  webhook_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: webhook_logs (logs de webhooks recebidos)
-- ============================================================
CREATE TABLE public.webhook_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- purchase, refund, subscription, etc
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'ignored')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: domains (domínios personalizados)
-- ============================================================
CREATE TABLE public.domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'active', 'failed')),
  ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed')),
  dns_records JSONB DEFAULT '[]',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: subscriptions (assinaturas Stripe)
-- ============================================================
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'professional', 'business', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: feed_posts (posts do feed do app)
-- ============================================================
CREATE TABLE public.feed_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: feed_comments (comentários nos posts)
-- ============================================================
CREATE TABLE public.feed_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: community_posts (comunidade entre alunos)
-- ============================================================
CREATE TABLE public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: notifications (notificações push)
-- ============================================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  action_url TEXT,
  target TEXT DEFAULT 'all' CHECK (target IN ('all', 'specific')),
  target_clients JSONB DEFAULT '[]', -- array de client_ids se target = specific
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================
CREATE INDEX idx_apps_user_id ON public.apps(user_id);
CREATE INDEX idx_apps_slug ON public.apps(slug);
CREATE INDEX idx_products_app_id ON public.products(app_id);
CREATE INDEX idx_modules_product_id ON public.modules(product_id);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_clients_app_id ON public.clients(app_id);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_client_products_client_id ON public.client_products(client_id);
CREATE INDEX idx_client_progress_client_id ON public.client_progress(client_id);
CREATE INDEX idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX idx_integrations_webhook_url ON public.integrations(webhook_url);
CREATE INDEX idx_webhook_logs_integration_id ON public.webhook_logs(integration_id);
CREATE INDEX idx_feed_posts_app_id ON public.feed_posts(app_id);
CREATE INDEX idx_community_posts_app_id ON public.community_posts(app_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para apps
CREATE POLICY "Users can view own apps" ON public.apps
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create apps" ON public.apps
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own apps" ON public.apps
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own apps" ON public.apps
  FOR DELETE USING (user_id = auth.uid());

-- Políticas para products (via app ownership)
CREATE POLICY "Users can manage products" ON public.products
  FOR ALL USING (
    app_id IN (SELECT id FROM public.apps WHERE user_id = auth.uid())
  );

-- Políticas para modules (via product/app ownership)
CREATE POLICY "Users can manage modules" ON public.modules
  FOR ALL USING (
    product_id IN (
      SELECT p.id FROM public.products p
      JOIN public.apps a ON p.app_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- Políticas para lessons (via module/product/app ownership)
CREATE POLICY "Users can manage lessons" ON public.lessons
  FOR ALL USING (
    module_id IN (
      SELECT m.id FROM public.modules m
      JOIN public.products p ON m.product_id = p.id
      JOIN public.apps a ON p.app_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- Políticas para clients (via app ownership)
CREATE POLICY "Users can manage clients" ON public.clients
  FOR ALL USING (
    app_id IN (SELECT id FROM public.apps WHERE user_id = auth.uid())
  );

-- Políticas para client_products
CREATE POLICY "Users can manage client_products" ON public.client_products
  FOR ALL USING (
    client_id IN (
      SELECT c.id FROM public.clients c
      JOIN public.apps a ON c.app_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- Políticas para client_progress
CREATE POLICY "Users can view client_progress" ON public.client_progress
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM public.clients c
      JOIN public.apps a ON c.app_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- Políticas para integrations
CREATE POLICY "Users can manage own integrations" ON public.integrations
  FOR ALL USING (user_id = auth.uid());

-- Políticas para webhook_logs
CREATE POLICY "Users can view own webhook_logs" ON public.webhook_logs
  FOR SELECT USING (
    integration_id IN (SELECT id FROM public.integrations WHERE user_id = auth.uid())
  );

-- Políticas para domains
CREATE POLICY "Users can manage domains" ON public.domains
  FOR ALL USING (
    app_id IN (SELECT id FROM public.apps WHERE user_id = auth.uid())
  );

-- Políticas para subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Políticas para feed_posts
CREATE POLICY "Users can manage feed_posts" ON public.feed_posts
  FOR ALL USING (
    app_id IN (SELECT id FROM public.apps WHERE user_id = auth.uid())
  );

-- Políticas para feed_comments
CREATE POLICY "Users can view feed_comments" ON public.feed_comments
  FOR SELECT USING (
    post_id IN (
      SELECT fp.id FROM public.feed_posts fp
      JOIN public.apps a ON fp.app_id = a.id
      WHERE a.user_id = auth.uid()
    )
  );

-- Políticas para community_posts
CREATE POLICY "Users can manage community_posts" ON public.community_posts
  FOR ALL USING (
    app_id IN (SELECT id FROM public.apps WHERE user_id = auth.uid())
  );

-- Políticas para notifications
CREATE POLICY "Users can manage notifications" ON public.notifications
  FOR ALL USING (
    app_id IN (SELECT id FROM public.apps WHERE user_id = auth.uid())
  );

-- ============================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON public.apps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON public.domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER PARA CRIAR PROFILE APÓS SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNÇÃO PARA GERAR WEBHOOK URL ÚNICA
-- ============================================================
CREATE OR REPLACE FUNCTION generate_webhook_url()
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://tribebuild.app/api/webhook/' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ✅ SCHEMA CRIADO COM SUCESSO!
-- ============================================================
