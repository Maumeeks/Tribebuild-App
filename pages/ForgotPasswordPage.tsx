
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';
import { supabase } from '../lib/supabase';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Digite seu email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email inválido');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        setError('Erro ao enviar email. Tente novamente.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro ao enviar email. Tente novamente.');
    } finally {
      setIsLoading(false);
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
            /* Estado de Sucesso */
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">
                  Email enviado!
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Enviamos um link de recuperação para{' '}
                  <span className="font-bold text-slate-900 dark:text-white">{email}</span>
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-brand-blue/10 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-300 font-medium border border-blue-100 dark:border-brand-blue/20">
                <p>
                  Não recebeu o email? Verifique sua pasta de spam ou{' '}
                  <button 
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                    }}
                    className="font-bold underline hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    tente novamente
                  </button>
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-brand-blue hover:text-brand-coral font-bold transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Voltar para login
              </Link>
            </div>
          ) : (
            /* Formulário */
            <>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                  Esqueceu sua senha?
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Sem problemas! Digite seu email e enviaremos um link para você criar uma nova senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="Digite seu email"
                      className={`block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-800 ${
                        error 
                          ? 'border-red-300 dark:border-red-500/50 focus:border-red-500' 
                          : 'border-slate-200 dark:border-slate-700 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10'
                      }`}
                    />
                  </div>
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
                      Enviando...
                    </>
                  ) : (
                    'Enviar link de recuperação'
                  )}
                </button>

                {/* Voltar para Login */}
                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-blue font-bold transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Voltar para login
                  </Link>
                </div>

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

export default ForgotPasswordPage;
