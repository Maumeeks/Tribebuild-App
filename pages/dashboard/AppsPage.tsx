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
  MessagesSquare
} from 'lucide-react';
import { useApps } from '../../contexts/AppsContext';

const AppsPage: React.FC = () => {
  const { apps, deleteApp } = useApps();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  // User plan info - Basic limit changed from 3 to 1
  const userPlan = {
    name: 'Basic',
    maxApps: 1,
  };

  const isLimitReached = apps.length >= userPlan.maxApps;

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
    <div className="space-y-8 font-['Inter'] pb-20"> {/* pb-20 para dar espaço no mobile */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-slide-up">
        <div>
          <h1 className="text-3xl font-black text-brand-blue tracking-tighter">Meus Apps</h1>
          <p className="text-slate-500 mt-2 font-medium max-w-2xl leading-relaxed">
            Crie e gerencie seus aplicativos personalizados. Cada app pode ter sua própria identidade visual, conteúdo e configurações exclusivas.
          </p>
          <div className="flex items-center gap-4 mt-4">
             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100/50">
               Plano atual: {userPlan.name}
             </span>
             <span className={`text-xs font-bold uppercase tracking-widest ${isLimitReached ? 'text-red-500' : 'text-slate-400'}`}>
               Apps: <span className={isLimitReached ? 'text-red-600' : 'text-slate-900'}>{apps.length}/{userPlan.maxApps}</span>
             </span>
          </div>
        </div>
        
        {isLimitReached ? (
          <div className="flex flex-col items-end gap-2">
            <button
              disabled
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-200 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-sm cursor-not-allowed shadow-none w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              Novo App
            </button>
            <p className="text-[10px] text-red-500 font-black uppercase tracking-widest animate-pulse">
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

      {/* Alerta de Limite */}
      {isLimitReached && (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up shadow-sm shadow-amber-200/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="text-amber-900 font-black tracking-tight">Limite do plano atingido!</h4>
              <p className="text-amber-700 text-sm font-medium">Você atingiu o limite de apps do seu plano. Faça upgrade para criar mais apps e desbloquear recursos premium.</p>
            </div>
          </div>
          <Link
            to="/dashboard/plans"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-amber-600/20 whitespace-nowrap w-full md:w-auto"
          >
            Fazer Upgrade Agora
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Lista de Apps ou Estado Vazio */}
      {apps.length === 0 ? (
        /* Estado Vazio */
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-8 md:p-16 text-center shadow-sm animate-fade-in">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Snowflake className="w-10 h-10 text-brand-blue" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Você ainda não criou nenhum app.
          </h3>
          <p className="text-slate-500 mb-10 max-w-md mx-auto font-medium leading-relaxed">
            Comece agora mesmo a entregar uma experiência premium e exclusiva para seus clientes com seu primeiro aplicativo.
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
        /* Grid de Apps */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {apps.map((app, index) => (
            <div 
              key={app.id}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:border-brand-blue/30 transition-all duration-500 group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* App Header / Identity */}
              <div className="p-6 md:p-8 pb-6 flex flex-col items-center">
                <div className="relative mb-6">
                  {app.logo ? (
                    <img 
                      src={app.logo} 
                      alt={app.name}
                      className="w-24 h-24 rounded-3xl object-cover shadow-xl"
                    />
                  ) : (
                    <div 
                        className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundColor: app.primaryColor }}
                    >
                      <span className="text-white text-3xl font-black tracking-tighter">
                        {getInitials(app.name)}
                      </span>
                    </div>
                  )}
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 border-4 border-white rounded-full shadow-lg ${app.status === 'published' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white text-center tracking-tight">
                  {app.name}
                </h3>
                
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Criado em {formatDate(app.createdAt)}
                </div>
              </div>

              {/* Link de Acesso Copiável */}
              <div className="px-6 md:px-8 pb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Endereço de Acesso</p>
                <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 group/link">
                  <span className="text-sm font-bold text-slate-600 truncate flex-1 ml-1">
                    {app.customDomain || app.accessLink.replace('https://', '')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyLink(app.id, app.customDomain ? `https://${app.customDomain}` : app.accessLink)}
                      className="p-2 text-slate-400 hover:text-brand-blue hover:bg-white hover:shadow-md rounded-xl transition-all"
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
                      className="p-2 text-slate-400 hover:text-brand-blue hover:bg-white hover:shadow-md rounded-xl transition-all"
                      title="Abrir aplicativo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Grid de Ações Rápidas */}
              <div className="px-6 md:px-8 pb-8 space-y-3">
                <Link
                  to="/dashboard/builder"
                  className="flex items-center justify-center gap-3 w-full py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 text-slate-600 hover:text-brand-blue rounded-2xl font-bold transition-all border border-transparent hover:border-blue-100 text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Identidade
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/dashboard/apps/${app.id}/products`}
                    className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 text-slate-600 hover:text-brand-blue rounded-2xl font-bold transition-all border border-transparent hover:border-blue-100 text-xs uppercase tracking-widest"
                  >
                    <Package className="w-4 h-4" />
                    Produtos
                  </Link>
                  <Link
                    to={`/dashboard/apps/${app.id}/feed`}
                    className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 text-slate-600 hover:text-brand-blue rounded-2xl font-bold transition-all border border-transparent hover:border-blue-100 text-xs uppercase tracking-widest"
                  >
                    <Rss className="w-4 h-4" />
                    Feed
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to={`/dashboard/apps/${app.id}/community`}
                    className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 text-slate-600 hover:text-brand-blue rounded-2xl font-bold transition-all border border-transparent hover:border-blue-100 text-xs uppercase tracking-widest"
                  >
                    <MessagesSquare className="w-4 h-4" />
                    Comunidade
                  </Link>
                  <Link
                    to={`/dashboard/apps/${app.id}/notifications`}
                    className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 text-slate-600 hover:text-brand-blue rounded-2xl font-bold transition-all border border-transparent hover:border-blue-100 text-xs uppercase tracking-widest"
                  >
                    <Bell className="w-4 h-4" />
                    Push
                  </Link>
                </div>

                <button
                  onClick={() => handleDeleteApp(app.id)}
                  className="flex items-center justify-center gap-3 w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl font-bold transition-all border border-transparent hover:border-red-200 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Apagar Aplicativo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão (Corrigido para Mobile) */}
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
            <p className="text-slate-500 text-center mb-8 md:mb-10 font-medium leading-relaxed text-sm md:text-base">
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