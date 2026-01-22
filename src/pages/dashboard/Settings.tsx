import React, { useState } from 'react';
import { User, Bell, Lock, Mail, Edit2, Shield, Save, CheckCircle2 } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const Settings: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Dados reais do usuário
  const userPlan = profile?.plan || 'starter';
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = user?.email || '';

  // Regra de Negócio: White Label só para Enterprise
  const canRemoveBranding = userPlan === 'enterprise';

  const [formData, setFormData] = useState({
    fullName: userName,
    email: userEmail,
    whiteLabel: false,
    notifications: {
      newUsers: true,
      reports: true,
      security: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleWhiteLabelToggle = () => {
    if (!canRemoveBranding) {
      if (confirm(`O recurso White Label é exclusivo do plano Enterprise. Deseja ver os planos?`)) {
        navigate('/dashboard/plans');
      }
      return;
    }
    setFormData(prev => ({ ...prev, whiteLabel: !prev.whiteLabel }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulação de save
    setTimeout(() => {
      setIsSaving(false);
      alert('Configurações salvas com sucesso!');
    }, 1000);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      case 'professional': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30';
      case 'business': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30';
      case 'enterprise': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-20 font-['Outfit'] animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Configurações</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie sua conta e preferências.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

        {/* Profile Header */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-700 shadow-sm flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-brand-blue text-white rounded-full shadow-md border-2 border-white dark:border-slate-800 hover:scale-110 transition-transform">
              <Edit2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{userName}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{userEmail}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              <span className={cn("px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border", getPlanColor(userPlan))}>
                {userPlan}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Ativo
              </span>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/plans')} className="text-xs font-bold uppercase h-9">
            Mudar Plano
          </Button>
        </div>

        <div className="p-8 space-y-10">

          {/* Dados Pessoais */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome de Exibição</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>

          {/* White Label */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" /> Marca & White Label
            </h3>

            <div className={cn(
              "flex items-center justify-between p-5 rounded-xl border transition-all",
              canRemoveBranding
                ? "bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/30"
                : "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 opacity-75"
            )}>
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Remover "Powered by TribeBuild"</h4>
                  {!canRemoveBranding && (
                    <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded text-[9px] font-bold uppercase tracking-wide flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Enterprise
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Remove a nossa marca do rodapé do seu aplicativo e dos e-mails automáticos.
                </p>
              </div>

              <button
                onClick={handleWhiteLabelToggle}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  formData.whiteLabel ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600',
                  !canRemoveBranding && 'cursor-not-allowed'
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                  formData.whiteLabel ? 'translate-x-6' : 'translate-x-1'
                )} />
              </button>
            </div>
          </div>

          {/* Notificações */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-blue" /> Notificações
            </h3>
            <div className="space-y-4">
              {[
                { id: 'newUsers', label: 'Novos usuários registrados', desc: 'Receba um alerta quando alguém se cadastrar.' },
                { id: 'reports', label: 'Relatórios semanais', desc: 'Resumo de performance no seu e-mail.' },
                { id: 'security', label: 'Alertas de segurança', desc: 'Notificações críticas sobre sua conta.' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <button
                    // @ts-ignore
                    onClick={() => setFormData(prev => ({ ...prev, notifications: { ...prev.notifications, [item.id]: !prev.notifications[item.id] } }))}
                    className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                      // @ts-ignore
                      formData.notifications[item.id] ? 'bg-brand-blue' : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  >
                    <span className={cn(
                      "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200",
                      // @ts-ignore
                      formData.notifications[item.id] ? 'translate-x-5' : 'translate-x-0.5'
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 flex justify-end border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 px-6 text-xs font-bold uppercase tracking-wide shadow-lg shadow-brand-blue/20"
              leftIcon={isSaving ? undefined : Save}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;