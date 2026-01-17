
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Globe, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

// Mock de dados do app (em produção viria da API ou Contexto)
const mockAppData: Record<string, {
  name: string;
  logo: string | null;
  primaryColor: string;
  allowGoogle: boolean;
  allowFacebook: boolean;
}> = {
  'academia-fit': {
    name: 'Academia Fit',
    logo: null,
    primaryColor: '#2563EB',
    allowGoogle: true,
    allowFacebook: true
  },
  'curso-ingles': {
    name: 'Curso de Inglês Pro',
    logo: null,
    primaryColor: '#10B981',
    allowGoogle: true,
    allowFacebook: false
  },
  'mentoria-negocios': {
    name: 'Mentoria Negócios',
    logo: null,
    primaryColor: '#8B5CF6',
    allowGoogle: false,
    allowFacebook: false
  }
};

export default function PwaLoginPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados de foco para estilização dinâmica
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Buscar dados do app pelo slug
  const appData = appSlug ? mockAppData[appSlug] : null;

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

  // Gerar cor hover (escurecer 15%)
  const getHoverColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const darken = (c: number) => Math.max(0, Math.floor(c * 0.85));
    return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos para entrar.');
      return;
    }

    setIsLoading(true);
    
    // Simular login
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/app/${appSlug}/home`);
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Iniciando login com ${provider}`);
    // Fluxo OAuth viria aqui
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6  relative overflow-hidden"
      style={{ backgroundColor: `${appData.primaryColor}08` }}
    >
      {/* Background Blobs com cor do app */}
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
        {/* Logo e Nome do App */}
        <div className="text-center mb-10">
          {appData.logo ? (
            <img 
              src={appData.logo} 
              alt={appData.name}
              className="w-24 h-24 rounded-3xl mx-auto mb-6 object-cover shadow-xl"
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-[1.5rem] mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-blue-500/10"
              style={{ backgroundColor: appData.primaryColor }}
            >
              {appData.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{appData.name}</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Área de Membros Exclusiva</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-tight flex items-center gap-2 animate-fade-in">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {error}
            </div>
          )}

          {/* Email */}
          <div className="relative group">
            <Mail 
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{ color: emailFocused ? appData.primaryColor : '#CBD5E1' }}
            />
            <input
              type="email"
              placeholder="Seu e-mail de acesso"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="w-full pl-14 pr-5 py-4 bg-slate-50 text-slate-800 border rounded-2xl focus:outline-none transition-all font-bold placeholder:font-medium text-sm"
              style={{ 
                borderColor: emailFocused ? appData.primaryColor : '#F1F5F9',
                boxShadow: emailFocused ? `0 0 0 4px ${appData.primaryColor}10` : 'none'
              }}
            />
          </div>

          {/* Senha */}
          <div className="relative group">
            <Lock 
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{ color: passwordFocused ? appData.primaryColor : '#CBD5E1' }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full pl-14 pr-14 py-4 bg-slate-50 text-slate-800 border rounded-2xl focus:outline-none transition-all font-bold placeholder:font-medium text-sm"
              style={{ 
                borderColor: passwordFocused ? appData.primaryColor : '#F1F5F9',
                boxShadow: passwordFocused ? `0 0 0 4px ${appData.primaryColor}10` : 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Opções Auxiliares */}
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div 
                  className="w-5 h-5 border-2 rounded-lg transition-all flex items-center justify-center"
                  style={{ 
                    borderColor: rememberMe ? appData.primaryColor : '#E2E8F0',
                    backgroundColor: rememberMe ? appData.primaryColor : 'transparent'
                  }}
                >
                  {rememberMe && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lembrar de mim</span>
            </label>
            <Link 
              to={`/app/${appSlug}/forgot-password`}
              className="text-xs font-black uppercase tracking-widest transition-colors hover:opacity-80"
              style={{ color: appData.primaryColor }}
            >
              Esqueci a senha
            </Link>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4.5 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:transform-none mt-4"
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
                Acessando...
              </>
            ) : (
              <>
                Entrar na Área de Membros
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Social */}
        {(appData.allowGoogle || appData.allowFacebook) && (
          <>
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ou entrar com</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <div className="space-y-3">
              {appData.allowGoogle && (
                <button
                  onClick={() => handleSocialLogin('Google')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600 text-sm hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              )}

              {appData.allowFacebook && (
                <button
                  onClick={() => handleSocialLogin('Facebook')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1877F2] text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-600/10"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              )}
            </div>
          </>
        )}

        {/* Link para cadastro */}
        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-10 border-t border-slate-50 pt-8">
          Ainda não é aluno?{' '}
          <Link 
            to={`/app/${appSlug}/register`}
            className="font-black hover:underline transition-colors"
            style={{ color: appData.primaryColor }}
          >
            Cadastre-se aqui
          </Link>
        </p>
      </div>

      {/* Powered by */}
      <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
        <a 
          href="https://tribebuild.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] hover:text-slate-500 transition-colors"
        >
          Powered by <span className="text-slate-400">TribeBuild</span>
        </a>
      </div>
    </div>
  );
}
