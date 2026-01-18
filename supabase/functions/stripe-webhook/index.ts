// @ts-types="npm:@types/stripe@^8.0.0"
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// ========================================
// MAPEAMENTO DE PRICE IDs PARA PLANOS
// ========================================
// ✅ ATUALIZADO COM 4 PLANOS (8 PRICE IDs)
const PRICE_TO_PLAN_MAP: Record<string, string> = {
  // STARTER
  'price_1SlI8pI5Cu8MrWaGjBdlVYnu': 'starter',        // R$ 67,00 (mensal)
  'price_1SlI8pI5Cu8MrWaGYJih1P0D': 'starter',        // R$ 672,00 (anual)
  
  // PROFESSIONAL
  'price_1SlI8pI5Cu8MrWaGNgMPqkQN': 'professional',   // R$ 127,00 (mensal)
  'price_1SlI8pI5Cu8MrWaGAX4FfQHX': 'professional',   // R$ 1.272,00 (anual)
  
  // BUSINESS
  'price_1SlI8pI5Cu8MrWaGYq5KS1Lz': 'business',       // R$ 247,00 (mensal)
  'price_1SlI9lI5Cu8MrWaG2NXdqrAM': 'business',       // R$ 2.472,00 (anual)
  
  // ENTERPRISE (ou PREMIUM)
  'price_1SpuPcI5Cu8MrWaGP8LUZf0q': 'enterprise',     // R$ 397,00 (mensal) ⭐ NOVO
  'price_1SpuPcI5Cu8MrWaGukdBm3Hy': 'enterprise',     // R$ 3.970,00 (anual)
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
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

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
  const customerEmail = session.customer_email || session.customer_details?.email;

  if (!customerEmail) {
    console.error('❌ No customer email in checkout session');
    return;
  }

  // Buscar usuário pelo email
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('❌ Error fetching users:', userError);
    return;
  }

  const user = userData.users.find((u) => u.email === customerEmail);

  if (!user) {
    console.error(`❌ User not found for email: ${customerEmail}`);
    return;
  }

  // Buscar a subscription para obter o price_id
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const planName = priceId ? PRICE_TO_PLAN_MAP[priceId] : null;

  if (!planName) {
    console.error(`❌ Unknown price ID: ${priceId}`);
    console.error('📋 Available price IDs:', Object.keys(PRICE_TO_PLAN_MAP));
    return;
  }

  console.log(`✅ Plan identified: ${planName} (${priceId})`);

  // Atualizar perfil
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
      subscription_plan: planName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('❌ Error updating profile:', updateError);
    return;
  }

  console.log(`✅ Profile updated for user ${user.id}: ${planName} plan activated`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  console.log('🔄 Processing subscription update:', subscription.id);

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const planName = priceId ? PRICE_TO_PLAN_MAP[priceId] : null;
  const status = subscription.status;

  console.log(`📊 Subscription status: ${status}, Price ID: ${priceId}`);

  // Mapear status do Stripe para nosso formato
  let subscriptionStatus: 'active' | 'cancelled' | 'trial' = 'active';
  
  if (status === 'trialing') {
    subscriptionStatus = 'trial';
  } else if (status === 'canceled' || status === 'unpaid' || status === 'incomplete_expired') {
    subscriptionStatus = 'cancelled';
  } else if (status === 'active' || status === 'incomplete' || status === 'past_due') {
    subscriptionStatus = 'active';
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: subscriptionStatus,
      subscription_plan: planName,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('❌ Error updating subscription:', error);
    return;
  }

  console.log(`✅ Subscription updated for customer ${customerId}: ${subscriptionStatus} - ${planName}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log('🗑️ Processing subscription deletion:', subscription.id);

  const customerId = subscription.customer as string;

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      stripe_subscription_id: null,
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

  // Garantir que o status está ativo após pagamento bem-sucedido
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
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

  console.warn(`💳 Payment failed for customer ${customerId}`);
  
  // TODO: Implementar notificação por email ou outras ações
  // Por enquanto, apenas logamos o evento
}