import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Camera,
  User,
  Mail,
  Phone,
  Lock,
  ChevronRight,
  Bell,
  Mail as MailIcon,
  LogOut,
  X,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Loader2
} from 'lucide-react';
import BottomNavigation from '../../components/pwa/BottomNavigation';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

// Tipos
interface AppData {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

interface ClientData {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  app_id: string;
}

export default function PwaProfilePage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  // Estados de carregamento
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);

  // Estados de edição
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Estados de notificações (localStorage)
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Estados dos modais
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Estados da senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // 1. Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, [appSlug]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Buscar app
      const { data: app, error: appError } = await supabase
        .from('apps')
        .select('*')
        .eq('slug', appSlug)
        .single();

      if (appError) throw new Error('App não encontrado');
      setAppData(app);

      // 2. Buscar sessão do cliente no localStorage
      const sessionKey = `@tribebuild:student:${appSlug}`;
      const sessionData = localStorage.getItem(sessionKey);

      if (!sessionData) {
        // Não está logado, redirecionar para login
        navigate(`/${appSlug}/login`);
        return;
      }

      const session = JSON.parse(sessionData);

      // 3. Buscar dados completos do cliente no banco
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('app_id', app.id)
        .eq('email', session.email)
        .single();

      if (clientError || !clientData) {
        // Sessão inválida, fazer logout
        localStorage.removeItem(sessionKey);
        navigate(`/${appSlug}/login`);
        return;
      }

      setClient(clientData);
      setEditName(clientData.full_name || '');
      setEditPhone(clientData.phone || '');

      // 4. Carregar preferências de notificações do localStorage
      const notifKey = `@tribebuild:notif:${clientData.id}`;
      const notifData = localStorage.getItem(notifKey);
      if (notifData) {
        const prefs = JSON.parse(notifData);
        setPushNotifications(prefs.push ?? true);
        setEmailNotifications(prefs.email ?? true);
      }

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      navigate(`/${appSlug}/login`);
    } finally {
      setLoading(false);
    }
  };

  // Formatar telefone
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Salvar edições
  const handleSaveEdit = async () => {
    if (!client || !appData) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('clients')
        .update({
          full_name: editName.trim(),
          phone: editPhone.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (error) throw error;

      // Atualizar estado local
      setClient({
        ...client,
        full_name: editName.trim(),
        phone: editPhone.trim() || null
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(client?.full_name || '');
    setEditPhone(client?.phone || '');
    setIsEditing(false);
  };

  // Alterar senha
  const handleChangePassword = async () => {
    if (!client) return;

    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Digite sua senha atual');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    try {
      setChangingPassword(true);

      // Atualizar senha no Supabase
      const { error } = await supabase
        .from('clients')
        .update({
          password_hash: newPassword, // Em produção, usar bcrypt!
          updated_at: new Date().toISOString()
        })
        .eq('id', client.id);

      if (error) throw error;

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      setPasswordError('Erro ao alterar senha. Tente novamente.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Salvar preferências de notificação
  const togglePushNotifications = () => {
    if (!client) return;
    const newValue = !pushNotifications;
    setPushNotifications(newValue);
    const notifKey = `@tribebuild:notif:${client.id}`;
    localStorage.setItem(notifKey, JSON.stringify({
      push: newValue,
      email: emailNotifications
    }));
  };

  const toggleEmailNotifications = () => {
    if (!client) return;
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    const notifKey = `@tribebuild:notif:${client.id}`;
    localStorage.setItem(notifKey, JSON.stringify({
      push: pushNotifications,
      email: newValue
    }));
  };

  // Logout
  const handleLogout = () => {
    if (!appSlug) return;
    const sessionKey = `@tribebuild:student:${appSlug}`;
    localStorage.removeItem(sessionKey);
    navigate(`/${appSlug}/login`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-slate-500 mx-auto" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
            Carregando perfil...
          </p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!appData || !client) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
            Sessão inválida
          </p>
          <button
            onClick={() => navigate(`/${appSlug}/login`)}
            className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Premium */}
      <header
        className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-lg"
        style={{
          backgroundColor: appData.primary_color,
          boxShadow: `0 4px 20px ${appData.primary_color}20`
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-base tracking-tight leading-none">Meu Perfil</h1>
            <p className="text-white/60 text-[8px] font-black uppercase tracking-widest mt-0.5">Gestão da Conta</p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="px-3 py-1.5 text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="px-5 py-1.5 bg-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              style={{ color: appData.primary_color }}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Salvar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-1.5 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/30 transition-all active:scale-95 border border-white/10"
          >
            Editar Perfil
          </button>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="p-6 space-y-8 animate-slide-up">

        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div
              className="w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl relative z-10 border-4 border-white"
              style={{
                backgroundColor: appData.primary_color,
                boxShadow: `0 20px 40px -10px ${appData.primary_color}40`
              }}
            >
              {client.avatar_url ? (
                <img
                  src={client.avatar_url}
                  alt={client.full_name}
                  className="w-full h-full object-cover rounded-[2.5rem]"
                />
              ) : (
                (client.full_name || client.email).charAt(0).toUpperCase()
              )}
            </div>

            <button
              onClick={() => alert('Upload de foto será implementado em breve!')}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white z-20 hover:scale-110 active:scale-90 transition-all"
            >
              <Camera size={18} />
            </button>
          </div>

          <div className="text-center mt-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {client.full_name || 'Sem nome'}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">
              {client.email}
            </p>
          </div>
        </div>

        {/* Informações Pessoais */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Informações Pessoais
            </h3>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            <div className="p-6 transition-all group">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Nome de Exibição
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-slate-900 font-bold bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 border border-slate-200 transition-all"
                  placeholder="Digite seu nome"
                />
              ) : (
                <p className="text-slate-800 font-bold text-sm tracking-tight">
                  {client.full_name || 'Não informado'}
                </p>
              )}
            </div>

            <div className="p-6 group relative">
              <div className="flex justify-between items-start">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1.5">
                    Email de Acesso
                  </label>
                  <p className="text-slate-400 font-bold text-sm tracking-tight">
                    {client.email}
                  </p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-slate-300">
                  <Lock size={14} />
                </div>
              </div>
              <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-2">
                O e-mail não pode ser alterado
              </p>
            </div>

            <div className="p-6">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                WhatsApp / Telefone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(formatPhone(e.target.value))}
                  maxLength={15}
                  className="w-full text-slate-900 font-bold bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 border border-slate-200 transition-all"
                  placeholder="(00) 00000-0000"
                />
              ) : (
                <p className="text-slate-800 font-bold text-sm tracking-tight">
                  {client.phone || 'Não informado'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Segurança da Conta
            </h3>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full bg-white rounded-[2rem] border border-slate-100 p-6 flex items-center justify-between group hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <span className="text-slate-800 font-black text-sm tracking-tight">
                Alterar minha senha
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Preferências */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Notificações & Avisos
            </h3>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div>
                  <span className="block text-slate-800 font-black text-sm tracking-tight">
                    Alertas Push
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                    Avisos no celular
                  </span>
                </div>
              </div>
              <button
                onClick={togglePushNotifications}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative p-1",
                  pushNotifications ? "bg-green-500" : "bg-slate-200"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full shadow-md transition-all",
                  pushNotifications ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                  <MailIcon size={20} />
                </div>
                <div>
                  <span className="block text-slate-800 font-black text-sm tracking-tight">
                    Resumos por E-mail
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                    Semanal e novidades
                  </span>
                </div>
              </div>
              <button
                onClick={toggleEmailNotifications}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative p-1",
                  emailNotifications ? "bg-green-500" : "bg-slate-200"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full shadow-md transition-all",
                  emailNotifications ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Botão Sair */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full p-6 bg-red-50 rounded-[2rem] border-2 border-red-100 flex items-center justify-center gap-4 text-red-600 font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-red-100 active:scale-95 shadow-sm shadow-red-500/5"
        >
          <LogOut size={20} />
          Encerrar Sessão
        </button>

        {/* Branding */}
        <div className="text-center py-8 opacity-20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Smartphone size={12} className="text-slate-400" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
              Powered by TribeBuild
            </p>
          </div>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">
            v1.0.0
          </p>
        </div>
      </main>

      {/* Modal: Alterar Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !changingPassword && setShowPasswordModal(false)}
          />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Nova Senha</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Proteção da sua conta
                </p>
              </div>
              <button
                onClick={() => !changingPassword && setShowPasswordModal(false)}
                disabled={changingPassword}
                className="p-2 text-slate-300 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {passwordSuccess ? (
                <div className="flex flex-col items-center py-8 animate-fade-in text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mb-6 text-green-500 shadow-inner">
                    <Check size={40} strokeWidth={3} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Senha alterada!</h4>
                  <p className="text-slate-500 text-sm font-medium">
                    Sua segurança foi atualizada com sucesso.
                  </p>
                </div>
              ) : (
                <>
                  {passwordError && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                      <AlertCircle size={16} />
                      {passwordError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                        Senha Atual
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          disabled={changingPassword}
                          className="w-full px-5 py-4 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none font-bold disabled:opacity-50"
                        />
                        <button
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                          type="button"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                        Nova Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          disabled={changingPassword}
                          className="w-full px-5 py-4 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none font-bold placeholder:font-medium disabled:opacity-50"
                        />
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                          type="button"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={changingPassword}
                        className="w-full px-5 py-4 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none font-bold disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="w-full py-5 text-white font-black uppercase tracking-[0.15em] text-xs rounded-[1.5rem] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: appData.primary_color,
                      boxShadow: `0 10px 25px ${appData.primary_color}30`
                    }}
                  >
                    {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirmar Alteração
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 text-center animate-slide-up">
            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-red-500 shadow-inner">
              <LogOut size={32} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Encerrar sessão?
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">
              Você precisará fazer login novamente para acessar seus conteúdos exclusivos.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-4 bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 transition-all"
              >
                Voltar ao App
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-4 bg-red-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
              >
                Sim, desejo sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation primaryColor={appData.primary_color} />
    </div>
  );
}