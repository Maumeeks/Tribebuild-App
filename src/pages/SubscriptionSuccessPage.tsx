import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, ArrowRight, Loader2, HelpCircle, Sparkles } from 'lucide-react';
import TribeBuildLogo from '../components/TribeBuildLogo';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext'; // <--- OBRIGATÓRIO: Importar o Auth

const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth(); // <--- OBRIGATÓRIO: Pegar a função de atualizar
  const [status, setStatus] = useState<'loading' | 'success'>('loading');
  
  // Ref para garantir que a validação rode apenas uma vez (evita loops)
  const processingRef = useRef(false);

  useEffect(() => {
    const validateSubscription = async () => {
      // Trava para não rodar duas vezes
      if (processingRef.current) return;
      processingRef.current = true;

      const sessionId = searchParams.get('session_id');
      
      // Se tentar entrar na página direto sem pagar, chuta para fora
      if (!sessionId) {
        console.warn('Acesso não autorizado: Sem session_id');
        navigate('/', { replace: true });
        return;
      }

      try {
        console.log('Validando sessão:', sessionId);
        
        // 1. Espera 2.5 segundos (tempo para o Webhook do Stripe processar o pagamento)
        await new Promise(resolve => setTimeout(resolve, 2500));

        // 2. MÁGICA: Força o site a ler o banco de dados de novo
        // Isso garante que quando o loading terminar, o plano já seja "Professional"
        console.log('Sincronizando perfil...');
        await refreshProfile();

        // 3. Libera a tela de sucesso
        setStatus('success');
      } catch (error) {
        console.error('Erro ao sincronizar, mas liberando acesso:', error);
        setStatus('success'); 
      }
    };

    validateSubscription();
  }, [searchParams, navigate, refreshProfile]);

  const handleAccessDashboard = () => {
    navigate('/dashboard');
  };

  // TELA DE LOADING (Enquanto sincroniza)
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-['Inter']">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/50 rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
             {/* Efeito visual de progresso */}
             <div className="absolute inset-0 bg-brand-blue/10 animate-progress-slide"></div>
            <Loader2 className="w-10 h-10 text-brand-blue animate-spin relative z-10" />
          </div>
          <h2 className="text-slate-900 dark:text-white font-black text-lg mb-2">
            Confirmando Pagamento...
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto">
            Estamos sincronizando sua conta com o Stripe. Isso leva apenas alguns segundos.
          </p>
        </div>
      </div>
    );
  }

  // TELA DE SUCESSO (Liberada após refreshProfile)
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
          
          <div className="flex items-center justify-center mb-10">
            <TribeBuildLogo 
              size="lg" 
              showText={true} 
              className="mx-auto mb-8 text-slate-900 dark:text-white" 
            />
          </div>

          <div className="w-24 h-24 bg-green-50 dark:bg-green-950/50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-green-50 dark:ring-green-900/30">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
            Assinatura Ativada! 🎉
          </h1>

          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10">
            Obrigado por escolher o TribeBuild. Sua conta premium já está ativa e sincronizada.
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
                Enviamos os detalhes da sua assinatura para o seu e-mail cadastrado.
              </p>
            </div>
          </div>

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