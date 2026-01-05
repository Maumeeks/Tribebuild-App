
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, CreditCard, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';
import { supabase } from '../lib/supabase';

const countries = [
  { code: 'BR', flag: '🇧🇷', ddi: '+55', name: 'Brasil' },
  { code: 'US', flag: '🇺🇸', ddi: '+1', name: 'Estados Unidos' },
  { code: 'PT', flag: '🇵🇹', ddi: '+351', name: 'Portugal' },
  { code: 'ES', flag: '🇪🇸', ddi: '+34', name: 'Espanha' },
  { code: 'FR', flag: '🇫🇷', ddi: '+33', name: 'França' },
  { code: 'IT', flag: '🇮🇹', ddi: '+39', name: 'Itália' },
  { code: 'DE', flag: '🇩🇪', ddi: '+49', name: 'Alemanha' },
  { code: 'UK', flag: '🇬🇧', ddi: '+44', name: 'Reino Unido' },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return value.slice(0, 14);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value.slice(0, 15);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', cpf: '', phone: '', password: '', confirmPassword: '', general: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    } else if (formData.name.trim().split(' ').length < 2) {
      newErrors.name = 'Digite seu nome completo';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
      isValid = false;
    } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF inválido';
      isValid = false;
    }

    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
      isValid = false;
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            cpf: formData.cpf.replace(/\D/g, ''),
            phone: `${selectedCountry.ddi}${formData.phone.replace(/\D/g, '')}`,
          },
        },
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login.';
        } else if (error.message.includes('invalid email')) {
          errorMessage = 'Email inválido.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
        }
        
        setErrors(prev => ({ ...prev, general: errorMessage }));
        setIsLoading(false);
        return;
      }

      if (data.user) {
        if (data.user.identities?.length === 0) {
          setErrors(prev => ({ 
            ...prev, 
            general: 'Este email já está cadastrado. Tente fazer login.' 
          }));
          setIsLoading(false);
          return;
        }

        navigate('/verify-email');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setErrors(prev => ({ 
        ...prev, 
        general: 'Erro ao criar conta. Tente novamente.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
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

      {/* Card de Registro */}
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8 md:p-10 border border-white/60 dark:border-slate-700/60">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4 group">
              <div className="group-hover:scale-105 transition-transform">
                <TribeBuildLogo size="lg" showText={true} />
              </div>
            </Link>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Crie sua conta administrativa</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Junte-se a +1.247 criadores de elite</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errors.general && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.general}
              </div>
            )}

            {/* Nome */}
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome completo"
                  className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none ${
                    errors.name 
                      ? 'border-red-300 dark:border-red-500/50 focus:border-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
                  }`}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs font-bold text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none ${
                    errors.email 
                      ? 'border-red-300 dark:border-red-500/50 focus:border-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
                  }`}
                />
              </div>
              <p className="mt-1 text-[10px] text-brand-coral font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Importante: O email não poderá ser alterado depois.
              </p>
              {errors.email && <p className="mt-1 text-xs font-bold text-red-500">{errors.email}</p>}
            </div>

            {/* CPF */}
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                </div>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="CPF"
                  maxLength={14}
                  className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none ${
                    errors.cpf 
                      ? 'border-red-300 dark:border-red-500/50 focus:border-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
                  }`}
                />
              </div>
              {errors.cpf && <p className="mt-1 text-xs font-bold text-red-500">{errors.cpf}</p>}
            </div>

            {/* Telefone */}
            <div>
              <div className="flex gap-2">
                <select
                  value={selectedCountry.code}
                  onChange={(e) => setSelectedCountry(countries.find(c => c.code === e.target.value) || countries[0])}
                  className="w-[100px] py-3.5 px-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white font-medium focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.ddi}
                    </option>
                  ))}
                </select>
                <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className={`block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none ${
                      errors.phone 
                        ? 'border-red-300 dark:border-red-500/50 focus:border-red-500' 
                        : 'border-slate-200 dark:border-slate-700 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
                    }`}
                  />
                </div>
              </div>
              {errors.phone && <p className="mt-1 text-xs font-bold text-red-500">{errors.phone}</p>}
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Senha"
                  className={`block w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none ${
                    errors.password 
                      ? 'border-red-300 dark:border-red-500/50 focus:border-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-brand-blue transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs font-bold text-red-500">{errors.password}</p>}
            </div>

            {/* Confirmar Senha */}
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-blue transition-colors" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmar senha"
                  className={`block w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none ${
                    errors.confirmPassword 
                      ? 'border-red-300 dark:border-red-500/50 focus:border-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-brand-blue transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs font-bold text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Termos */}
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Ao criar sua conta você concorda com os nossos{' '}
              <Link to="/terms" className="text-brand-blue hover:text-brand-coral transition-colors">Termos de Uso</Link>
              {' '}e{' '}
              <Link to="/privacy" className="text-brand-blue hover:text-brand-coral transition-colors">Políticas de Privacidade</Link>
            </p>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-6 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-display font-bold text-sm uppercase tracking-widest shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:shadow-brand-blue/30 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar minha conta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            {/* Link para Login */}
            <div className="text-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Já possui uma conta?</span>{' '}
              <Link to="/login" className="text-brand-blue hover:text-brand-coral font-bold transition-colors">
                Faça login
              </Link>
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
  );
};

export default RegisterPage;
