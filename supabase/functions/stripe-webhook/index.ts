import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

console.log("Stripe Webhook Handler v2 (Trial & Lifecycle) iniciado!")

// CORREÇÃO: 'req: Request' resolve o erro de 'implicitly has an any type'
serve(async (req: Request) => {
  try {
    // 1. Configuração Inicial
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseKey) {
        throw new Error("Variáveis de ambiente incompletas")
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })
    
    const cryptoProvider = Stripe.createSubtleCryptoProvider()
    
    const signature = req.headers.get('Stripe-Signature')
    const body = await req.text()

    // 2. Validar Assinatura
    let event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature!,
        webhookSecret,
        undefined,
        cryptoProvider
      )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(`Erro de assinatura: ${err.message}`)
      return new Response(err.message, { status: 400 })
    }

    // Configuração do Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Mapa de Preços
    const PLAN_MAPPING: Record<string, string> = {
      'price_1SlI8pI5Cu8MrWaGjBdlVYnu': 'starter',
      'price_1SlI8pI5Cu8MrWaGYJih1P0D': 'starter',
      'price_1SlI8pI5Cu8MrWaGNgMPqkQN': 'professional',
      'price_1SlI8pI5Cu8MrWaGAX4FfQHX': 'professional',
      'price_1SlI8pI5Cu8MrWaGYq5KS1Lz': 'business',
      'price_1SlI9lI5Cu8MrWaG2NXdqrAM': 'business',
      'price_1SpuPcI5Cu8MrWaGukdBmBdX': 'enterprise',
      'price_1SpuPcI5Cu8MrWaGukdBm3Hy': 'enterprise',
    }

    console.log(`🔔 Evento Recebido: ${event.type}`)

    // --- EVENTO 1: CHECKOUT COMPLETADO ---
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.client_reference_id
      const customerEmail = session.customer_details?.email

      // Identificar Plano
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      const priceId = lineItems.data[0]?.price?.id
      const planName = priceId ? (PLAN_MAPPING[priceId] || 'starter') : 'starter'

      // Identificar Status
      let planStatus = 'active'
      let trialEnd = null

      if (session.subscription) {
          try {
              const sub = await stripe.subscriptions.retrieve(session.subscription as string)
              if (sub.status === 'trialing') {
                  planStatus = 'trial'
                  trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null
              }
          } catch (e) {
              console.error('Erro ao buscar subscription:', e)
          }
      }

      const updateData = { 
          plan: planName, 
          plan_status: planStatus,
          trial_ends_at: trialEnd,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          updated_at: new Date().toISOString()
      }

      if (userId) {
          await supabase.from('profiles').update(updateData).eq('id', userId)
      } else if (customerEmail) {
          await supabase.from('profiles').update(updateData).eq('email', customerEmail)
      }
      console.log('✅ Checkout processado.')
    }

    // --- EVENTO 2: MUDANÇA DE STATUS ---
    else if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object
        const customerId = subscription.customer
        
        const statusMap: Record<string, string> = {
            'active': 'active',
            'trialing': 'trial',
            'past_due': 'active',
            'canceled': 'canceled',
            'unpaid': 'canceled',
            'incomplete': 'canceled',
            'incomplete_expired': 'canceled',
            'paused': 'canceled'
        }
        const newStatus = statusMap[subscription.status] || 'free'
        
        await supabase
          .from('profiles')
          .update({
              plan_status: newStatus,
              updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId)
    }

    // --- EVENTO 3: CANCELAMENTO ---
    else if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object
        const customerId = subscription.customer
        
        await supabase
          .from('profiles')
          .update({
              plan_status: 'canceled',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(`Server Error: ${err.message}`)
    return new Response(`Server Error: ${err.message}`, { status: 500 })
  }
})