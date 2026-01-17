import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Smartphone,
  Edit3,
  Package,
  Rss,
  Users,
  Bell,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  Snowflake,
  MoreVertical,
  Calendar,
  AlertCircle,
  ChevronRight,
  MessagesSquare,
  Crown
} from 'lucide-react';
import { useApps } from '../../contexts/AppsContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const AppsPage: React.FC = () => {
  const { apps, deleteApp } = useApps();
  const { profile } = useAuth(); // Pegando dados reais do usuário
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  // --- LÓGICA DE LIMITES POR PLANO (Conforme supabase.ts) ---
  const getPlanDetails = (planName: string | undefined) => {
    const plan = planName || 'free';

    switch (plan) {
      case 'enterprise':
        return { 
          label: 'Enterprise', 
          maxApps: 999, 
          style: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' 
        };
      case 'business':
        return { 
          label: 'Business', 
          maxApps: 20, 
          style: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' 
        };
      case 'professional':
        return { 
          label: 'Profissional', 
          maxApps: 10, 
          style: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800' 
        };
      case 'starter':
        return { 
          label: 'Starter', 
          maxApps: 3, 
          style: 'bg-blue-50 text-brand-blue border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' 
        };
      case 'free':
      default:
        return { 
          label: 'Gratuito', 
          maxApps: 1, 
          style: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' 
        };
    }
  };

  const currentPlan = getPlanDetails(profile?.plan);
  const isLimitReached = apps.length >= currentPlan.maxApps;

  const handleCopyLink = async (appId: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(appId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handleDeleteApp = (appId: string) => {
    setAppToDelete(appId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (appToDelete) {
      deleteApp(appToDelete);
      setDeleteModalOpen(false);
      setAppToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-8 font-['Inter'] pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-slide-up">
        <div>
          <h1 className="text-3xl font-black text-brand-blue tracking-tighter">Meus Apps</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-2xl leading-relaxed">
            Gerencie seus aplicativos. Cada app pode ter sua própria identidade e conteúdo exclusivo.
          </p>
          
          <div className="flex items-center gap-3 mt-4">
             {/* Badge do Plano Atual */}
             <div className={cn(
               "inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border",
               currentPlan.style
             )}>
               {profile?.plan !== 'free' && <Crown className="w-3 h-3" />}
               Plano: {currentPlan.label}
             </div>
             
             {/* Contador de Apps */}
             <span className={cn(
               "text-xs font-bold uppercase tracking-widest ml-2",
               isLimitReached ? "text-brand-coral" : "text-slate-400 dark:text-slate-500"
             )}>
               Apps Criados: <span className={isLimitReached ? 'text-brand-coral' : 'text-slate-900 dark:text-white'}>{apps.length}</span> / {currentPlan.maxApps}
             </span>
          </div>
        </div>
        
        {isLimitReached ? (
          <div className="flex flex-col items-end gap-2">
            <button
              disabled
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-2xl font-black uppercase tracking-widest text-sm cursor-not-allowed shadow-none border border-slate-200 dark:border-slate-700 w-full sm:w-auto opacity-70"
            >
              <Plus className="w-5 h-5" />
              Novo App
            </button>
            <p className="text-[10px] text-brand-coral font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Limite Atingido
            </p>
          </div>
        ) : (
          <Link
            to="/dashboard/builder"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 transform hover:-translate-y-1 active:scale-95 transition-all duration-300 whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Novo App
          </Link>
        )}
      </div>

      {/* Alerta de Limite - DESIGN CORAL */}
      {isLimitReached && (
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-orange-900/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-orange-100 dark:border-orange-900/30">
              <AlertCircle className="w-6 h-6 text-brand-coral" />
            </div>
            <div>
              <h4 className="text-orange-900 dark:text-orange-100 font-black tracking-tight text-lg">Limite do plano atingido!</h4>
              <p className="text-orange-800/80 dark:text-orange-200/70 text-sm font-medium mt-1">
                Você atingiu o limite de <strong>{currentPlan.maxApps} apps</strong> do plano {currentPlan.label}. Faça upgrade para continuar criando.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/plans"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-coral hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 whitespace-nowrap w-full md:w-auto transform hover:-translate-y-0.5"
          >
            Fazer Upgrade Agora
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Lista de Apps ou Estado Vazio */}
      {apps.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 md:p-16 text-center shadow-sm animate-fade-in">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Snowflake className="w-10 h-10 text-brand-blue" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Você ainda não criou nenhum app.
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto font-medium leading-relaxed">
            Comece agora mesmo a entregar uma experiência premium e exclusiva para seus clientes.
          </p>
          <Link
            to="/dashboard/builder"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 transform hover:-translate-y-1 active:scale-95 transition-all duration-300 w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            Criar meu primeiro app
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {apps.map((app, index) => (
            <div 
              key={app.id}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:border-brand-blue/30 dark:hover:border-brand-blue/30 transition-all duration-500 group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* App Header */}
              <div className="p-6 md:p-8 pb-6 flex flex-col items-center">
                <div className="relative mb-6">
                  {app.logo ? (
                    <img 
                      src={app.logo} 
                      alt={app.name}
                      className="w-24 h-24 rounded-3xl object-cover shadow-xl border-4 border-white dark:border-slate-700"
                    />
                  ) : (
                    <div 
                        className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500 border-4 border-white dark:border-slate-700"
                        style={{ backgroundColor: app.primaryColor }}
                    >
                      <span className="text-white text-3xl font-black tracking-tighter">
                        {getInitials(app.name)}
                      </span>
                    </div>
                  )}
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 border-4 border-white dark:border-slate-800 rounded-full shadow-lg ${app.status === 'published' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white text-center tracking-tight">
                  {app.name}
                </h3>
                
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Criado em {formatDate(app.createdAt)}
                </div>
              </div>

              {/* Link de Acesso */}
              <div className="px-6 md:px-8 pb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Endereço de Acesso</p>
                <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 group/link">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate flex-1 ml-1">
                    {app.customDomain || app.accessLink.replace('https://', '')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(app.id, app.customDomain ? `https://${app.customDomain}` : app.accessLink)}
                      className="p-2 text-slate-400 hover:text-brand-blue hover:bg-white dark:hover:bg-slate-800 hover:shadow-md rounded-xl transition-all"
                      title="Copiar link"
                    >
                      {copiedId === app.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={app.customDomain ? `https://${app.customDomain}` : app.accessLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-brand-blue hover:bg-white dark:hover:bg-slate-800 hover:shadow-md rounded-xl transition-all"
                      title="Abrir aplicativo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="px-6 md:px-8 pb-8 space-y-3">
                <Link
                  to="/dashboard/builder"
                  className="flex items-center justify-center gap-3 w-full py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-brand-blue rounded-2xl font-bold transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800 text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Identidade
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/dashboard/apps/${app.id}/products`}
                    className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-brand-blue rounded-2xl font-bold transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800 text-xs uppercase tracking-widest"
                  >
                    <Package className="w-4 h-4" />
                    Produtos
                  </Link>
                  <Link
                    to={`/dashboard/apps/${app.id}/feed`}
                    className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-brand-blue rounded-2xl font-bold transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800 text-xs uppercase tracking-widest"
                  >
                    <Rss className="w-4 h-4" />
                    Feed
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/dashboard/apps/${app.id}/community`}
                    className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-brand-blue rounded-2xl font-bold transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800 text-xs uppercase tracking-widest"
                  >
                    <MessagesSquare className="w-4 h-4" />
                    Comunidade
                  </Link>
                  <Link
                    to={`/dashboard/apps/${app.id}/notifications`}
                    className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-brand-blue rounded-2xl font-bold transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800 text-xs uppercase tracking-widest"
                  >
                    <Bell className="w-4 h-4" />
                    Push
                  </Link>
                </div>

                <button
                  onClick={() => handleDeleteApp(app.id)}
                  className="flex items-center justify-center gap-3 w-full py-3.5 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded-2xl font-bold transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Apagar Aplicativo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setDeleteModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl max-w-md w-full p-6 md:p-10 animate-slide-up overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-sm">
              <Trash2 className="w-8 h-8 md:w-10 md:h-10 text-red-500 stroke-[2.5px]" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Deseja apagar este app?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 md:mb-10 font-medium leading-relaxed text-sm md:text-base">
              Esta ação é <span className="text-red-500 font-bold">irreversível</span>. Todos os dados vinculados a este app serão permanentemente excluídos.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 transition-all active:scale-95"
              >
                Sim, apagar permanentemente
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="w-full py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Cancelar e Manter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppsPage;