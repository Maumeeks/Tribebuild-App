// @ts-types="npm:@types/stripe@^8.0.0"
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// ========================================
// MAPEAMENTO DE PRICE IDs PARA PLANOS
// ========================================
const PRICE_TO_PLAN_MAP: Record<string, string> = {
  // STARTER
  'price_1SlI8pI5Cu8MrWaGjBdlVYnu': 'starter',
  'price_1SlI8pI5Cu8MrWaGYJih1P0D': 'starter',
  
  // PROFESSIONAL
  'price_1SlI8pI5Cu8MrWaGNgMPqkQN': 'professional',
  'price_1SlI8pI5Cu8MrWaGAX4FfQHX': 'professional',
  
  // BUSINESS
  'price_1SlI8pI5Cu8MrWaGYq5KS1Lz': 'business',
  'price_1SlI9lI5Cu8MrWaG2NXdqrAM': 'business',
  
  // ENTERPRISE
  'price_1SpuPcI5Cu8MrWaGP8LUZf0q': 'enterprise',
  'price_1SpuPcI5Cu8MrWaGukdBm3Hy': 'enterprise',
};

// ========================================
// CONFIGURAÇÃO STRIPE E SUPABASE
// ========================================
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ========================================
// SERVIDOR PRINCIPAL
// ========================================
Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.text();

    // ✅ CORREÇÃO CRÍTICA AQUI:
    // Mudamos de constructEvent para await constructEventAsync
    // Isso resolve o erro "SubtleCryptoProvider cannot be used in a synchronous context"
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    console.log(`📥 Webhook received: ${event.type} [${event.id}]`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true, event: event.type }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('💥 Webhook error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// ========================================
// HANDLERS DE EVENTOS
// ========================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log('💳 Processing checkout.session.completed:', session.id);

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  // ✅ CORREÇÃO: Usar client_reference_id (user.id do Supabase)
  const userId = session.client_reference_id;
  const customerEmail = session.customer_email || session.customer_details?.email;

  console.log(`📧 Customer email: ${customerEmail}`);
  console.log(`👤 Client reference ID (user_id): ${userId}`);

  // Buscar a subscription para obter o price_id e status
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const planName = priceId ? PRICE_TO_PLAN_MAP[priceId] : null;
  const isTrialing = subscription.status === 'trialing';

  if (!planName) {
    console.error(`❌ Unknown price ID: ${priceId}`);
    console.error('📋 Available price IDs:', Object.keys(PRICE_TO_PLAN_MAP));
    return;
  }

  console.log(`✅ Plan identified: ${planName} (${priceId}), trialing: ${isTrialing}`);

  // ✅ CORREÇÃO: Usar campos corretos do banco (plan_status e plan)
  const updateData = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan: planName,                                        // ✅ CORRETO (era subscription_plan)
    plan_status: isTrialing ? 'trial' : 'active',         // ✅ CORRETO (era subscription_status)
    trial_ends_at: isTrialing && subscription.trial_end 
      ? new Date(subscription.trial_end * 1000).toISOString() 
      : null,
    updated_at: new Date().toISOString(),
  };

  // Tentar atualizar por user_id primeiro (mais confiável)
  if (userId) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating profile by user_id:', updateError);
    } else {
      console.log(`✅ Profile updated for user ${userId}: ${planName} plan activated`);
      return;
    }
  }

  // Fallback: buscar por email
  if (customerEmail) {
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (findError || !profile) {
      console.error(`❌ Profile not found for email: ${customerEmail}`);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id);

    if (updateError) {
      console.error('❌ Error updating profile by email:', updateError);
      return;
    }

    console.log(`✅ Profile updated for email ${customerEmail}: ${planName} plan activated`);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  console.log('🔄 Processing subscription update:', subscription.id);

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const planName = priceId ? PRICE_TO_PLAN_MAP[priceId] : null;
  const status = subscription.status;

  console.log(`📊 Subscription status: ${status}, Price ID: ${priceId}`);

  // ✅ CORREÇÃO: Mapear status do Stripe para plan_status do banco
  let planStatus: 'active' | 'canceled' | 'trial' | 'expired' = 'active';
  
  if (status === 'trialing') {
    planStatus = 'trial';
  } else if (status === 'canceled' || status === 'unpaid' || status === 'incomplete_expired') {
    planStatus = 'canceled';
  } else if (status === 'active' || status === 'incomplete' || status === 'past_due') {
    planStatus = 'active';
  }

  const updateData: Record<string, any> = {
    plan_status: planStatus,      // ✅ CORRETO
    updated_at: new Date().toISOString(),
  };

  // Só atualiza o plano se identificado
  if (planName) {
    updateData.plan = planName;   // ✅ CORRETO
  }

  // Atualiza trial_ends_at se estiver em trial
  if (status === 'trialing' && subscription.trial_end) {
    updateData.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString();
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('❌ Error updating subscription:', error);
    return;
  }

  console.log(`✅ Subscription updated for customer ${customerId}: ${planStatus} - ${planName}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log('🗑️ Processing subscription deletion:', subscription.id);

  const customerId = subscription.customer as string;

  // ✅ CORREÇÃO: Usar plan_status e plan
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_status: 'canceled',    // ✅ CORRETO
      plan: 'free',               // ✅ Volta para free
      stripe_subscription_id: null,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('❌ Error handling subscription deletion:', error);
    return;
  }

  console.log(`✅ Subscription cancelled for customer ${customerId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log('💰 Processing payment succeeded:', invoice.id);

  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log('ℹ️ No subscription ID in invoice, skipping');
    return;
  }

  // ✅ CORREÇÃO: Usar plan_status
  const { error } = await supabase
    .from('profiles')
    .update({
      plan_status: 'active',      // ✅ CORRETO
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('❌ Error updating payment success:', error);
    return;
  }

  console.log(`✅ Payment confirmed for customer ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log('⚠️ Processing payment failed:', invoice.id);

  const customerId = invoice.customer as string;

  // Opcional: marcar como expired ou manter active e notificar
  console.warn(`💳 Payment failed for customer ${customerId}`);
}