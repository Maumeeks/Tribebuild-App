import React, { useState } from 'react';
import { 
  Building2,
  CreditCard,
  Mail,
  Users,
  Save,
  Eye,
  EyeOff,
  Check,
  Upload,
  Trash2,
  Plus,
  Shield,
  Globe,
  Phone,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  X,
  CheckCircle2,
  Info,
  Send,
  Zap,
  Crown,
  Rocket
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Tabs disponíveis
type TabType = 'general' | 'plans' | 'stripe' | 'email' | 'admins';

// Tipo para plano
interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  maxApps: number;
  maxUsers: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  color: string;
}

// Tipo para admin
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'support';
  createdAt: string;
  lastLogin: string | null;
}

// Mock de configurações
const initialSettings = {
  general: {
    name: 'TribeBuild',
    url: 'https://tribebuild.app',
    supportEmail: 'suporte@tribebuild.com',
    supportWhatsApp: '11999999999',
    primaryColor: '#2563EB', // brand-blue hex
    logo: null as string | null,
    favicon: null as string | null,
  },
  stripe: {
    publicKey: 'pk_live_xxxxxxxxxxxxx',
    secretKey: 'sk_live_xxxxxxxxxxxxx',
    webhookSecret: 'whsec_xxxxxxxxxxxxx',
    testMode: false,
  },
  email: {
    provider: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@tribebuild.com',
    smtpPassword: '********',
    fromName: 'TribeBuild',
    fromEmail: 'noreply@tribebuild.com',
  },
  trial: {
    enabled: true,
    days: 7,
  }
};

// Mock de planos (ATUALIZADO COM A NOVA OFERTA)
const initialPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 67,
    yearlyPrice: 672,
    maxApps: 1,
    maxUsers: 500,
    features: ['1 App', 'Até 500 usuários', 'Sem suporte humano'],
    isPopular: false,
    isActive: true,
    color: 'blue'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 127,
    yearlyPrice: 1272,
    maxApps: 3,
    maxUsers: 1500,
    features: ['3 Apps', 'Até 1.500 usuários', 'R$ 0,40 excedente', 'Suporte Email'],
    isPopular: true,
    isActive: true,
    color: 'orange'
  },
  {
    id: 'business',
    name: 'Business',
    price: 197,
    yearlyPrice: 1970,
    maxApps: 5,
    maxUsers: 2800,
    features: ['5 Apps', 'Até 2.800 usuários', 'R$ 0,40 excedente', 'Suporte WhatsApp'],
    isPopular: false,
    isActive: true,
    color: 'purple'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 397,
    yearlyPrice: 3970,
    maxApps: 10,
    maxUsers: 10000,
    features: ['10 Apps', 'Até 10.000 usuários', 'R$ 0,30 excedente (Desconto)', 'Suporte Prioritário'],
    isPopular: false,
    isActive: true,
    color: 'indigo'
  },
];

