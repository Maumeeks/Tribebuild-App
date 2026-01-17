
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, RefreshCw, Lock, Sparkles, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

// Mock de dados do app (mesmo padrão dos blocos anteriores)
const mockAppData: Record<string, {
  name: string;
  logo: string | null;
  primaryColor: string;
}> = {
  'academia-fit': {
    name: 'Academia Fit',
    logo: null,
    primaryColor: '#2563EB'
  },
  'curso-ingles': {
    name: 'Curso de Inglês Pro',
    logo: null,
    primaryColor: '#10B981'
  },
  'mentoria-negocios': {
    name: 'Mentoria Negócios',
    logo: null,
    primaryColor: '#8B5CF6'
  }
};

export default function PwaForgotPasswordPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();
  
  // Estados
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Estado de foco
  const [emailFocused, setEmailFocused] = useState(false);

  // Buscar dados do app
  const appData = appSlug ? mockAppData[appSlug] : null;

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Se app não encontrado
  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 ">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-10 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">App não encontrado</h1>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">
            O endereço que você tentou acessar não está vinculado a nenhum aplicativo ativo no momento.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // Gerar cor hover
  const getHoverColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const darken = (c: number) => Math.max(0, Math.floor(c * 0.85));
    return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
  };

  // Validar email
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Enviar link
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Digite seu email de acesso');
      return;
    }
    
    if (!isEmailValid) {
      setError('O e-mail digitado parece inválido');
      return;
    }

    setIsLoading(true);
    
    // Simular envio
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setCountdown(60);
    }, 1500);
  };

  // Reenviar email
  const handleResend = () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setCountdown(60);
    }, 1000);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6  relative overflow-hidden"
      style={{ backgroundColor: `${appData.primaryColor}08` }}
    >
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div 
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-[100px] opacity-20"
          style={{ backgroundColor: appData.primaryColor }}
        />
        <div 
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-10"
          style={{ backgroundColor: appData.primaryColor }}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-900/5 max-w-md w-full p-8 md:p-10 animate-slide-up">
        {/* Logo Section */}
        <div className="text-center mb-10">
          {appData.logo ? (
            <img 
              src={appData.logo} 
              alt={appData.name}
              className="w-20 h-20 rounded-3xl mx-auto mb-6 object-cover shadow-xl"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/10"
              style={{ backgroundColor: appData.primaryColor }}
            >
              {appData.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-lg font-black text-slate-900 tracking-tight">{appData.name}</h2>
        </div>

        {success ? (
          /* TELA DE SUCESSO */
          <div className="text-center animate-fade-in">
            <div 
              className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"
              style={{ backgroundColor: `${appData.primaryColor}15` }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: appData.primaryColor }} />
            </div>

            <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">E-mail enviado!</h1>
            
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-1">
              Enviamos um link de recuperação para:
            </p>
            
            <p className="font-black text-slate-900 mb-6 truncate px-2">{email}</p>
            
            <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Verifique sua caixa de entrada e também a pasta de spam. O link expira em 1 hora.
                </p>
            </div>

            {/* Botão voltar */}
            <button
              onClick={() => navigate(`/app/${appSlug}/login`)}
              className="w-full py-4.5 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl transition-all active:scale-95 mb-6"
              style={{ 
                backgroundColor: appData.primaryColor,
                boxShadow: `0 10px 25px -5px ${appData.primaryColor}30`
              }}
            >
              Voltar para o login
            </button>

            {/* Reenviar logic */}
            <div className="pt-2">
              {countdown > 0 ? (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Não recebeu? Reenviar em <span style={{ color: appData.primaryColor }}>{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ color: appData.primaryColor }}
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  Reenviar link de acesso
                </button>
              )}
            </div>
          </div>
        ) : (
          /* FORMULÁRIO INICIAL */
          <>
            <div className="text-center mb-8">
              <div 
                className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${appData.primaryColor}10` }}
              >
                <Lock className="w-7 h-7" style={{ color: appData.primaryColor }} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Esqueceu sua senha?</h1>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Digite seu e-mail e enviaremos um link exclusivo para você criar uma nova senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Erro */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-tight animate-fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="relative group">
                <Mail 
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                  style={{ color: emailFocused ? appData.primaryColor : '#CBD5E1' }}
                />
                <input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="w-full pl-14 pr-5 py-4.5 bg-slate-50 text-slate-900 border rounded-2xl focus:outline-none transition-all font-bold placeholder:font-medium text-sm"
                  style={{ 
                    borderColor: emailFocused ? appData.primaryColor : '#F1F5F9',
                    boxShadow: emailFocused ? `0 0 0 4px ${appData.primaryColor}10` : 'none'
                  }}
                />
              </div>

              {/* Botão Enviar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-5 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:transform-none"
                style={{ 
                    backgroundColor: appData.primaryColor,
                    boxShadow: `0 10px 25px -5px ${appData.primaryColor}30`
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = getHoverColor(appData.primaryColor);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = appData.primaryColor;
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-50 pt-8">
              <Link 
                to={`/app/${appSlug}/login`}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:opacity-70"
                style={{ color: appData.primaryColor }}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Powered by */}
      <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
        <a 
          href="https://tribebuild.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-slate-500 transition-colors"
        >
          Powered by <span className="text-slate-400">TribeBuild</span>
        </a>
      </div>
    </div>
  );
}
