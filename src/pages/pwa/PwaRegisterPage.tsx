
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Globe, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../../components/Button';

// Mock de dados do app (mesmo do PwaLoginPage)
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

export default function PwaRegisterPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Estados de foco
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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

  // Formatar telefone
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  // Validar senha
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Validar email
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validações
    if (!name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    if (!email.trim() || !isEmailValid) {
      setError('Informe um e-mail válido para contato.');
      return;
    }
    if (!phone.trim() || phone.length < 14) {
      setError('Informe um telefone válido.');
      return;
    }
    if (!isPasswordValid) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (!doPasswordsMatch) {
      setError('As senhas digitadas não coincidem.');
      return;
    }
    if (!acceptTerms) {
      setError('Você precisa aceitar os Termos e Políticas.');
      return;
    }

    setIsLoading(true);
    
    // Simular cadastro
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate(`/app/${appSlug}/login`);
      }, 2000);
    }, 1500);
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`Cadastro com ${provider}`);
    // Fluxo OAuth viria aqui
  };

  // Tela de sucesso
  if (success) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 "
        style={{ backgroundColor: `${appData.primaryColor}08` }}
      >
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-md w-full p-10 text-center animate-slide-up">
          <div 
            className="w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"
            style={{ backgroundColor: `${appData.primaryColor}15` }}
          >
            <CheckCircle2 className="w-12 h-12" style={{ color: appData.primaryColor }} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Conta Criada! 🎉</h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            Sua conta na área de membros do <strong>{appData.name}</strong> foi configurada. Redirecionando para o login...
          </p>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: appData.primaryColor }} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preparando Acesso</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 py-12  relative overflow-hidden"
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
        {/* Logo e Nome do App */}
        <div className="text-center mb-8">
          {appData.logo ? (
            <img 
              src={appData.logo} 
              alt={appData.name}
              className="w-20 h-20 rounded-3xl mx-auto mb-4 object-cover shadow-xl"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/10"
              style={{ backgroundColor: appData.primaryColor }}
            >
              {appData.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{appData.name}</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Crie sua Conta de Aluno</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-tight flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Nome */}
          <div className="relative group">
            <User 
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{ color: nameFocused ? appData.primaryColor : '#CBD5E1' }}
            />
            <input
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              className="w-full pl-14 pr-5 py-4 bg-slate-50 text-slate-800 border rounded-2xl focus:outline-none transition-all font-bold placeholder:font-medium text-sm"
              style={{ 
                borderColor: nameFocused ? appData.primaryColor : '#F1F5F9',
                boxShadow: nameFocused ? `0 0 0 4px ${appData.primaryColor}10` : 'none'
              }}
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail 
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{ color: emailFocused ? appData.primaryColor : '#CBD5E1' }}
            />
            <input
              type="email"
              placeholder="Seu melhor e-mail"
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

          {/* Telefone */}
          <div className="relative group">
            <Phone 
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{ color: phoneFocused ? appData.primaryColor : '#CBD5E1' }}
            />
            <input
              type="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={handlePhoneChange}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              maxLength={15}
              className="w-full pl-14 pr-5 py-4 bg-slate-50 text-slate-800 border rounded-2xl focus:outline-none transition-all font-bold placeholder:font-medium text-sm"
              style={{ 
                borderColor: phoneFocused ? appData.primaryColor : '#F1F5F9',
                boxShadow: phoneFocused ? `0 0 0 4px ${appData.primaryColor}10` : 'none'
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
              placeholder="Criar senha forte"
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

          {/* Indicador de força da senha */}
          {password.length > 0 && (
            <div className="flex items-center gap-3 px-1">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    password.length >= 6 ? "bg-green-500" : "bg-red-400"
                  )} 
                  style={{ width: password.length >= 6 ? '100%' : `${(password.length / 6) * 100}%` }}
                />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                password.length >= 6 ? "text-green-600" : "text-red-400"
              )}>
                {password.length >= 6 ? 'Senha Válida' : `${6 - password.length} caracteres rest.`}
              </span>
            </div>
          )}

          {/* Confirmar Senha */}
          <div className="relative group">
            <Lock 
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{ color: confirmPasswordFocused ? appData.primaryColor : '#CBD5E1' }}
            />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
              className="w-full pl-14 pr-14 py-4 bg-slate-50 text-slate-800 border rounded-2xl focus:outline-none transition-all font-bold placeholder:font-medium text-sm"
              style={{ 
                borderColor: confirmPasswordFocused ? appData.primaryColor : '#F1F5F9',
                boxShadow: confirmPasswordFocused ? `0 0 0 4px ${appData.primaryColor}10` : 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-1"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Indicador de match */}
          {confirmPassword.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              {doPasswordsMatch ? (
                <div className="flex items-center gap-2 text-green-600 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">As senhas coincidem</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Senhas diferentes</span>
                </div>
              )}
            </div>
          )}

          {/* Termos de uso */}
          <div className="flex items-start gap-3 py-2 px-1">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="sr-only"
              />
              <div 
                onClick={() => setAcceptTerms(!acceptTerms)}
                className="w-5 h-5 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-center"
                style={{ 
                  borderColor: acceptTerms ? appData.primaryColor : '#E2E8F0',
                  backgroundColor: acceptTerms ? appData.primaryColor : 'transparent'
                }}
              >
                {acceptTerms && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <label className="text-[10px] font-bold text-slate-500 leading-relaxed cursor-pointer" onClick={() => setAcceptTerms(!acceptTerms)}>
              Eu aceito os{' '}
              <a href="#" className="font-black hover:underline" style={{ color: appData.primaryColor }} onClick={(e) => e.stopPropagation()}>Termos de Uso</a>
              {' '}e as{' '}
              <a href="#" className="font-black hover:underline" style={{ color: appData.primaryColor }} onClick={(e) => e.stopPropagation()}>Políticas de Privacidade</a>.
            </label>
          </div>

          {/* Botão Criar Conta */}
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
                Criando Perfil...
              </>
            ) : (
              <>
                Criar Minha Conta
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Cadastro Social */}
        {appData.allowGoogle && (
          <>
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ou cadastrar com</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <button
              onClick={() => handleSocialRegister('Google')}
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
          </>
        )}

        {/* Link para login */}
        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-10 border-t border-slate-50 pt-8">
          Já é aluno?{' '}
          <Link 
            to={`/app/${appSlug}/login`}
            className="font-black hover:underline transition-colors"
            style={{ color: appData.primaryColor }}
          >
            Acesse sua conta
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
