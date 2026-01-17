import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';

const VerifyEmailPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden px-4 py-8">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-20 right-[10%] w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-brand-coral/10 dark:bg-brand-coral/20 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8 md:p-10 border border-white/60 dark:border-slate-700/60 text-center">
          
          {/* Logo */}
          <div className="mb-8">
            <Link to="/" className="inline-block">
              <TribeBuildLogo size="lg" showText={true} />
            </Link>
          </div>

          {/* Ícone de Email */}
          <div className="w-20 h-20 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-brand-blue" />
          </div>

          {/* Título */}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
            Verifique seu email
          </h1>

          {/* Descrição */}
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Enviamos um link de confirmação para o seu email. 
            <br />
            <strong className="text-slate-900 dark:text-white">Clique no link para ativar sua conta.</strong>
          </p>

          {/* Instruções */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Próximos passos:
            </h3>
            <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Abra sua caixa de entrada (verifique também o spam)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Clique no link "Confirmar email"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Faça login e escolha seu plano</span>
              </li>
            </ol>
          </div>

          {/* Botão Login */}
          <Link
            to="/login"
            className="w-full flex justify-center items-center py-4 px-6 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-display font-bold text-sm uppercase tracking-widest shadow-lg shadow-brand-blue/25 hover:shadow-xl hover:shadow-brand-blue/30 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all"
          >
            Já confirmei, fazer login
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>

          {/* Info adicional */}
          <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
            Não recebeu o email?{' '}
            <button className="text-brand-blue hover:text-brand-coral font-bold transition-colors">
              Reenviar email
            </button>
          </p>
        </div>

        {/* Voltar */}
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

export default VerifyEmailPage;