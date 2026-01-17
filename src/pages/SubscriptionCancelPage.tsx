import TribeBuildLogo from '../components/TribeBuildLogo';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';

const SubscriptionCancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Inter'] relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-100/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full animate-slide-up">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/5 p-10 text-center border border-white">
          {/* Logo */}
          <div className="flex items-center justify-center mb-10">
            <TribeBuildLogo size="lg" showText={true} />
          </div>

          {/* Ícone */}
          <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            Pagamento Interrompido
          </h1>

          {/* Descrição */}
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            O processo foi cancelado. Seus dados não foram cobrados. Você pode retomar a assinatura quando quiser.
          </p>

          {/* Botões */}
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/plans')} // CORREÇÃO: Manda para a seleção de planos pública
              className="w-full h-16 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
            >
              Escolher Plano Novamente
            </Button>
            <button
              onClick={() => navigate('/')}
              className="w-full h-16 inline-flex items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Início
            </button>
          </div>

          {/* Divider */}
          <div className="my-10 border-t border-slate-50" />

          {/* Suporte */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Teve algum problema?</span>
            <a
              href="https://wa.me/5561982199922"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue hover:underline"
            >
              Falar com Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancelPage;