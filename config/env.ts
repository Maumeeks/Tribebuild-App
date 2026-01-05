/**
 * Configuração centralizada do TribeBuild
 * 
 * Este arquivo lê as variáveis de ambiente e exporta de forma tipada.
 * Nunca coloque senhas diretamente aqui - use o arquivo .env
 */

// Admin Master Config
export const ADMIN_CONFIG = {
  email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@tribebuild.com',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'TribeBuild@2024!',
  twoFactorCode: import.meta.env.VITE_ADMIN_2FA_CODE || '123456',
};

// Supabase Config
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isConfigured: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
};

// Stripe Config
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  isConfigured: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
};

// App Config
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'TribeBuild',
  url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validação (útil para debug)
export const validateConfig = () => {
  const issues: string[] = [];
  
  if (!ADMIN_CONFIG.email) issues.push('VITE_ADMIN_EMAIL não configurado');
  if (!ADMIN_CONFIG.password) issues.push('VITE_ADMIN_PASSWORD não configurado');
  
  if (APP_CONFIG.isProduction) {
    if (!SUPABASE_CONFIG.isConfigured) issues.push('Supabase não configurado para produção');
    if (!STRIPE_CONFIG.isConfigured) issues.push('Stripe não configurado para produção');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
};

export default {
  admin: ADMIN_CONFIG,
  supabase: SUPABASE_CONFIG,
  stripe: STRIPE_CONFIG,
  app: APP_CONFIG,
};
