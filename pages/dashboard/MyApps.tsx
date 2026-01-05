
import React from 'react';
import { Smartphone, MoreVertical, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import Button from '../../components/Button';
import { MOCK_APPS } from '../../constants';

const MyApps: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-white">Meus Apps</h1>
          <p className="text-slate-500">Gerencie seus aplicativos criados</p>
        </div>
        <Button variant="primary">Criar Novo</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_APPS.map(app => (
          <div key={app.id} className="bg-white rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
            <div style={{ backgroundColor: app.primaryColor }} className="h-24 p-6 relative">
              <div className="absolute -bottom-6 left-6 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-lg">
                <div style={{ backgroundColor: app.primaryColor }} className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {app.name.charAt(0)}
                </div>
              </div>
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6 pt-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white dark:text-white">{app.name}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-tighter uppercase ${
                  app.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {app.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">tribebuild.app/{app.slug}</p>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Usuários</p>
                  <p className="font-bold text-slate-900 dark:text-white dark:text-white">{app.stats.users}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Engagement</p>
                  <p className="font-bold text-slate-900 dark:text-white dark:text-white">{app.stats.engagement}%</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <ExternalLink className="w-4 h-4" /> Abrir
                </Button>
                <Button variant="primary" size="sm" className="flex-1">Dashboard</Button>
              </div>
            </div>
          </div>
        ))}

        <button className="h-full min-h-[300px] border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 hover:border-blue-100 hover:bg-blue-50/50 hover:text-blue-500 transition-all group">
           <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Smartphone className="w-8 h-8" />
           </div>
           <span className="font-bold">Adicionar Novo App</span>
        </button>
      </div>
    </div>
  );
};

export default MyApps;
