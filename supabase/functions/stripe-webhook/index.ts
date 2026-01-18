// @ts-nocheck - Necessário para imports Deno em ambiente misto
// deno-lint-ignore-file

/**
 * Stripe Webhook Handler - Edge Function (Deno)
 * Versão: 3.0.0 (Tipagem Blindada)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

// ============================================================
// TIPOS
// ============================================================
interface PlanMapping {
  [priceId: string]: string;
}

interface ProfileUpdate {
  plan?: string;
  plan_status?: string;
  trial_ends_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  updated_at?: string;
}

// ============================================================
// CONFIGURAÇÃO
// ============================================================
const PLAN_MAPPING: PlanMapping = {
  // Starter
  'price_1SlI8pI5Cu8MrWaGjBdlVYnu': 'starter',
  'price_1SlI8pI5Cu8MrWaGYJih1P0D': 'starter',
  // Professional
  'price_1SlI8pI5Cu8MrWaGNgMPqkQN': 'professional',
  'price_1SlI8pI5Cu8MrWaGAX4FfQHX': 'professional',
  // Business
  'price_1SlI8pI5Cu8MrWaGYq5KS1Lz': 'business',
  'price_1SlI9lI5Cu8MrWaG2NXdqrAM': 'business',
  // Enterprise
  'price_1SpuPcI5Cu8MrWaGukdBmBdX': 'enterprise',
  'price_1SpuPcI5Cu8MrWaGukdBm3Hy': 'enterprise',
};

const STATUS_MAPPING: Record<string, string> = {
  'active': 'active',
  'trialing': 'trial',
  'past_due': 'active',
  'canceled': 'canceled',
  'unpaid': 'canceled',
  'incomplete': 'canceled',
  'incomplete_expired': 'canceled',
  'paused': 'canceled',
};

// ============================================================
// HANDLER PRINCIPAL
// ============================================================
serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis de ambiente incompletas');
      return new Response('Server Configuration Error', { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
    const cryptoProvider = Stripe.createSubtleCryptoProvider();

    const signature = req.headers.get('Stripe-Signature');
    if (!signature) {
      console.error('❌ Assinatura Stripe ausente');
      return new Response('Missing Stripe Signature', { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Erro de assinatura: ${errorMessage}`);
      return new Response(`Webhook signature verification failed: ${errorMessage}`, { status: 400 });
    }

    console.log(`🔔 Evento recebido: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event, stripe, supabase);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, supabase);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event, supabase);
        break;
      default:
        console.log(`ℹ️ Evento ignorado: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown server error';
    console.error(`❌ Server Error: ${errorMessage}`);
    return new Response(`Server Error: ${errorMessage}`, { status: 500 });
  }
});

// ============================================================
// HANDLERS DE EVENTOS
// ============================================================

async function handleCheckoutCompleted(
  event: Stripe.Event,
  stripe: Stripe,
  supabase: SupabaseClient
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.client_reference_id;
  const customerEmail = session.customer_details?.email;

  console.log(`📦 Checkout: userId=${userId}, email=${customerEmail}`);

  let planName = 'starter';
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;
    if (priceId && PLAN_MAPPING[priceId]) {
      planName = PLAN_MAPPING[priceId];
    }
  } catch (e) {
    console.warn('⚠️ Erro ao buscar line items:', e);
  }

  let planStatus = 'active';
  let trialEnd: string | null = null;

  if (session.subscription) {
    try {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      if (sub.status === 'trialing' && sub.trial_end) {
        planStatus = 'trial';
        trialEnd = new Date(sub.trial_end * 1000).toISOString();
      }
    } catch (e) {
      console.warn('⚠️ Erro ao buscar subscription:', e);
    }
  }

  const updateData: ProfileUpdate = {
    plan: planName,
    plan_status: planStatus,
    trial_ends_at: trialEnd,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: session.subscription as string | null,
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
    if (error) console.error('❌ Erro ao atualizar por userId:', error);
    else console.log(`✅ Profile atualizado (userId): ${planName} - ${planStatus}`);
  } else if (customerEmail) {
    const { error } = await supabase.from('profiles').update(updateData).eq('email', customerEmail);
    if (error) console.error('❌ Erro ao atualizar por email:', error);
    else console.log(`✅ Profile atualizado (email): ${planName} - ${planStatus}`);
  } else {
    console.warn('⚠️ Checkout sem userId ou email');
  }
}

async function handleSubscriptionUpdated(
  event: Stripe.Event,
  supabase: SupabaseClient
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;
  const newStatus = STATUS_MAPPING[subscription.status] || 'free';

  console.log(`🔄 Subscription Update: customerId=${customerId}, status=${newStatus}`);

  const updateData: ProfileUpdate = {
    plan_status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (subscription.status === 'trialing' && subscription.trial_end) {
    updateData.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString();
  }

  const { error } = await supabase.from('profiles').update(updateData).eq('stripe_customer_id', customerId);
  if (error) console.error('❌ Erro ao atualizar subscription:', error);
  else console.log(`✅ Subscription atualizada: ${newStatus}`);
}

async function handleSubscriptionDeleted(
  event: Stripe.Event,
  supabase: SupabaseClient
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  console.log(`🗑️ Subscription Deleted: customerId=${customerId}`);

  const updateData: ProfileUpdate = {
    plan_status: 'canceled',
    stripe_subscription_id: null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('profiles').update(updateData).eq('stripe_customer_id', customerId);
  if (error) console.error('❌ Erro ao cancelar subscription:', error);
  else console.log('✅ Subscription cancelada');
}