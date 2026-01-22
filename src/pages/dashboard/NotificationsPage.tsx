import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Send,
  X,
  Link as LinkIcon,
  Clock,
  Users,
  Trash2,
  AlertCircle,
  Plus
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
    <div className="space-y-8 font-['Outfit'] pb-20 animate-fade-in">

      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard/apps')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold uppercase tracking-wide mb-2 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Notificações Push</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Comunique-se diretamente com seus usuários.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm" leftIcon={Plus} className="text-xs font-bold uppercase tracking-wide">
          Nova Notificação
        </Button>
      </div>

      {/* Histórico de Notificações */}
      <div className="animate-slide-up">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhuma notificação enviada ainda.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {notifications.map((notification) => (
              <div key={notification.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
                <div className="p-5 flex flex-col md:flex-row md:items-start gap-5">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{notification.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{notification.message}</p>
                      </div>
                      <button
                        onClick={() => setDeleteModal({ open: true, notificationId: notification.id })}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remover do histórico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {notification.link && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-brand-blue font-medium bg-blue-50 dark:bg-blue-900/10 px-3 py-1.5 rounded w-fit">
                        <LinkIcon className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{notification.link}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Enviada em {formatDate(notification.sentAt)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {notification.devicesReached} dispositivos
                      </div>
                    </div>
                  </div>
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
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nova Notificação</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Preview da Notificação (Estilo iOS Moderno) */}
              <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-center">
                <div className="w-full max-w-sm bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/20 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-brand-blue rounded-md flex items-center justify-center shadow-sm">
                      <Bell className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">SEU APP</span>
                    <span className="text-[10px] text-slate-400 ml-auto">Agora</span>
                  </div>
                  <div className="px-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {title || 'Título da notificação'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {message || 'O conteúdo da sua mensagem aparecerá aqui...'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Título */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título</label>
                    <span className={cn("text-[10px] font-bold", title.length > 25 ? "text-orange-500" : "text-slate-400")}>
                      {title.length}/30
                    </span>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 30))}
                    placeholder="Ex: Novo conteúdo disponível!"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                  />
                </div>

                {/* Mensagem */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mensagem</label>
                    <span className={cn("text-[10px] font-bold", message.length > 70 ? "text-orange-500" : "text-slate-400")}>
                      {message.length}/80
                    </span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 80))}
                    placeholder="Descreva o motivo da notificação..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all resize-none"
                  />
                </div>

                {/* Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Link de Destino (Opcional)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Aviso */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg flex gap-3">
                <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  Esta notificação será enviada <strong>imediatamente</strong> para todos os usuários com o app instalado.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3 sticky bottom-0">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <Button onClick={handleSendNotification} className="flex-1 text-xs font-bold uppercase tracking-wide" leftIcon={Send}>
                Enviar Agora
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteModal({ open: false, notificationId: null })} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-slide-up border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Remover do Histórico?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Isso apagará o registro do painel, mas não remove a notificação dos celulares.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ open: false, notificationId: null })} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase transition-colors shadow-md">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;