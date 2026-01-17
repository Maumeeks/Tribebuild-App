import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  const benefits = [
    'Mais de 1.247 criadores ativos',
    'Crie seu app sem programar',
    'Seu app pronto em minutos',
    'Suporte dedicado em português',
  ];

  // Redireciona se já estiver logado
useEffect(() => {
  if (user && profile) {
    console.log('[Login] Usuário já logado, redirecionando...', { 
      email: user.email, 
      plan_status: profile.plan_status 
    });
    
    const from = location.state?.from?.pathname;
    
    if (from) {
      navigate(from, { replace: true });
    } else if (profile.plan_status === 'active') {
      navigate('/dashboard', { replace: true });
    } else {
      // Trial ou inactive -> vai para /plans (fora do dashboard)
      navigate('/plans', { replace: true });
    }
  }
}, [user, profile, navigate, location]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', general: '' };

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

      const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    console.log('[Login] Tentando login...', { email: formData.email });
    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    try {
      console.log('[Login] Chamando supabase.auth.signInWithPassword...');
      
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        console.error('[Login] ❌ Erro no login:', error);
        
        let errorMessage = 'Email ou senha incorretos.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Confirme seu email antes de fazer login.';
        } else {
          errorMessage = error.message;
        }
        
        setErrors(prev => ({ ...prev, general: errorMessage }));
        setIsLoading(false);
        return;
      }

      console.log('[Login] ✅ Login feito com sucesso! Aguardando redirecionamento...');
      setErrors(prev => ({ ...prev, general: 'Login feito! Redirecionando...' }));

    } catch (err: any) {
      console.error('[Login] Erro inesperado:', err);
      setErrors(prev => ({ 
        ...prev, 
        general: 'Problema ao conectar. Tente novamente em alguns segundos.' 
      }));
      } finally {
    setIsLoading(false);

    // Força redirecionamento se o useEffect não rodar rápido o suficiente
    setTimeout(() => {
      const currentUser = user; // captura o valor atual
      const currentProfile = profile;

      if (currentUser && currentProfile) {
        if (currentProfile.plan_status === 'active') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/plans', { replace: true });
        }
      }
    }, 3000); // 3 segundos de segurança
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden px-4 py-8">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-20 right-[10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-brand-coral/10 dark:bg-brand-coral/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Container Principal */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 w-full max-w-5xl">
        
        {/* Benefícios - Desktop */}
        <div className="hidden lg:block flex-1 max-w-md animate-fade-in">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl xl:text-5xl font-display font-extrabold text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                Transforme seus produtos digitais em{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-cyan-500 to-brand-coral">
                  experiências incríveis
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                Crie seu próprio aplicativo de membros em minutos, sem precisar programar.
              </p>
            </div>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 group-hover:bg-brand-blue/20 dark:group-hover:bg-brand-blue/30 flex items-center justify-center flex-shrink-0 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card de Login */}
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8 md:p-10 border border-white/60 dark:border-slate-700/60">
            
            {/* Logo */}
            <div className="text-center mb-10">
              <Link to="/" className="inline-block mb-6 group">
                <div className="group-hover:scale-105 transition-transform">
                  <TribeBuildLogo size="lg" showText={true} />
                </div>
              </Link>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Acesse sua conta</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Portal Administrativo</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Erro Geral */}
              {errors.general && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
                  {errors.general}
                </div>
              )}

              {/* Email */}
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Digite seu email"
                    disabled={isLoading}
                    className={`block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.email 
                        ? 'border-red-300 dark:border-red-500/50 focus:border-red-500' 
                        : 'border-slate-200 dark:border-slate-700 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-wider">{errors.email}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Digite sua senha"
                    disabled={isLoading}
                    className={`block w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.password 
                        ? 'border-red-300 dark:border-red-500/50 focus:border-red-500' 
                        : 'border-slate-200 dark:border-slate-700 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-brand-blue transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-wider">{errors.password}</p>
                )}
              </div>

              {/* Esqueci Senha */}
              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-brand-blue hover:text-brand-coral font-bold transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-6 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-display font-bold text-sm uppercase tracking-widest shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:shadow-brand-blue/30 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar Agora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>

              {/* Info e Links */}
              <div className="mt-8 text-center space-y-4">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                  Área restrita apenas para administradores
                </p>
                
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Não tem uma conta?</span>
                  <Link 
                    to="/register" 
                    className="text-brand-blue hover:text-brand-coral font-bold transition-colors"
                  >
                    Registre-se aqui
                  </Link>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Ao fazer login você concorda com os nossos{' '}
                  <Link to="/terms" className="text-brand-blue hover:text-brand-coral transition-colors">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link to="/privacy" className="text-brand-blue hover:text-brand-coral transition-colors">
                    Políticas de Privacidade
                  </Link>
                </p>
              </div>

            </form>
          </div>

          {/* Voltar para Home */}
          <div className="mt-8 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Voltar para o site
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;