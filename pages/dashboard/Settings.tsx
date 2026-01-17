import React, { useState } from 'react';
import { User, Bell, Lock, Mail, Edit2, Shield, Save } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    whiteLabel: false
  });

  const handleWhiteLabelToggle = () => {
    if (!canRemoveBranding) {
      if (confirm(`O recurso White Label é exclusivo do plano Enterprise. Deseja ver os planos?`)) {
        navigate('/dashboard/plans');
      }
      return;
    }
    setFormData(prev => ({ ...prev, whiteLabel: !prev.whiteLabel }));
  };

  const getPlanColor = (plan: string) => {
    switch(plan) {
      case 'starter': return 'bg-blue-50 text-blue-600';
      case 'professional': return 'bg-orange-50 text-orange-600';
      case 'business': return 'bg-purple-50 text-purple-600';
      case 'enterprise': return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-20 font-['Inter']">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configurações</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Gerencie sua conta e preferências</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        
        {/* Header do Perfil */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-700 overflow-hidden border-4 border-white dark:border-slate-600 shadow-xl flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-slate-300 dark:text-slate-500">{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 hover:scale-110 transition-transform">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{userName}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{userEmail}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getPlanColor(userPlan)}`}>
                Plano {userPlan}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Ativo
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard/plans')}
            className="text-xs font-black uppercase tracking-widest"
          >
            Mudar Plano
          </Button>
        </div>

        <div className="p-8 space-y-10">
           {/* Dados Pessoais */}
           <div className="grid md:grid-cols-2 gap-8">
             <div>
               <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Nome de Exibição</label>
               <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-bold text-slate-700 dark:text-white" 
                  />
               </div>
             </div>
             <div>
               <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">E-mail de Contato</label>
               <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    value={formData.email} 
                    disabled 
                    className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none text-slate-500 cursor-not-allowed font-medium" 
                  />
               </div>
             </div>
           </div>

           {/* Seção White Label (NOVO) */}
           <div className="pt-8 border-t border-slate-100 dark:border-slate-700 relative">
             <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <Shield className="w-5 h-5 text-purple-500" /> Marca & White Label
             </h3>
             
             {/* Bloqueio Visual */}
             {!canRemoveBranding && (
                <div className="absolute top-8 right-0 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg flex items-center gap-1.5">
                   <Lock className="w-3 h-3 text-slate-400" />
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enterprise Only</span>
                </div>
             )}

             <div className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${
               canRemoveBranding 
                ? 'border-purple-100 bg-purple-50/30' 
                : 'border-slate-100 bg-slate-50/50 opacity-75'
             }`}>
               <div>
                 <h4 className="font-bold text-slate-900 dark:text-white">Remover "Powered by TribeBuild"</h4>
                 <p className="text-xs text-slate-500 mt-1 max-w-md font-medium leading-relaxed">
                   Remove a nossa marca do rodapé do seu aplicativo e dos e-mails automáticos enviados aos seus alunos.
                 </p>
               </div>
               
               <button 
                 onClick={handleWhiteLabelToggle}
                 className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                   formData.whiteLabel ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'
                 } ${!canRemoveBranding ? 'cursor-not-allowed' : 'cursor-pointer'}`}
               >
                 <span
                   className={`${
                     formData.whiteLabel ? 'translate-x-6' : 'translate-x-1'
                   } inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200`}
                 />
               </button>
             </div>
           </div>

           <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
             <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <Bell className="w-5 h-5 text-brand-blue" /> Notificações
             </h3>
             <div className="space-y-4">
               {[
                 { label: 'Novos usuários registrados', desc: 'Receba um alerta quando alguém se cadastrar.' },
                 { label: 'Relatórios semanais', desc: 'Resumo de performance no seu e-mail.' },
                 { label: 'Alertas de segurança', desc: 'Notificações críticas sobre sua conta.' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between py-2">
                   <div>
                     <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.label}</p>
                     <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                   </div>
                   <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer hover:bg-slate-300 transition-colors">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           <div className="pt-10 flex justify-end">
             <Button 
               size="lg" 
               className="px-10 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
               leftIcon={Save}
             >
               Salvar Alterações
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;