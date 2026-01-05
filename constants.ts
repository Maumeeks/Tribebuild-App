
import { PlanType, PWAApp } from './types';

export const COLORS = {
  primary: '#245EE3',
  primaryLight: '#EEF6FF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  slate: {
    500: '#64748B',
    900: '#0F172A',
  }
};

export const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 47,
    period: 'mês',
    features: [
      '1 App PWA White-label',
      'Até 100 usuários ativos',
      'Checkout Integrado',
      'Subdomínio tribebuild.app',
      'Suporte via e-mail',
      'Certificado SSL'
    ],
    recommended: false,
    cta: 'Começar com Basic'
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 97,
    period: 'mês',
    features: [
      '1 App PWA White-label',
      'Até 500 usuários ativos',
      'Domínio Personalizado',
      'Push Notifications',
      'Vídeos (Host Externo)',
      'Suporte Prioritário'
    ],
    recommended: true,
    cta: 'Escolher Starter'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 197,
    period: 'mês',
    features: [
      '3 Apps PWA White-label',
      'Usuários Ilimitados',
      'Hospedagem de Vídeo Inc.',
      'Comunidade VIP nativa',
      'Analytics Avançado',
      'Webhooks de Integração'
    ],
    recommended: false,
    cta: 'Ir para o Pro'
  },
  {
    id: 'business',
    name: 'Business',
    price: 497,
    period: 'mês',
    features: [
      'Apps Ilimitados',
      'Gestor de Contas Dedicado',
      'Remoção total de marca',
      'SLA de 99.9%',
      'API de Desenvolvedor',
      'Treinamento de Equipe'
    ],
    recommended: false,
    cta: 'Falar com Consultor'
  }
];

export const FEATURES = [
  {
    id: 1,
    icon: 'Palette',
    title: 'Personalização Total',
    description: 'Ajuste cores, fontes e layouts para que o app tenha a identidade visual exata da sua marca.'
  },
  {
    id: 2,
    icon: 'Rocket',
    title: 'Instalação Rápida',
    description: 'Seus usuários instalam o app direto do navegador, sem passar pelas burocracias das lojas oficiais.'
  },
  {
    id: 3,
    icon: 'Bell',
    title: 'Notificações Push',
    description: 'Envie avisos de novas aulas, promoções ou mensagens diretamente na tela de bloqueio do seu cliente.'
  },
  {
    id: 4,
    icon: 'ShieldCheck',
    title: 'Área de Membros Segura',
    description: 'Controle de acesso rigoroso para garantir que apenas alunos ativos consumam seu conteúdo.'
  },
  {
    id: 5,
    icon: 'Layout',
    title: 'Interface Otimizada',
    description: 'Design pensado na experiência mobile para maximizar a retenção e o consumo dos seus produtos.'
  },
  {
    id: 6,
    icon: 'Globe',
    title: 'Offline First',
    description: 'Seu conteúdo acessível mesmo com conexão lenta ou instável, garantindo fluidez no aprendizado.'
  }
];

export const INTEGRATIONS = [
  { name: 'Hotmart', category: 'Pagamento' },
  { name: 'Kiwify', category: 'Pagamento' },
  { name: 'Eduzz', category: 'Pagamento' },
  { name: 'Monetizze', category: 'Pagamento' },
  { name: 'Stripe', category: 'Pagamento' },
  { name: 'PayPal', category: 'Pagamento' },
  { name: 'ActiveCampaign', category: 'E-mail Marketing' },
  { name: 'Mailchimp', category: 'E-mail Marketing' },
  { name: 'Zapier', category: 'Automação' },
  { name: 'Make', category: 'Automação' },
  { name: 'Vimeo', category: 'Vídeo' },
  { name: 'YouTube', category: 'Vídeo' },
  { name: 'PandaVideo', category: 'Vídeo' },
  { name: 'VTurb', category: 'Vídeo' },
  { name: 'Google Analytics', category: 'Analytics' },
  { name: 'Facebook Pixel', category: 'Analytics' }
];

export const FAQ_ITEMS = [
  {
    question: 'Preciso saber programar para criar o app?',
    answer: 'De forma alguma! O TribeBuild foi criado para que qualquer pessoa consiga montar seu app arrastando e soltando elementos.'
  },
  {
    question: 'Como funciona a integração com a Hotmart/Kiwify?',
    answer: 'É simples: você conecta via Webhook. Assim que uma venda é aprovada, o TribeBuild cria o acesso do aluno automaticamente.'
  },
  {
    question: 'Meu app vai estar na Apple Store e Google Play?',
    answer: 'O TribeBuild foca na tecnologia PWA, que permite a instalação via navegador. Isso evita taxas de 30% das lojas e aprovações lentas.'
  },
  {
    question: 'Posso usar meu próprio domínio?',
    answer: 'Sim! A partir do plano Starter você pode conectar seu domínio (ex: app.seunome.com.br) com SSL gratuito incluso.'
  },
  {
    question: 'Existe limite de aulas ou ebooks que posso subir?',
    answer: 'Não existe limite de quantidade de conteúdo. O que varia entre os planos é o número de usuários ativos simultâneos.'
  },
  {
    question: 'O que acontece se eu cancelar minha assinatura?',
    answer: 'Seus apps ficarão pausados. Seus dados são guardados por 6 meses para que você possa reativar quando quiser.'
  }
];

// Mock data for the dashboard to fix import errors
export const MOCK_APPS: PWAApp[] = [
  {
    id: '1',
    name: 'Mentalidade Vencedora',
    slug: 'mentalidade-venc',
    logoUrl: 'https://picsum.photos/seed/app1/200/200',
    primaryColor: '#245EE3',
    secondaryColor: '#EEF6FF',
    language: 'PT',
    status: 'published',
    stats: {
      users: 850,
      views: 12400,
      engagement: 78
    }
  },
  {
    id: '2',
    name: 'Mkt Expert',
    slug: 'mkt-expert',
    logoUrl: 'https://picsum.photos/seed/app2/200/200',
    primaryColor: '#8b5cf6',
    secondaryColor: '#F5F3FF',
    language: 'PT',
    status: 'draft',
    stats: {
      users: 400,
      views: 5200,
      engagement: 45
    }
  }
];
