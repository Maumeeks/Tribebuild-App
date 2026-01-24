import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PwaUpdatePasswordPage() {
    const { appSlug } = useParams<{ appSlug: string }>();
    const navigate = useNavigate();

    const [appData, setAppData] = useState<any>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Busca identidade visual
    useEffect(() => {
        const fetchApp = async () => {
            const { data } = await supabase.from('apps').select('*').eq('slug', appSlug).single();
            setAppData(data);
        };
        if (appSlug) fetchApp();
    }, [appSlug]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        setIsLoading(true);
        try {
            // O Supabase identifica o usuário pelo LINK do e-mail que ele clicou
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) throw error;
            setStatus('success');

            // Redireciona para o login após 2 segundos
            setTimeout(() => navigate(`/${appSlug}/login`), 2500);
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!appData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950 font-['inter']">

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-10" style={{ backgroundColor: appData.primary_color }} />
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 md:p-12 relative z-10">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-white tracking-tight">Nova Senha</h1>
                    <p className="text-slate-400 text-sm mt-2">Defina sua nova senha de acesso.</p>
                </div>

                {status === 'success' ? (
                    <div className="text-center animate-fade-in bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <h3 className="text-white font-bold">Senha Atualizada!</h3>
                        <p className="text-emerald-200/70 text-xs mt-1">Redirecionando para o login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nova senha segura"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-14 pr-14 py-4 bg-slate-950/50 text-white border border-slate-800 rounded-2xl focus:outline-none transition-all font-medium text-sm placeholder:text-slate-600 focus:border-blue-500"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 px-6 h-14 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300"
                            style={{ backgroundColor: appData.primary_color }}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Nova Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}