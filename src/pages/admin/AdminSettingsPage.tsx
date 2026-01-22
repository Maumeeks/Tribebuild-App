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
  Clock,
  Lock,
  Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Types
type TabType = 'general' | 'plans' | 'stripe' | 'email' | 'admins';

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

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'support';
  createdAt: string;
  lastLogin: string | null;
}

// Mocks
const initialSettings = {
  general: {
    name: 'TribeBuild',
    url: 'https://tribebuild.app',
    supportEmail: 'suporte@tribebuild.com',
    supportWhatsApp: '11999999999',
    primaryColor: '#2563EB',
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
    features: ['3 Apps', 'Até 1.500 usuários', 'R$ 0,40 excedente'],
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
    features: ['5 Apps', 'Até 2.800 usuários', 'R$ 0,40 excedente'],
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
    features: ['10 Apps', 'Até 10.000 usuários', 'Suporte Prioritário'],
    isPopular: false,
    isActive: true,
    color: 'indigo'
  },
];

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
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState<{ name: string; email: string; role: 'admin' | 'support' }>({ name: '', email: '', role: 'admin' });

  const tabs = [
    { id: 'general' as TabType, label: 'Geral', icon: Building2 },
    { id: 'plans' as TabType, label: 'Planos', icon: DollarSign },
    { id: 'stripe' as TabType, label: 'Stripe', icon: CreditCard },
    { id: 'email' as TabType, label: 'Email', icon: Mail },
    { id: 'admins' as TabType, label: 'Equipe', icon: Users },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

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

  const handleRemoveAdmin = (id: string) => {
    if (confirm('Remover administrador?')) {
      setAdmins(admins.filter(a => a.id !== id));
    }
  };

  const renderRole = (role: string) => {
    switch (role) {
      case 'super_admin': return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Super Admin</span>;
      case 'admin': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Admin</span>;
      case 'support': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Suporte</span>;
      default: return null;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-8 font-['inter'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Configurações</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie as configurações globais do sistema.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm",
            saveSuccess
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
          )}
        >
          {isSaving ? (
            <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
          ) : saveSuccess ? (
            <><CheckCircle2 className="w-4 h-4" /> Salvo!</>
          ) : (
            <><Save className="w-4 h-4" /> Salvar Alterações</>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8">

        {/* === GERAL === */}
        {activeTab === 'general' && (
          <div className="space-y-8 max-w-4xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Identidade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do SaaS</label>
                  <input
                    type="text"
                    value={settings.general.name}
                    onChange={(e) => setSettings({ ...settings, general: { ...settings.general, name: e.target.value } })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL Base</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={settings.general.url}
                      onChange={(e) => setSettings({ ...settings, general: { ...settings.general, url: e.target.value } })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Suporte</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => setSettings({ ...settings, general: { ...settings.general, supportEmail: e.target.value } })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Suporte</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={settings.general.supportWhatsApp}
                      onChange={(e) => setSettings({ ...settings, general: { ...settings.general, supportWhatsApp: e.target.value } })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 my-8"></div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Trial Gratuito
              </h3>
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Habilitar Trial</p>
                  <p className="text-xs text-slate-500 mt-1">Novos usuários podem testar sem cartão.</p>
                </div>
                <div className="flex items-center gap-4">
                  {settings.trial.enabled && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.trial.days}
                        onChange={(e) => setSettings({ ...settings, trial: { ...settings.trial, days: parseInt(e.target.value) || 0 } })}
                        className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center text-sm font-bold"
                      />
                      <span className="text-xs font-bold text-slate-500 uppercase">Dias</span>
                    </div>
                  )}
                  <button
                    onClick={() => setSettings({ ...settings, trial: { ...settings.trial, enabled: !settings.trial.enabled } })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative p-1 shadow-inner",
                      settings.trial.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    )}
                  >
                    <div className={cn("w-4 h-4 bg-white rounded-full shadow transition-transform", settings.trial.enabled ? 'translate-x-6' : 'translate-x-0')} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === PLANOS === */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Planos Disponíveis</h3>
              <Button size="sm" leftIcon={Plus} className="text-xs uppercase font-bold">Novo Plano</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <div key={plan.id} className={cn("border rounded-xl p-5 relative bg-white dark:bg-slate-950 flex flex-col transition-all hover:border-brand-blue/50", plan.isPopular ? "border-brand-blue shadow-sm" : "border-slate-200 dark:border-slate-800")}>
                  {plan.isPopular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-[9px] font-bold uppercase px-3 py-0.5 rounded-full">Popular</span>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                    <div className={cn("w-2 h-2 rounded-full", plan.isActive ? "bg-emerald-500" : "bg-slate-300")} />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">R$ {plan.price}<span className="text-xs font-normal text-slate-500">/mês</span></div>
                  <div className="text-xs text-slate-500 mb-4">R$ {plan.yearlyPrice} anual</div>

                  <div className="flex-1 space-y-2 mb-4">
                    {plan.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Check className="w-3 h-3 text-emerald-500" /> {f}
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">Editar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === STRIPE === */}
        {activeTab === 'stripe' && (
          <div className="space-y-6 max-w-4xl">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", settings.stripe.testMode ? "bg-amber-500" : "bg-emerald-500")}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-900 dark:text-white">Modo {settings.stripe.testMode ? 'Sandbox (Teste)' : 'Produção'}</p>
                <p className="text-xs text-slate-500">{settings.stripe.testMode ? 'Transações simuladas.' : 'Transações reais ativas.'}</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, stripe: { ...settings.stripe, testMode: !settings.stripe.testMode } })}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors", settings.stripe.testMode ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200")}
              >
                Alternar
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Public Key</label>
                <input type="text" value={settings.stripe.publicKey} onChange={(e) => setSettings({ ...settings, stripe: { ...settings.stripe, publicKey: e.target.value } })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secret Key</label>
                <div className="relative">
                  <input type={showStripeSecret ? 'text' : 'password'} value={settings.stripe.secretKey} onChange={(e) => setSettings({ ...settings, stripe: { ...settings.stripe, secretKey: e.target.value } })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono" />
                  <button type="button" onClick={() => setShowStripeSecret(!showStripeSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Eye className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Webhook Secret</label>
                <input type="text" value={settings.stripe.webhookSecret} onChange={(e) => setSettings({ ...settings, stripe: { ...settings.stripe, webhookSecret: e.target.value } })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono" />
              </div>
            </div>
          </div>
        )}

        {/* === EMAIL === */}
        {activeTab === 'email' && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Mail className="w-4 h-4" /> SMTP Server</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Host</label>
                <input type="text" value={settings.email.smtpHost} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpHost: e.target.value } })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Port</label>
                <input type="text" value={settings.email.smtpPort} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpPort: e.target.value } })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User</label>
                <input type="text" value={settings.email.smtpUser} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpUser: e.target.value } })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input type={showSmtpPassword ? 'text' : 'password'} value={settings.email.smtpPassword} onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpPassword: e.target.value } })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
                  <button type="button" onClick={() => setShowSmtpPassword(!showSmtpPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Eye className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Send className="w-3 h-3" /> Testar Conexão
            </button>
          </div>
        )}

        {/* === ADMINS === */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Equipe Administrativa</h3>
              <Button size="sm" leftIcon={Plus} onClick={() => setShowAddAdmin(true)} className="text-xs uppercase font-bold">Adicionar</Button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Criado em</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{admin.name}</p>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </td>
                      <td className="px-6 py-4">{renderRole(admin.role)}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{formatDate(admin.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {admin.role !== 'super_admin' && (
                          <button onClick={() => handleRemoveAdmin(admin.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal Add Admin */}
      {showAddAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddAdmin(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-slide-up border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Novo Admin</h3>
            <p className="text-xs text-slate-500 mb-6">Convide um membro para a equipe.</p>
            <div className="space-y-4">
              <input type="text" placeholder="Nome" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
              <input type="email" placeholder="Email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
              <select value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as any })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm">
                <option value="admin">Admin</option>
                <option value="support">Suporte</option>
              </select>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAddAdmin(false)} className="flex-1 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">Cancelar</button>
                <button onClick={handleAddAdmin} className="flex-1 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold uppercase hover:bg-blue-600">Adicionar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}