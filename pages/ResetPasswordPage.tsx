
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';
import { supabase } from '../lib/supabase';

const ResetPasswordPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    general: ''
  });

    useEffect(() => {
    const verifyToken = async () => {
      setIsVerifying(true);

      try {
        const hash = window.location.hash;
        if (!hash) throw new Error('Nenhum token na URL');

        // Remove o "#/reset-password" se existir
        const cleanHash = hash.startsWith('#/') ? hash.substring(hash.indexOf('#', 2)) : hash;
        const params = new URLSearchParams(cleanHash.substring(1));

        const accessToken = params.get('access_token');
        const type = params.get('type');

        if (!accessToken || type !== 'recovery') {
          throw new Error('Link inválido ou não é de recuperação de senha');
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get('refresh_token') || '',
        });

        if (error) throw error;

        setIsTokenValid(true);
      } catch (err: any) {
        setErrors(prev => ({ ...prev, general: err.message || 'Link inválido ou expirado' }));
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, []);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthLabel = () => {
    if (formData.password.length === 0) return { label: '', color: 'bg-slate-200 dark:bg-slate-700' };
    if (passwordStrength <= 1) return { label: 'Fraca', color: 'bg-red-500' };
    if (passwordStrength <= 2) return { label: 'Razoável', color: 'bg-yellow-500' };
    if (passwordStrength <= 3) return { label: 'Boa', color: 'bg-blue-500' };
    return { label: 'Forte', color: 'bg-green-500' };
  };

  const strengthInfo = getStrengthLabel();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { password: '', confirmPassword: '', general: '' };

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
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('Erro ao atualizar senha:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('should be different')) {
          errorMessage = 'A nova senha deve ser diferente da anterior.';
        } else if (error.message.includes('weak')) {
          errorMessage = 'Senha muito fraca. Use uma combinação mais forte.';
        }
        
        setErrors(prev => ({ ...prev, general: errorMessage }));
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      await supabase.auth.signOut();
      
    } catch (err) {
      console.error('Erro inesperado:', err);
      setErrors(prev => ({ 
        ...prev, 
        general: 'Erro ao atualizar senha. Tente novamente.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Loading
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Verificando link...</p>
        </div>
      </div>
    );
  }

  // Token inválido
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden px-4 py-8">
        
        {/* Background Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-20 right-[10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-brand-coral/10 dark:bg-brand-coral/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full max-w-md relative z-10 animate-slide-up">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8 md:p-10 border border-white/60 dark:border-slate-700/60 text-center">
            
            <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
            </div>
            
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">
              Link inválido ou expirado
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
              Este link de recuperação não é válido ou já expirou. Por favor, solicite um novo link.
            </p>

            <Link
              to="/forgot-password"
              className="w-full flex justify-center items-center py-4 px-6 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-display font-bold text-sm uppercase tracking-widest shadow-lg shadow-brand-blue/25 hover:shadow-xl transition-all"
            >
              Solicitar novo link
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>

            <div className="mt-6">
              <Link
                to="/login"
                className="text-slate-500 dark:text-slate-400 hover:text-brand-blue font-medium transition-colors"
              >
                ← Voltar para login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden px-4 py-8">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-20 right-[10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-brand-coral/10 dark:bg-brand-coral/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Card */}
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8 md:p-10 border border-white/60 dark:border-slate-700/60">
          
          {/* Logo */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-block mb-6 group">
              <div className="group-hover:scale-105 transition-transform">
                <TribeBuildLogo size="lg" showText={true} />
              </div>
            </Link>
          </div>

          {isSuccess ? (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">
                  Senha alterada!
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Sua senha foi atualizada com sucesso. Você já pode fazer login com a nova senha.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full flex justify-center items-center py-4 px-6 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-display font-bold text-sm uppercase tracking-widest shadow-lg shadow-brand-blue/25 hover:shadow-xl transition-all"
              >
                Ir para login
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                  Criar nova senha
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Digite sua nova senha abaixo
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {errors.general && (
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {errors.general}
                  </div>
                )}

                {/* Nova Senha */}
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
                      placeholder="Nova senha"
                      className={`block w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 ${
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
                  
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength ? strengthInfo.color : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Força: <span className={passwordStrength > 2 ? 'text-green-500' : passwordStrength > 1 ? 'text-yellow-500' : 'text-red-500'}>{strengthInfo.label}</span>
                      </p>
                    </div>
                  )}
                  
                  {errors.password && <p className="mt-2 text-xs font-bold text-red-500">{errors.password}</p>}
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
                      placeholder="Confirmar nova senha"
                      className={`block w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 ${
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
                  
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="mt-2 text-xs font-bold text-green-500 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      As senhas coincidem
                    </p>
                  )}
                  
                  {errors.confirmPassword && <p className="mt-2 text-xs font-bold text-red-500">{errors.confirmPassword}</p>}
                </div>

                {/* Dicas */}
                <div className="bg-blue-50 dark:bg-brand-blue/10 rounded-2xl p-4 text-xs text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-brand-blue/20">
                  <p className="font-bold mb-2 uppercase tracking-wider text-[10px]">Sugestões de Segurança:</p>
                  <ul className="space-y-1 opacity-80">
                    <li>• No mínimo 6 caracteres</li>
                    <li>• Misture letras maiúsculas e minúsculas</li>
                    <li>• Inclua pelo menos um número ou símbolo</li>
                  </ul>
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
                      Redefinindo...
                    </>
                  ) : (
                    <>
                      Redefinir senha
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>

              </form>
            </>
          )}

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

export default ResetPasswordPage;
