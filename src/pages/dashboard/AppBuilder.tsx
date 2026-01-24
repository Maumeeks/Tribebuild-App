import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Palette, Globe, ArrowLeft, Lock, Upload, X, Check, LayoutTemplate, Smartphone, KeyRound, Mail } from 'lucide-react';
import Button from '../../components/Button';
import MockupMobile from '../../components/MockupMobile';
import { useApps } from '../../contexts/AppsContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const AppBuilder: React.FC = () => {
  const { addApp, updateApp, apps, planLimit } = useApps();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editMode = searchParams.get('mode') === 'edit';
  const appIdToEdit = searchParams.get('appId');

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPlan = profile?.plan || 'starter';
  const maxApps = planLimit;
  const isLimitReached = !editMode && apps.length >= maxApps;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    primaryColor: '#0066FF',
    logo: null as string | null,
    language: 'PT',
    login_type: 'email_password' as 'email_password' | 'magic_link' // 'email_password' ou 'magic_link'
  });

  useEffect(() => {
    if (editMode && appIdToEdit) {
      const app = apps.find(a => a.id === appIdToEdit);
      if (app) {
        setFormData({
          name: app.name,
          slug: app.slug,
          description: app.description || '',
          primaryColor: app.primaryColor,
          logo: app.logo || null,
          language: app.language || 'PT',
          login_type: app.login_type || 'email_password'
        });
      }
    }
  }, [editMode, appIdToEdit, apps]);

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name.trim()) return alert("O nome do app é obrigatório.");
      if (!formData.slug.trim()) return alert("A URL personalizada (slug) é obrigatória.");

      const forbiddenSlugs = ['admin', 'login', 'dashboard', 'api', 'app'];
      if (forbiddenSlugs.includes(formData.slug.toLowerCase())) {
        return alert("Este slug é reservado pelo sistema. Escolha outro.");
      }
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateField = (field: string, value: string) => {
    if (field === 'slug') {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!editMode && isLimitReached) return alert(`Limite atingido.`);

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const appData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        logo: formData.logo,
        primaryColor: formData.primaryColor,
        language: formData.language,
        login_type: formData.login_type, // ✅ Salva o tipo de login
        status: 'published' as const
      };

      if (editMode && appIdToEdit) {
        await updateApp(appIdToEdit, appData);
      } else {
        await addApp({ ...appData, customDomain: null });
      }

      navigate('/dashboard/apps');
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.name) return alert('Defina um nome para salvar rascunho.');
    try {
      const appData = { ...formData, status: 'draft' as const };
      if (editMode && appIdToEdit) {
        await updateApp(appIdToEdit, appData);
      } else {
        await addApp({ ...appData, customDomain: null });
      }
      navigate('/dashboard/apps');
    } catch (error) {
      console.error("Erro rascunho:", error);
    }
  };

  const labelStyle = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";
  const inputStyle = "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all";

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-white dark:bg-slate-950 font-['inter'] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">

      {/* --- LEFT SIDE: EDITOR --- */}
      <div className="w-full lg:w-[500px] xl:w-[600px] flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 relative z-10">

        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard/apps')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {editMode ? "Editar App" : "Novo App"}
            </h2>
          </div>
          <button onClick={handleSaveDraft} className="text-xs font-bold text-slate-500 hover:text-brand-blue px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Salvar Rascunho
          </button>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div className="bg-brand-blue h-1 transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">

          {isLimitReached && (
            <div className="absolute inset-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/30">
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Limite Atingido</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">Seu plano <strong>{currentPlan}</strong> permite apenas {maxApps} apps.</p>
              <Button onClick={() => navigate('/dashboard/plans')} className="w-full max-w-xs text-xs font-bold uppercase">Fazer Upgrade</Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Informações Básicas</h3>
                  <p className="text-xs text-slate-500">Defina a identidade principal do seu projeto.</p>
                </div>
              </div>

              <div>
                <label className={labelStyle}>Nome do Aplicativo</label>
                <input type="text" autoFocus value={formData.name} onChange={(e) => updateField('name', e.target.value)} className={inputStyle} placeholder="Ex: Comunidade Expert" />
              </div>

              <div>
                <label className={labelStyle}>URL Personalizada (Slug)</label>
                <div className="flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-mono">
                    app.tribebuild.pro/
                  </span>
                  <input type="text" value={formData.slug} onChange={(e) => updateField('slug', e.target.value)} className={`${inputStyle} rounded-l-none`} placeholder="seu-app" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Use apenas letras minúsculas e hifens. Ex: ingles-do-joao</p>
              </div>

              {/* ✅ NOVO CAMPO: TIPO DE LOGIN */}
              <div>
                <label className={labelStyle}>Tipo de Acesso (Login)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => updateField('login_type', 'email_password')}
                    className={cn(
                      "cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-2",
                      formData.login_type === 'email_password'
                        ? "border-brand-blue bg-blue-50/50 dark:bg-blue-900/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-sm">
                        <KeyRound className="w-4 h-4" /> Completo
                      </div>
                      {formData.login_type === 'email_password' && <div className="w-4 h-4 bg-brand-blue rounded-full flex items-center justify-center text-white"><Check className="w-2.5 h-2.5" /></div>}
                    </div>
                    <p className="text-xs text-slate-500">O aluno entra com e-mail e senha cadastrada.</p>
                  </div>

                  <div
                    onClick={() => updateField('login_type', 'magic_link')}
                    className={cn(
                      "cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-2",
                      formData.login_type === 'magic_link'
                        ? "border-brand-blue bg-blue-50/50 dark:bg-blue-900/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-sm">
                        <Mail className="w-4 h-4" /> Facilitado
                      </div>
                      {formData.login_type === 'magic_link' && <div className="w-4 h-4 bg-brand-blue rounded-full flex items-center justify-center text-white"><Check className="w-2.5 h-2.5" /></div>}
                    </div>
                    <p className="text-xs text-slate-500">Apenas e-mail (Magic Link). Sem necessidade de senha.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelStyle}>Descrição</label>
                <textarea rows={4} value={formData.description} onChange={(e) => updateField('description', e.target.value)} className={inputStyle} placeholder="Descrição curta para SEO..."></textarea>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-slide-up">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Estilo & Marca</h3>
                  <p className="text-xs text-slate-500">Personalize as cores e logo.</p>
                </div>
              </div>

              <div>
                <label className={labelStyle}>Cor Principal</label>
                <div className="grid grid-cols-6 gap-3">
                  {['#0066FF', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#111827'].map(color => (
                    <button key={color} onClick={() => updateField('primaryColor', color)} className={cn("w-full aspect-square rounded-lg transition-all border-2", formData.primaryColor === color ? "border-slate-900 dark:border-white scale-110 shadow-md" : "border-transparent hover:scale-105")} style={{ backgroundColor: color }} />
                  ))}
                  <div className="relative w-full aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-slate-400 cursor-pointer overflow-hidden">
                    <input type="color" value={formData.primaryColor} onChange={(e) => updateField('primaryColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    <div className="w-full h-full" style={{ backgroundColor: formData.primaryColor }} />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelStyle}>Logotipo</label>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors group relative overflow-hidden">
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  {formData.logo ? (
                    <div className="relative z-10 text-center">
                      <img src={formData.logo} alt="Logo" className="h-20 object-contain mx-auto mb-4 drop-shadow-sm" />
                      <button onClick={(e) => { e.stopPropagation(); updateField('logo', ''); }} className="text-xs text-red-500 font-bold hover:underline flex items-center justify-center gap-1">
                        <X className="w-3 h-3" /> Remover
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Clique para enviar</p>
                      <p className="text-xs text-slate-400 mt-1">PNG ou JPG (Recomendado 512px)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Configurações Regionais</h3>
                  <p className="text-xs text-slate-500">Defina o idioma padrão.</p>
                </div>
              </div>

              <div className="space-y-3">
                {['Português (Brasil)', 'English', 'Español'].map(lang => {
                  const code = lang.substring(0, 2).toUpperCase();
                  const isSelected = formData.language === code;
                  return (
                    <div key={lang} onClick={() => updateField('language', code)} className={cn("flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all", isSelected ? "border-brand-blue bg-blue-50/50 dark:bg-blue-900/10 shadow-sm" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600")}>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{lang}</span>
                      {isSelected && <div className="w-5 h-5 bg-brand-blue rounded-full flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-slide-up">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tudo Pronto!</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs text-sm">Seu aplicativo está configurado.</p>

              <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-8 text-left border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Resumo</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nome:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">URL:</span>
                    <span className="font-medium text-slate-900 dark:text-white">app.tribebuild.pro/{formData.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Login:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formData.login_type === 'magic_link' ? 'Facilitado' : 'Completo'}
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={handlePublish} isLoading={isSubmitting} className="w-full py-4 text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-blue/20">
                {editMode ? "Salvar Alterações" : "Publicar Agora"}
              </Button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between bg-white dark:bg-slate-950">
          <Button variant="ghost" onClick={prevStep} disabled={step === 1} className="text-xs font-bold uppercase text-slate-500">Anterior</Button>
          <Button onClick={nextStep} disabled={step === 4} className="text-xs font-bold uppercase px-6">Próximo</Button>
        </div>
      </div>

      {/* --- RIGHT SIDE: PREVIEW --- */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 relative hidden lg:flex items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm mb-8 flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-blue" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Preview em Tempo Real</span>
          </div>
          <div className="transform scale-90 xl:scale-100 transition-all duration-500">
            <MockupMobile primaryColor={formData.primaryColor} appName={formData.name || 'Seu App'} logoUrl={formData.logo || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppBuilder;