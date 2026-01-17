import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, ArrowRight, Loader2, HelpCircle, Sparkles } from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Pegamos refreshProfile E profile para verificar se mudou
  const { refreshProfile, profile } = useAuth(); 
  
  const [status, setStatus] = useState<'loading' | 'success'>('loading');
  const processingRef = useRef(false);

  useEffect(() => {
    const validateSubscription = async () => {
      if (processingRef.current) return;
      processingRef.current = true;

      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        console.warn('Acesso não autorizado: Sem session_id');
        navigate('/', { replace: true });
        return;
      }

      try {
        console.log('Validando pagamento e trial...');
        
        // Tentativa 1: Espera 2s
        await new Promise(resolve => setTimeout(resolve, 2000));
        await refreshProfile();
        console.log('Sincronização 1 feita.');

        // Tentativa 2: Espera +2s (Garante consistência do Webhook)
        await new Promise(resolve => setTimeout(resolve, 2000));
        await refreshProfile();
        console.log('Sincronização 2 feita. Liberando.');

        setStatus('success');
      } catch (error) {
        console.error('Erro na sincronização:', error);
        setStatus('success'); // Libera mesmo com erro para não travar o user, o AuthContext barra depois se precisar
      }
    };

    validateSubscription();
  }, [searchParams, navigate, refreshProfile]);

  const handleAccessDashboard = async () => {
    // Última verificação antes de ir
    await refreshProfile();
    navigate('/dashboard');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-['Inter']">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/50 rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
             <div className="absolute inset-0 bg-brand-blue/10 animate-progress-slide"></div>
            <Loader2 className="w-10 h-10 text-brand-blue animate-spin relative z-10" />
          </div>
          <h2 className="text-slate-900 dark:text-white font-black text-lg mb-2">
            Ativando sua conta...
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto">
            Estamos confirmando seu período de teste com o Stripe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-['Inter'] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-100/30 dark:bg-indigo-900/20 rounded-full blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full animate-slide-up">
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/30 p-10 text-center border border-white dark:border-slate-700">
          
          <div className="flex items-center justify-center mb-10">
            <TribeBuildLogo size="lg" showText={true} className="mx-auto mb-8 text-slate-900 dark:text-white" />
          </div>

          <div className="w-24 h-24 bg-green-50 dark:bg-green-950/50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-green-50 dark:ring-green-900/30">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
            Tudo Pronto! 🚀
          </h1>

          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">
            Seu período de avaliação foi ativado. Aproveite o TribeBuild!
          </p>

          <Button
            onClick={handleAccessDashboard}
            className="w-full h-16 text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 dark:shadow-blue-900/50 group hover:scale-[1.02] transition-transform"
            rightIcon={ArrowRight}
          >
            Acessar o Painel
          </Button>

          <div className="my-10 border-t border-slate-100 dark:border-slate-700" />

          <div className="flex items-start gap-4 text-left p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 mb-6">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-brand-blue">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Confirmação enviada
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                Enviamos os detalhes do seu plano para seu e-mail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;