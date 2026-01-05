
import React from 'react';
import { User, Bell, CreditCard, Lock, Mail, Edit2 } from 'lucide-react';
import Button from '../../components/Button';

const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-white">Configurações</h1>
        <p className="text-slate-500">Gerencie sua conta e preferências</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-700 overflow-hidden border-4 border-white shadow-lg">
              <img src="https://picsum.photos/seed/profile/100/100" alt="Avatar" />
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-white">João Silva</h2>
            <p className="text-slate-500 font-medium">joao@exemplo.com</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase">Plano Starter</span>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase">Ativo</span>
            </div>
          </div>
          <Button variant="outline">Upgrade de Plano</Button>
        </div>

        <div className="p-8 space-y-8">
           <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nome de Exibição</label>
                <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <input type="text" defaultValue="João Silva" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">E-mail de Contato</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <input type="email" defaultValue="joao@exemplo.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <Lock className="w-5 h-5" /> Segurança
             </h3>
             <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nova Senha</label>
                  <input type="password" placeholder="••••••••" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Nova Senha</label>
                  <input type="password" placeholder="••••••••" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none" />
                </div>
             </div>
           </div>

           <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <Bell className="w-5 h-5" /> Preferências de Notificação
             </h3>
             <div className="space-y-4">
                {[
                  { label: 'Novos usuários registrados', desc: 'Receba um alerta quando alguém se cadastrar no seu app.' },
                  { label: 'Relatórios semanais de performance', desc: 'Resumo semanal de métricas no seu e-mail.' },
                  { label: 'Alertas de segurança', desc: 'Notificações críticas sobre sua conta.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                       <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="pt-10 flex justify-end">
              <Button size="lg">Salvar Alterações</Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
