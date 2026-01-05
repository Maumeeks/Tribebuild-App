# TRIBEBUILD - CONTEXTO DO PROJETO v14

## 📅 Última Atualização: 03/01/2026

---

## 🏗️ ESTRUTURA DO PROJETO

**Pasta do projeto:** `tribebuild-project-v13`
**Supabase URL:** `https://wgfgjznkrbwfqadnmkgv.supabase.co`
**Supabase Anon Key:** Configurada no `.env`

---

## ✅ FUNCIONALIDADES CONCLUÍDAS

### Frontend (100%)
- [x] Landing Page completa
- [x] Dashboard Produtor (todas as páginas)
- [x] Painel Admin Master
- [x] PWA Aluno (login, home, feed, comunidade, perfil)
- [x] Dark Mode em todas as páginas
- [x] Página de Bônus com bloqueio de 7 dias + 3 PDFs

### Autenticação (100%)
- [x] Cadastro com CPF e Telefone
- [x] Login funcional
- [x] Esqueci minha senha
- [x] Reset de senha (token via hash)
- [x] CPF e Phone salvando no Supabase via trigger

### Proteção de Rotas (100%)
- [x] ProtectedRoute.tsx criado
- [x] AuthProvider no App.tsx
- [x] Dashboard protegido (só logado acessa)
- [x] Logout funcional com redirecionamento
- [x] Verificação de plan_status (active/trial)

### Supabase (100%)
- [x] 15 tabelas configuradas
- [x] Trigger para criar profile com trial de 7 dias
- [x] Colunas stripe_customer_id e stripe_subscription_id adicionadas
- [x] RLS policies configuradas

### Stripe (90%)
- [x] Conta configurada (modo teste)
- [x] 6 links de pagamento criados:
  - Mensal Starter: R$67 - `https://buy.stripe.com/test_9B68wP0Zu4qq1Aa6hH2wU00`
  - Mensal Professional: R$127 - `https://buy.stripe.com/test_fZubJ1eQkf54gv4gWl2wU01`
  - Mensal Business: R$247 - `https://buy.stripe.com/test_9B63cv0Zu8GGdiSbC12wU02`
  - Anual Starter: R$672 - `https://buy.stripe.com/test_28E14n8rWbSS5Qq7lL2wU03`
  - Anual Professional: R$1.272 - `https://buy.stripe.com/test_fZucN537C9KK2Ee7lL2wU04`
  - Anual Business: R$2.472 - `https://buy.stripe.com/test_14A14n23yaOOdiSaxX2wU05`
- [x] Webhook configurado (upbeat-breeze)
- [x] URL do webhook: `https://wgfgjznkrbwfqadnmkgv.supabase.co/functions/v1/stripe-webhook`
- [x] Webhook Secret: `whsec_Kb56fvelR4QHpwm4Oy9eJGYRlsWBn60o`

### Edge Function (90%)
- [x] stripe-webhook criada no Supabase
- [x] Secrets configurados:
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - SUPABASE_DB_URL
- [x] JWT verification desativado
- [ ] **PENDENTE: Erro 400 "Key length is zero"** - Código atualizado, precisa testar

---

## 🔄 EM ANDAMENTO

### Webhook Stripe
**Problema:** Erro 400 "Key length is zero"
**Solução:** Código da Edge Function foi atualizado com logs de debug
**Próximo passo:** 
1. Fazer deploy do novo código
2. Reenviar evento no Stripe
3. Verificar logs no Supabase

---

## 📝 PENDÊNCIAS

### Alta Prioridade
1. **Webhook Stripe funcionando** - Resolver erro 400
2. **Fluxo pós-cadastro** - Redirecionar para página de planos
3. **Página de planos no frontend** - Mostrar os 6 planos com links do Stripe

### Média Prioridade
4. **Cor do texto na página de pagamento** - Dark mode não está legível
5. **Contagem de trial** - Verificar se está mostrando 7 dias (está mostrando 4)
6. **Botão Academia** - Desabilitar ou criar página

