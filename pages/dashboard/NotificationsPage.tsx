
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Plus,
  Send,
  X,
  Smartphone,
  Link as LinkIcon,
  Clock,
  Users,
  Trash2,
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Tipos
interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  sentAt: string;
  devicesReached: number;
}

// Mock de notificações enviadas
const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Novo módulo disponível! 🎉',
    message: 'Confira o módulo 3 que acabou de ser liberado. Bons estudos!',
    link: null,
    sentAt: '2025-04-14T10:30:00',
    devicesReached: 127
  },
  {
    id: '2',
    title: 'Live exclusiva amanhã!',
    message: 'Não perca nossa live sobre estratégias avançadas às 19h.',
    link: 'https://example.com/live',
    sentAt: '2025-04-12T15:00:00',
    devicesReached: 89
  }
];

const NotificationsPage: React.FC = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado do formulário
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  
  // Estado de exclusão
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; notificationId: string | null }>({
    open: false,
    notificationId: null
  });

  const handleSendNotification = () => {
    if (!title.trim()) {
      alert('Digite o título da notificação');
      return;
    }
    if (!message.trim()) {
      alert('Digite a mensagem da notificação');
      return;
    }
    if (title.length > 30) {
      alert('O título deve ter no máximo 30 caracteres');
      return;
    }
    if (message.length > 80) {
      alert('A mensagem deve ter no máximo 80 caracteres');
      return;
    }

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      link: link.trim() || null,
      sentAt: new Date().toISOString(),
      devicesReached: Math.floor(Math.random() * 100) + 50 // Mock
    };

    setNotifications([newNotification, ...notifications]);
    
    // Limpar formulário e fechar modal
    setTitle('');
    setMessage('');
    setLink('');
    setIsModalOpen(false);
    
    alert('Notificação enviada com sucesso!');
  };

  const handleDelete = () => {
    if (!deleteModal.notificationId) return;
    setNotifications(notifications.filter(n => n.id !== deleteModal.notificationId));
    setDeleteModal({ open: false, notificationId: null });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-10 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-slide-up">
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard/apps')}
            className="group inline-flex items-center gap-2 text-slate-400 hover:text-brand-blue font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-50 group-hover:text-brand-blue transition-colors">
                <ArrowLeft className="w-4 h-4" />
            </div>
            Voltar para Meus Apps
          </button>
          <h1 className="text-3xl font-black text-brand-blue tracking-tighter">Notificações Push</h1>
          <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
            Comunique-se instantaneamente com todos os usuários que instalaram seu app. Envie novidades, avisos e conteúdos importantes direto para a tela de bloqueio.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
          leftIcon={Bell}
        >
          Nova Notificação
        </Button>
      </div>

      {/* Histórico de Notificações */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <h2 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Histórico de Envios</h2>
        </div>
        
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-16 text-center shadow-sm">
            <Bell className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Nenhuma notificação enviada ainda.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-5xl">
            {notifications.map((notification, idx) => (
              <div key={notification.id} className="bg-white rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="p-6 flex flex-col md:flex-row md:items-start gap-6">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                    <Bell className="w-7 h-7 text-slate-400 group-hover:text-blue-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">{notification.title}</h3>
                    <p className="text-slate-600 font-medium text-sm mt-1 leading-relaxed">{notification.message}</p>
                    
                    {notification.link && (
                      <a 
                        href={notification.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-brand-blue text-[10px] font-black uppercase tracking-widest mt-4 hover:underline bg-blue-50 px-3 py-1 rounded-lg border border-blue-100"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Ver Link de Redirecionamento
                      </a>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                        <Clock className="w-4 h-4" />
                        Enviada em {formatDate(notification.sentAt)}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                        <Users className="w-4 h-4" />
                        {notification.devicesReached} dispositivos alcançados
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setDeleteModal({ open: true, notificationId: notification.id })}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Remover do histórico"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Nova Notificação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Nova Notificação</h3>
                <p className="text-sm text-slate-400 font-medium">Disparo em massa para todos os usuários</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Preview da Notificação - Visual Celular Style */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Preview em Tempo Real</label>
                <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border-4 border-slate-800">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 flex items-start gap-4 border border-white/10">
                        <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <svg className="w-6 h-6" viewBox="0 0 80 70" fill="none">
                              <path d="M20 25 L40 45 L20 65 L0 45 Z" fill="white"/>
                              <path d="M60 25 L80 45 L60 65 L40 45 Z" fill="white"/>
                              <path d="M40 5 L60 25 L40 45 L20 25 Z" fill="#FF6B6B"/>
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className="font-black text-white text-sm truncate">
                                    {title || 'Título da notificação'}
                                </p>
                                <span className="text-[9px] font-bold text-white/40 uppercase">Agora</span>
                            </div>
                            <p className="text-white/70 text-xs font-medium line-clamp-2 leading-relaxed">
                                {message || 'O conteúdo da sua mensagem aparecerá aqui para o usuário...'}
                            </p>
                        </div>
                    </div>
                </div>
              </div>

              {/* Título */}
              <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Título do Push</label>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                        title.length > 25 ? "text-orange-500 bg-orange-50" : "text-slate-400 bg-slate-50 dark:bg-slate-900"
                    )}>
                        {title.length}/30
                    </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 30))}
                  placeholder="Ex: Novo conteúdo disponível!"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                />
              </div>

              {/* Mensagem */}
              <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Corpo da Mensagem</label>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                        message.length > 70 ? "text-orange-500 bg-orange-50" : "text-slate-400 bg-slate-50 dark:bg-slate-900"
                    )}>
                        {message.length}/80
                    </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 80))}
                  placeholder="Descreva o motivo da notificação..."
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all resize-none"
                />
              </div>

              {/* Link de Redirecionamento */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Link de Ação (Opcional)</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300">
                        <LinkIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://seuapp.com/aula-extra"
                      className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl focus:border-brand-blue focus:ring-4 focus:ring-blue-500/5 focus:outline-none font-bold placeholder:font-medium transition-all"
                    />
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-3 leading-relaxed">
                    O usuário será levado para este endereço ao clicar na notificação.
                </p>
              </div>

              {/* Aviso de Envio Real */}
              <div className="p-5 rounded-[1.5rem] bg-blue-50 border border-blue-100 flex items-start gap-4">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-brand-blue">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Envio em tempo real</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                        Ao clicar em enviar, todos os dispositivos conectados receberão a notificação instantaneamente.
                    </p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4 sticky bottom-0">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendNotification}
                className="flex-1 py-4 h-auto font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
                leftIcon={Send}
              >
                Disparar Agora
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setDeleteModal({ open: false, notificationId: null })} 
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-slide-up overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">
              Remover do histórico?
            </h3>
            <p className="text-slate-500 text-center mb-10 font-medium leading-relaxed">
              Isso apagará o registro de envio desta lista. A notificação já disparada não será afetada nos dispositivos.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 transition-all active:scale-95"
              >
                Sim, excluir do histórico
              </button>
              <button
                onClick={() => setDeleteModal({ open: false, notificationId: null })}
                className="w-full py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
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

export default NotificationsPage;
