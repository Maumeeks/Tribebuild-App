// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

console.log("Stripe Webhook Handler iniciado!")

serve(async (req) => {
  // 1. Configuração Inicial
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
  })
  const cryptoProvider = Stripe.createSubtleCryptoProvider()
  
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  // 2. Validar se a requisição veio mesmo do Stripe (Segurança)
  let event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!, // Segredo que vamos configurar
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error(`Erro de assinatura: ${err.message}`)
    return new Response(err.message, { status: 400 })
  }

  // 3. Processar Pagamento Aprovado
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.client_reference_id // ID que enviamos no botão "Assinar"

    if (!userId) {
      console.log('Pagamento sem userId (compra anônima?). Ignorando.')
      return new Response('Sem User ID', { status: 200 })
    }

    // Buscar detalhes para saber qual produto foi comprado
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
    const priceId = lineItems.data[0]?.price?.id

    // --- SEU MAPA DE PREÇOS ---
    const PLAN_MAPPING: Record<string, string> = {
      // Starter
      'price_1SlI8pI5Cu8MrWaGjBdlVYnu': 'starter',      // R$ 67,00 (Mensal)
      'price_1SlI8pI5Cu8MrWaGYJih1P0D': 'starter',      // R$ 672,00 (Anual)
      
      // Professional
      'price_1SlI8pI5Cu8MrWaGNgMPqkQN': 'professional', // R$ 127,00 (Mensal)
      'price_1SlI8pI5Cu8MrWaGAX4FfQHX': 'professional', // R$ 1.272,00 (Anual)
      
      // Business
      'price_1SlI8pI5Cu8MrWaGYq5KS1Lz': 'business',     // R$ 247,00 (Mensal)
      'price_1SlI9lI5Cu8MrWaG2NXdqrAM': 'business',     // R$ 2.472,00 (Anual)
      
      // Enterprise
      'price_1SpuPcI5Cu8MrWaGukdBmBdX': 'enterprise',   // (Exemplo para R$ 397 se tiver)
      'price_1SpuPcI5Cu8MrWaGukdBm3Hy': 'enterprise',   // R$ 3.970,00 (Anual)
    }

    const planName = PLAN_MAPPING[priceId] || 'starter' // Se não achar, garante Starter
    console.log(`Usuário ${userId} comprou o plano: ${planName} (Preço: ${priceId})`)

    // 4. Gravar no Banco de Dados (Supabase)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Atualiza o perfil do usuário
    const { error } = await supabase
      .from('profiles')
      .update({ 
        plan: planName, 
        plan_status: 'active',
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Erro ao atualizar Supabase:', error)
      return new Response('Erro no Banco', { status: 500 })
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  })
})