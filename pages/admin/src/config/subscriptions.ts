import { SubscriptionPlan } from "@/types"; // Se der erro no types, pode remover essa linha e o tipo abaixo

export interface SubscriptionPlan {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string; // Link de pagamento ou Price ID
    yearly: string;  // Link de pagamento ou Price ID
  };
  limits: {
    apps: number;
    members: number;
  };
}

export const pricingData: SubscriptionPlan[] = [
  {
    id: 'starter',
    title: 'Starter',
    description: 'Para quem está dando os primeiros passos.',
    benefits: [
      '1 Aplicativo',
      'Até 500 membros ativos',
      'Produtos ilimitados',
      'Domínio Personalizado'
    ],
    limitations: [],
    prices: {
      monthly: 67,
      yearly: 672,
    },
    stripeIds: {
      monthly: '', // Starter geralmente é o plano gratuito ou padrão, sem link
      yearly: '',
    },
    limits: {
      apps: 1,
      members: 500
    }
  },
  {
    id: 'professional',
    title: 'Professional',
    description: 'Para criadores em crescimento constante.',
    benefits: [
      '3 Aplicativos',
      'Até 1.500 membros ativos',
      'Suporte via E-mail',
      'Prioridade na fila de build'
    ],
    limitations: [],
    prices: {
      monthly: 127,
      yearly: 1272,
    },
    stripeIds: {
      monthly: 'LINK_DO_STRIPE_MENSAL_PRO_AQUI', // Coloque o link se tiver
      yearly: 'LINK_DO_STRIPE_ANUAL_PRO_AQUI',
    },
    limits: {
      apps: 3,
      members: 1500
    }
  },
  {
    id: 'business',
    title: 'Business',
    description: 'Para escalar sua operação sem limites.',
    benefits: [
      '5 Aplicativos',
      'Até 2.800 membros ativos',
      'Suporte WhatsApp',
      'Múltiplos Administradores'
    ],
    limitations: [],
    prices: {
      monthly: 197,
      yearly: 1970,
    },
    stripeIds: {
      monthly: 'LINK_DO_STRIPE_MENSAL_BUSINESS_AQUI',
      yearly: 'LINK_DO_STRIPE_ANUAL_BUSINESS_AQUI',
    },
    limits: {
      apps: 5,
      members: 2800
    }
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    description: 'Máxima potência e exclusividade.',
    benefits: [
      '10 Aplicativos',
      'Até 6.000 membros ativos',
      'White Label (Sem marca)',
      'Suporte VIP'
    ],
    limitations: [],
    prices: {
      monthly: 397,
      yearly: 3970,
    },
    stripeIds: {
      monthly: 'https://buy.stripe.com/test_00waEX23y0aa0w6cG52wU07', // SEU LINK
      yearly: 'https://buy.stripe.com/test_9B68wP9w07CC3Ii49z2wU06', // SEU LINK
    },
    limits: {
      apps: 10,
      members: 6000
    }
  }
];