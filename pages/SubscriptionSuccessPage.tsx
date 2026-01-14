import TribeBuildLogo from '../components/TribeBuildLogo';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, ArrowRight, Loader2, HelpCircle, Sparkles } from 'lucide-react';
import Button from '../components/Button';

const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Pega o ID da sessão que o Stripe manda
    const sessionId = searchParams.get('session_id');
    
    // 2. SEGURANÇA: Se não tiver ID (acesso manual direto), chuta para a Home
    if (!sessionId) {
      console.warn('Acesso não autorizado: Sem session_id');
      navigate('/', { replace: true });
      return;
    }

    console.log('Stripe Session ID:', sessionId);

    // Simula validação visual (o webhook real roda no backend)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  const handleAccessDashboard = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-['Inter']">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px]">
            Validando sua Assinatura...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-['Inter'] relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-100/30 dark:bg-indigo-900/20 rounded-full blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full animate-slide-up">
        {/* Card Principal */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/30 p-10 text-center border border-white dark:border-slate-700">
          {/* Logo */}
          <div className="flex items-center justify-center mb-10">
            <TribeBuildLogo 
              size="lg" 
              showText={true} 
              className="mx-auto mb-8 text-slate-900 dark:text-white" 
            />
          </div>

          {/* Ícone de Sucesso */}
          <div className="w-24 h-24 bg-green-50 dark:bg-green-950/50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
            Assinatura Ativada! 🎉
          </h1>

          {/* Descrição */}
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">
            Obrigado por escolher o TribeBuild. Sua conta premium já está ativa e você tem acesso total para criar seus aplicativos de elite.
          </p>

          {/* Botão Principal */}
          <Button
            onClick={handleAccessDashboard}
            className="w-full h-16 text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 dark:shadow-blue-900/50 group"
            rightIcon={ArrowRight}
          >
            Acessar o Painel
          </Button>

          {/* Divider */}
          <div className="my-10 border-t border-slate-100 dark:border-slate-700" />

          {/* Info Email */}
          <div className="flex items-start gap-4 text-left p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 mb-6">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-brand-blue">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Confirmação enviada
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                Enviamos os detalhes da sua assinatura para o seu e-mail cadastrado.
              </p>
            </div>
          </div>

          {/* Suporte */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Precisa de ajuda?</span>
            <a
              href="mailto:suporte@tribebuild.com"
              className="text-brand-blue hover:underline"
            >
              suporte@tribebuild.com
            </a>
          </div>
        </div>

        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 dark:text-blue-300" />
            Bem-vindo à família TribeBuild!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;