import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, ArrowRight, Loader2 } from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';
import Button from '../components/Button';

const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success'>('loading');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      navigate('/', { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setStatus('success');
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  const handleAccessDashboard = () => {
    window.location.href = '/dashboard';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
          </div>
          <h2 className="text-slate-900 dark:text-white font-black text-lg mb-2">
            Ativando sua conta...
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Aguarde enquanto confirmamos seu pagamento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 text-center border border-slate-100 dark:border-slate-700">
          
          <div className="flex items-center justify-center mb-10">
            <TribeBuildLogo size="lg" showText={true} />
          </div>

          <div className="w-24 h-24 bg-green-50 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
            Tudo Pronto!
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mb-10">
            Seu periodo de avaliacao foi ativado. Aproveite o TribeBuild!
          </p>

          <Button
            onClick={handleAccessDashboard}
            className="w-full h-16 text-sm font-black uppercase tracking-widest"
            rightIcon={ArrowRight}
          >
            Acessar o Painel
          </Button>

          <div className="my-10 border-t border-slate-100 dark:border-slate-700" />

          <div className="flex items-start gap-4 text-left p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-brand-blue">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Confirmacao enviada
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Enviamos os detalhes para seu e-mail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;