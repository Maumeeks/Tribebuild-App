TRIBEBUILD - CONTEXTO DO PROJETO v15
📅 Última Atualização: 17/01/2026
🤖 INSTRUÇÕES PARA A IA (LEIA COM ATENÇÃO)
Contexto: Este é um projeto SaaS (TribeBuild) em React/Vite/Supabase.

Estado Atual: O sistema de login e redirecionamento foi recentemente "blindado".

Regra de Ouro: Não altere a lógica de redirecionamento (LoginPage e AuthCallback) sem consultar as regras abaixo. Novos usuários (sem plano) DEVEM ir para /plans. Usuários com plano (active/trial) DEVEM ir para /dashboard.

Estilização: Use Tailwind CSS apenas via classes utilitárias (o CDN foi removido por performance).

🏗️ ESTRUTURA DO PROJETO
Pasta do projeto: tribebuild-project-v13 (ou atual) Supabase URL: https://wgfgjznkrbwfqadnmkgv.supabase.co Stack: React + Vite + TypeScript + Tailwind + Supabase Auth/DB + Stripe

🔒 REGRAS DE NEGÓCIO (IMUTÁVEIS)
Limites de Aplicativos por Plano:

Starter: 1 App

Professional: 3 Apps

Business: 5 Apps

Enterprise: 10 Apps

Free: 1 App (Visualização restrita)

Lógica de Trial:

Usuário recém-criado ganha status trial (7 dias) via Trigger no Supabase.

Visualmente, o dashboard deve mostrar o plano escolhido + a tag "(Período de Testes)".

✅ FUNCIONALIDADES CONCLUÍDAS
Frontend & Performance (Atualizado)
[x] Performance: Remoção do script CDN do Tailwind (correção de lentidão no login).

[x] Dashboard: Exibição dinâmica do nome do plano (Starter, Professional, etc.) lendo do banco.

[x] Dashboard: Aplicação correta dos limites de apps (1, 3, 5, 10) baseada no plano.

Autenticação & Fluxo (Atualizado)
[x] Blitz do Login (Senha): LoginPage.tsx verifica se o usuário tem plano ativo.

Se sim -> Redireciona para /dashboard.

Se não (ou novo usuário) -> Redireciona para /plans.

[x] Blitz do AuthCallback (Link Mágico): AuthCallback.tsx implementa a mesma lógica de verificação de perfil antes de redirecionar.

[x] Loop Infinito: Corrigido problema onde o usuário ficava preso em "Validando acesso...".

Funcionalidades Base
[x] Landing Page completa

[x] Dashboard Produtor

[x] PWA Aluno

[x] Cadastro/Login/Reset de Senha

[x] Dark Mode Global

Integrações
[x] Supabase (Auth + DB + Triggers)

[x] Stripe (Links de pagamento criados + Webhook configurado)

🔄 EM ANDAMENTO / NECESSITA ATENÇÃO IMEDIATA
1. Página de Planos (/plans)
Status: O redirecionamento para /plans foi implementado no login, mas precisamos garantir que essa página exista e esteja funcional no frontend. Ação: Verificar se a página exibe os cards com os links de checkout corretos.

2. Webhook Stripe
Status: Código da Edge Function foi atualizado, mas houve problemas de deploy/logs anteriores. Ação: Confirmar se o evento checkout.session.completed está atualizando o plan_status de 'trial' para 'active' no banco.

🗂️ ARQUIVOS CRÍTICOS (LÓGICA BLINDADA)
src/pages/LoginPage.tsx
Contém a lógica que impede usuários sem plano de acessar o dashboard. Não remova o useEffect que verifica profile.plan_status.

src/pages/AuthCallback.tsx
Gerencia o retorno de links mágicos. Implementa timeout de segurança e verificação de perfil.

src/pages/dashboard/DashboardHome.tsx
Responsável por exibir o plano correto.

Lógica Atual: const currentPlan = profile?.plan || 'free';

Switch Case: Configurado para retornar limites (1, 3, 5, 10).

src/pages/SubscriptionSuccessPage.tsx
Possui um delay de 2.5s proposital para aguardar o Webhook do Stripe processar antes de dar refresh no perfil do usuário.

💰 LINKS DE PAGAMENTO (STRIPE TEST MODE)
Starter (R$67): https://buy.stripe.com/test_9B68wP0Zu4qq1Aa6hH2wU00

Professional (R$127): https://buy.stripe.com/test_fZubJ1eQkf54gv4gWl2wU01

Business (R$247): https://buy.stripe.com/test_9B63cv0Zu8GGdiSbC12wU02

Anual Starter: https://buy.stripe.com/test_28E14n8rWbSS5Qq7lL2wU03

Anual Professional: https://buy.stripe.com/test_fZucN537C9KK2Ee7lL2wU04

Anual Business: https://buy.stripe.com/test_14A14n23yaOOdiSaxX2wU05

📌 CÓDIGO DA EDGE FUNCTION (WEBHOOK)
(Mantido para referência, verificar se a versão deployada é a mesma)

TypeScript

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'npm:stripe@12.0.0'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

const stripe = new Stripe(stripeKey!, { apiVersion: '2024-11-20' })
const cryptoProvider = Stripe.createSubtleCryptoProvider()

Deno.serve(async (request) => {
  try {
    const signature = request.headers.get('Stripe-Signature')
    const body = await request.text()
    
    let event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret!, undefined, cryptoProvider)
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Lógica de atualização de perfil baseada no evento checkout.session.completed
    // ... (Código padrão de update do profile)

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    return new Response(`Server Error: ${err.message}`, { status: 500 })
  }
})
📝 PRÓXIMOS PASSOS IMEDIATOS
Iniciar novo chat com este contexto.

Validar se a página /plans está recebendo corretamente os usuários novos redirecionados.

Testar o fluxo completo: Cadastro -> Redirecionamento para Planos -> Pagamento (Stripe) -> Sucesso -> Dashboard (com plano liberado).