// Mock de admins
const initialAdmins: AdminUser[] = [
  {
    id: '1',
    name: 'Stephen (Dono)',
    email: 'admin@tribebuild.com',
    role: 'super_admin',
    createdAt: '2024-01-01',
    lastLogin: '2025-04-26T14:30:00',
  },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState(initialSettings);
  const [plans, setPlans] = useState(initialPlans);
  const [admins, setAdmins] = useState(initialAdmins);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  
  // Modal de adicionar admin
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState<{ name: string; email: string; role: 'admin' | 'support' }>({ name: '', email: '', role: 'admin' });

  // Tabs
  const tabs = [
    { id: 'general' as TabType, label: 'Geral', icon: Building2 },
    { id: 'plans' as TabType, label: 'Planos & Oferta', icon: DollarSign },
    { id: 'stripe' as TabType, label: 'Stripe', icon: CreditCard },
    { id: 'email' as TabType, label: 'Email (SMTP)', icon: Mail },
    { id: 'admins' as TabType, label: 'Equipe', icon: Users },
  ];

  // Salvar configurações
  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // Simular salvamento
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Formatar telefone
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Adicionar admin
  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) return;
    
    const admin: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
    };
    
    setAdmins([...admins, admin]);
    setNewAdmin({ name: '', email: '', role: 'admin' });
    setShowAddAdmin(false);
  };

  // Remover admin
  const handleRemoveAdmin = (id: string) => {
    if (confirm('Tem certeza que deseja remover este administrador?')) {
      setAdmins(admins.filter(a => a.id !== id));
    }
  };

  // Renderizar role
  const renderRole = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-100 dark:border-purple-800">Super Admin</span>;
      case 'admin':
        return <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800">Admin</span>;
      case 'support':
        return <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 dark:border-green-800">Suporte</span>;
      default:
        return null;
    }
  };

  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-10 animate-fade-in font-['Inter'] pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Super Admin</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-lg">Central de comando do Dono do SaaS</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl",
            saveSuccess 
              ? "bg-green-500 text-white shadow-green-500/20" 
              : "bg-brand-blue hover:bg-brand-blue-dark text-white shadow-blue-500/20 disabled:opacity-70"
          )}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center overflow-x-auto no-scrollbar animate-slide-up" style={{ animationDelay: '50ms' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-slate-900 dark:bg-slate-700 text-white shadow-lg" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
      </div>

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="p-10">
          
          {/* Tab: Geral */}
          {activeTab === 'general' && (
            <div className="space-y-12">
              {/* Informações do SaaS */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identidade do Negócio</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nome Fantasia do SaaS</label>
                    <input
                      type="text"
                      value={settings.general.name}
                      onChange={(e) => setSettings({...settings, general: {...settings.general, name: e.target.value}})}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Domínio Institucional</label>
                    <div className="relative group">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-brand-blue transition-colors" />
                      <input
                        type="url"
                        value={settings.general.url}
                        onChange={(e) => setSettings({...settings, general: {...settings.general, url: e.target.value}})}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">E-mail de Suporte ao Cliente</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-brand-blue transition-colors" />
                      <input
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) => setSettings({...settings, general: {...settings.general, supportEmail: e.target.value}})}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">WhatsApp de Suporte</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-brand-blue transition-colors" />
                      <input
                        type="tel"
                        value={formatPhone(settings.general.supportWhatsApp)}
                        onChange={(e) => setSettings({...settings, general: {...settings.general, supportWhatsApp: e.target.value.replace(/\D/g, '')}})}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-50 dark:bg-slate-700" />

              {/* Aparência */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aparência Global (Padrão)</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Cor Primária</label>
                    <div className="flex items-center gap-3 p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl">
                      <input
                        type="color"
                        value={settings.general.primaryColor}
                        onChange={(e) => setSettings({...settings, general: {...settings.general, primaryColor: e.target.value}})}
                        className="w-14 h-12 rounded-xl border-4 border-white dark:border-slate-800 cursor-pointer shadow-sm"
                      />
                      <input
                        type="text"
                        value={settings.general.primaryColor}
                        onChange={(e) => setSettings({...settings, general: {...settings.general, primaryColor: e.target.value}})}
                        className="flex-1 bg-transparent text-slate-900 dark:text-white focus:outline-none font-mono font-bold text-sm uppercase px-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Logotipo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner group overflow-hidden">
                        {settings.general.logo ? (
                          <img src={settings.general.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-brand-blue transition-colors" />
                        )}
                      </div>
                      <button className="px-5 py-3.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                        Alterar Logo
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Favicon</label>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner group overflow-hidden">
                        {settings.general.favicon ? (
                          <img src={settings.general.favicon} alt="Favicon" className="w-6 h-6 object-cover" />
                        ) : (
                          <Smartphone className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <button className="px-5 py-3.5 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                        Alterar Ícone
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-50 dark:bg-slate-700" />

              {/* Trial */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estratégia de Trial</h3>
                </div>
                
                <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-start gap-5">
                      <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors",
                          settings.trial.enabled ? "bg-green-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      )}>
                          <Clock className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="font-black text-slate-900 dark:text-white tracking-tight text-lg leading-none mb-2">Período Gratuito de Experiência</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Novos usuários poderão testar o TribeBuild sem cobrança inicial.</p>
                      </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {settings.trial.enabled && (
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pl-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duração:</span>
                        <input
                          type="number"
                          value={settings.trial.days}
                          onChange={(e) => setSettings({...settings, trial: {...settings.trial, days: parseInt(e.target.value) || 0}})}
                          min="1"
                          max="30"
                          className="w-16 px-3 py-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-xl text-center font-black focus:border-brand-blue focus:outline-none"
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white pr-3">dias</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setSettings({...settings, trial: {...settings.trial, enabled: !settings.trial.enabled}})}
                      className={cn(
                          "w-16 h-8 rounded-full transition-all relative p-1 shadow-inner",
                          settings.trial.enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                      )}
                    >
                      <div className={cn(
                          "w-6 h-6 bg-white rounded-full shadow-md transition-transform",
                          settings.trial.enabled ? 'translate-x-8' : 'translate-x-0'
                      )} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Planos */}
          {activeTab === 'plans' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuração de Assinaturas</h3>
                </div>
                <Button className="h-12 px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/10" leftIcon={Plus}>
                  Novo Plano
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={cn(
                        "bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 p-6 relative transition-all duration-500 group flex flex-col",
                        plan.isPopular ? 'border-brand-blue dark:border-brand-blue shadow-2xl shadow-blue-500/10 scale-105 z-10' : 'border-slate-100 dark:border-slate-700 hover:border-blue-200'
                    )}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-brand-blue text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
                          Recomendado
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                      <div>
                          <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{plan.name}</h4>
                          <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              plan.isActive ? "text-green-500" : "text-slate-400"
                          )}>
                              {plan.isActive ? '● Ativo' : '○ Inativo'}
                          </span>
                      </div>
                      <button
                          onClick={() => {
                            setPlans(plans.map(p => 
                              p.id === plan.id ? {...p, isActive: !p.isActive} : p
                            ));
                          }}
                          className={cn(
                            "w-10 h-5 rounded-full transition-all relative p-0.5 shadow-inner",
                            plan.isActive ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full shadow transition-all",
                            plan.isActive ? 'translate-x-5' : 'translate-x-0'
                          )} />
                      </button>
                    </div>

                    <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 transition-colors">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">R$</span>
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                        <span className="text-xs font-bold text-slate-400">/mês</span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ou R$ {plan.yearlyPrice} anual</p>
                    </div>

                    <div className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="mt-0.5 w-4 h-4 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center justify-center border border-green-100 dark:border-green-800 flex-shrink-0">
                             <Check className="w-2.5 h-2.5 text-green-500 stroke-[4px]" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button className="w-full h-12 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all shadow-xl active:scale-95">
                      Editar Limites
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Stripe */}
          {activeTab === 'stripe' && (
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pagamentos via Stripe</h3>
                </div>
                <a 
                  href="https://dashboard.stripe.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline"
                >
                  Abrir Dashboard Stripe
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Modo de teste Alerta */}
              <div className={cn(
                  "p-8 rounded-[2.5rem] border flex items-center gap-6 group transition-all",
                  settings.stripe.testMode 
                    ? "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30" 
                    : "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30"
              )}>
                <div className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110",
                    settings.stripe.testMode ? "bg-amber-500 text-white" : "bg-green-500 text-white"
                )}>
                  <Shield className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                      Modo {settings.stripe.testMode ? 'Sandbox (Teste)' : 'Produção (Real)'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {settings.stripe.testMode 
                        ? 'O sistema está em modo de homologação. Nenhum pagamento real será processado.' 
                        : 'O sistema está operando com transações reais. Verifique suas chaves de produção.'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSettings({...settings, stripe: {...settings.stripe, testMode: !settings.stripe.testMode}})}
                    className={cn(
                        "w-16 h-8 rounded-full transition-all relative p-1 shadow-inner",
                        !settings.stripe.testMode ? 'bg-green-500' : 'bg-amber-400'
                    )}
                  >
                    <div className={cn(
                        "w-6 h-6 bg-white rounded-full shadow transition-transform",
                        !settings.stripe.testMode ? 'translate-x-8' : 'translate-x-0'
                    )} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chave Pública (Publishable Key)</label>
                  <input
                    type="text"
                    value={settings.stripe.publicKey}
                    onChange={(e) => setSettings({...settings, stripe: {...settings.stripe, publicKey: e.target.value}})}
                    placeholder="pk_live_..."
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold font-mono text-sm"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chave Secreta (Secret Key)</label>
                  <div className="relative group">
                    <input
                      type={showStripeSecret ? 'text' : 'password'}
                      value={settings.stripe.secretKey}
                      onChange={(e) => setSettings({...settings, stripe: {...settings.stripe, secretKey: e.target.value}})}
                      placeholder="sk_live_..."
                      className="w-full px-5 pr-14 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      {showStripeSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assinatura de Webhook (Signing Secret)</label>
                  <input
                    type="text"
                    value={settings.stripe.webhookSecret}
                    onChange={(e) => setSettings({...settings, stripe: {...settings.stripe, webhookSecret: e.target.value}})}
                    placeholder="whsec_..."
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold font-mono text-sm"
                  />
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
                      <Info className="w-4 h-4 text-blue-500" />
                      <p className="text-[9px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">
                          Stripe Webhook URL: https://api.tribebuild.app/webhooks/stripe
                      </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Email */}
          {activeTab === 'email' && (
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Servidor de Email Transacional</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Hostname SMTP</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) => setSettings({...settings, email: {...settings.email, smtpHost: e.target.value}})}
                    placeholder="smtp.gmail.com"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Porta do Servidor</label>
                  <input
                    type="text"
                    value={settings.email.smtpPort}
                    onChange={(e) => setSettings({...settings, email: {...settings.email, smtpPort: e.target.value}})}
                    placeholder="587"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Usuário de Autenticação</label>
                  <input
                    type="text"
                    value={settings.email.smtpUser}
                    onChange={(e) => setSettings({...settings, email: {...settings.email, smtpUser: e.target.value}})}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Senha do SMTP</label>
                  <div className="relative group">
                    <input
                      type={showSmtpPassword ? 'text' : 'password'}
                      value={settings.email.smtpPassword}
                      onChange={(e) => setSettings({...settings, email: {...settings.email, smtpPassword: e.target.value}})}
                      className="w-full px-5 pr-14 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      {showSmtpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nome Exibido no Remetente</label>
                  <input
                    type="text"
                    value={settings.email.fromName}
                    onChange={(e) => setSettings({...settings, email: {...settings.email, fromName: e.target.value}})}
                    placeholder="Equipe TribeBuild"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">E-mail do Remetente</label>
                  <input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => setSettings({...settings, email: {...settings.email, fromEmail: e.target.value}})}
                    placeholder="noreply@tribebuild.com"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <button className="h-14 px-8 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3">
                <Send className="w-4 h-4" />
                Disparar Email de Teste
              </button>
            </div>
          )}

          {/* Tab: Admins */}
          {activeTab === 'admins' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Equipe com Acesso Mestre</h3>
                </div>
                <Button 
                  onClick={() => setShowAddAdmin(true)}
                  className="h-12 px-6 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10"
                  leftIcon={Plus}
                >
                  Novo Administrador
                </Button>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nível</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Último Login</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gestão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors group">
                                <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                                    {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white tracking-tight leading-none">{admin.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{admin.email}</p>
                                    </div>
                                </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                {renderRole(admin.role)}
                                </td>
                                <td className="px-8 py-6 hidden sm:table-cell">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(admin.lastLogin)}</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                {admin.role !== 'super_admin' ? (
                                    <button 
                                        onClick={() => handleRemoveAdmin(admin.id)}
                                        className="p-3 bg-white dark:bg-slate-700 text-slate-300 hover:text-red-500 border border-slate-100 dark:border-slate-600 rounded-xl transition-all shadow-sm hover:shadow-md"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-300 rounded-xl border border-slate-100 dark:border-slate-700 opacity-30 inline-block">
                                        <Lock size={16} />
                                    </div>
                                )}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Adicionar Admin */}
      {showAddAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddAdmin(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Novo Administrador</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Convidar para equipe</p>
              </div>
              <button onClick={() => setShowAddAdmin(false)} className="p-2 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nome Completo</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  placeholder="Ex: Roberto Carlos"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">E-mail de Acesso</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  placeholder="admin@tribebuild.com"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nível de Permissão</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value as 'admin' | 'support'})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold transition-all"
                >
                  <option value="admin">Administrador Geral</option>
                  <option value="support">Suporte Técnico</option>
                </select>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-amber-500">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">Aviso de Segurança</p>
                    <p className="text-[9px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed mt-1">
                        O novo usuário receberá acesso total ao painel admin mestre, podendo gerenciar usuários e faturamento.
                    </p>
                  </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowAddAdmin(false)}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddAdmin}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
              >
                Ativar Acesso
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}