### Para Produção
7. **Deploy Vercel** - Configurar domínio
8. **Stripe modo produção** - Trocar chaves de teste para produção
9. **SMTP configurado** - Emails transacionais (SendGrid/Mailgun)

---

## 🗂️ ARQUIVOS IMPORTANTES

### Páginas de Auth (corrigidas v13)
- `pages/LoginPage.tsx`
- `pages/RegisterPage.tsx`
- `pages/ForgotPasswordPage.tsx`
- `pages/ResetPasswordPage.tsx`

### Proteção de Rotas
- `components/ProtectedRoute.tsx`
- `contexts/AuthContext.tsx`
- `App.tsx`

### Layout Dashboard
- `layout/DashboardLayout.tsx` (usa useAuth para logout)

### SQL Executados no Supabase
```sql
-- Trigger para criar profile com trial de 7 dias
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, cpf, phone,
    plan_status, trial_ends_at, created_at
  )
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    'trial',
    NOW() + INTERVAL '7 days',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Colunas do Stripe
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
```

---

## 🔑 CREDENCIAIS (TESTE)

### Stripe
- **Cartão de teste:** 4242 4242 4242 4242
- **Validade:** 12/34
- **CVC:** 123

### Usuário de teste
- **Email:** maumeks@outlook.com
- **Status atual:** trial (precisa ser atualizado para active após webhook funcionar)

---

## 📌 CÓDIGO DA EDGE FUNCTION (ÚLTIMA VERSÃO)
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'npm:stripe@12.0.0'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

console.log('Stripe Webhook Function booted!')
console.log('Stripe Key exists:', !!stripeKey)
console.log('Webhook Secret exists:', !!webhookSecret)

const stripe = new Stripe(stripeKey!, {
  apiVersion: '2024-11-20'
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

Deno.serve(async (request) => {
  try {
    const signature = request.headers.get('Stripe-Signature')
    const body = await request.text()
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return new Response('Webhook secret not configured', { status: 500 })
    }

    let event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature!,
        webhookSecret,
        undefined,
        cryptoProvider
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log(`🔔 Event received: ${event.type}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerEmail = session.customer_details?.email

        console.log('Processing checkout for:', customerEmail)

        if (customerEmail) {
          const { data, error } = await supabase
            .from('profiles')
            .update({
              plan_status: 'active',
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            })
            .eq('email', customerEmail)
            .select()

          if (error) {
            console.error('Error updating profile:', error)
          } else {
            console.log(`✅ User ${customerEmail} activated`, data)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const status = subscription.status === 'active' ? 'active' : 'inactive'

        const { error } = await supabase
          .from('profiles')
          .update({
            plan_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', subscription.customer)

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log(`✅ Subscription updated: ${status}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object

        const { error } = await supabase
          .from('profiles')
          .update({
            plan_status: 'inactive',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', subscription.customer)

        if (error) {
          console.error('Error cancelling subscription:', error)
        } else {
          console.log(`✅ Subscription cancelled`)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(`Server Error: ${err.message}`, { status: 500 })
  }
})
```

---

## 🎯 PRÓXIMOS PASSOS (ORDEM DE PRIORIDADE)

1. **Deploy do código da Edge Function** e testar webhook
2. **Verificar logs** no Supabase após reenviar evento
3. **Criar página de planos** no frontend
4. **Configurar redirecionamento** após cadastro
5. **Corrigir cores dark mode** na página de pagamento
6. **Verificar contagem de trial** (7 dias)
7. **Deploy Vercel** para produção

---

## 💡 NOTAS IMPORTANTES

- O projeto usa HashRouter (`/#/`) 
- Autenticação via Supabase Auth
- Trial de 7 dias configurado no trigger SQL
- Stripe em modo teste (trocar para produção no deploy)
- Webhook precisa receber eventos: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted