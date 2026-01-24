import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PwaForgotPasswordPage() {
  const { appSlug } = useParams<{ appSlug: string }>();
  const navigate = useNavigate();

  const [appData, setAppData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Busca identidade do App para manter o padrão visual
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const { data } = await supabase.from('apps').select('*').eq('slug', appSlug).single();
        setAppData(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (appSlug) fetchApp();
  }, [appSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // O Supabase envia o e-mail de recuperação
      // O 'redirectTo' aponta para a página onde ele vai digitar a nova senha
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + `/${appSlug}/update-password`,
      });

      if (error) throw error;
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Não foi possível enviar o e-mail. Verifique se o endereço está correto.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!appData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950 font-['inter']">

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-10" style={{ backgroundColor: appData.primary_color }} />
      </div>

      {/* Header com Voltar */}
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-black/50 max-w-md w-full p-8 md:p-12 animate-slide-up relative z-10">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-2xl font-black shadow-lg border-2 border-slate-800" style={{ backgroundColor: appData.primary_color }}>
            <Mail />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Recuperar Acesso</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Digite seu e-mail abaixo para receber as instruções de redefinição de senha.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center animate-fade-in">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-1">E-mail Enviado!</h3>
              <p className="text-emerald-200/70 text-xs">Verifique sua caixa de entrada (e spam) para continuar.</p>
            </div>
            <Link to={`/${appSlug}/login`} className="block w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors">
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold flex items-center gap-3">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <div className="relative group">
              <input
                type="email"
                placeholder="Seu e-mail cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-950/50 text-white border border-slate-800 rounded-2xl focus:outline-none transition-all font-medium text-sm placeholder:text-slate-600 focus:border-opacity-50"
                style={{ borderColor: status === 'idle' ? '#1e293b' : appData.primary_color }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 h-14 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden group"
              style={{ backgroundColor: appData.primary_color, boxShadow: `0 0 20px -5px ${appData.primary_color}40` }}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Link de Recuperação'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-10 text-center opacity-40">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Segurança TribeBuild</span>
      </div>
    </div>
  );
}