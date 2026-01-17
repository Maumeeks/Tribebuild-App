import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, Palette, Globe, Smartphone, ArrowRight, ArrowLeft, Lock, Upload, X } from 'lucide-react';
import Button from '../../components/Button';
import MockupMobile from '../../components/MockupMobile';
import { useApps } from '../../contexts/AppsContext';
import { useAuth } from '../../contexts/AuthContext'; 

const AppBuilder: React.FC = () => {
  const { addApp, apps, planLimit } = useApps(); // Agora pegamos o limite do contexto também
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Usamos o limite real vindo do Contexto para garantir sincronia
  const currentPlan = profile?.plan || 'starter';
  const maxApps = planLimit || 1; 
  const isLimitReached = apps.length >= maxApps;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    primaryColor: 'brand-blue',
    logo: null as string | null,
    language: 'PT'
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateField = (field: string, value: string) => {
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
    // Verificação visual (UX)
    if (isLimitReached) {
      alert(`Você atingiu o limite de ${maxApps} apps do seu plano ${currentPlan.toUpperCase()}. Faça upgrade para criar mais.`);
      navigate('/dashboard/apps');
      return;
    }

    if (!formData.name || !formData.slug) {
      alert('Por favor, preencha o nome e o slug do aplicativo.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Tenta adicionar. Se passar do limite, o Contexto vai dar erro e pular para o catch
        addApp({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          logo: formData.logo,
          primaryColor: formData.primaryColor,
          language: formData.language,
          customDomain: null,
          status: 'published'
        });

        setIsSubmitting(false);
        alert('Aplicativo publicado com sucesso!');
        navigate('/dashboard/apps');
    } catch (error) {
        // Se cair aqui, é porque o Contexto bloqueou
        console.error("Erro ao criar app:", error);
        setIsSubmitting(false);
        // O alert já foi exibido pelo Contexto
    }
  };

  const handleSaveDraft = () => {
    if (isLimitReached) {
      alert(`Você atingiu o limite de ${maxApps} apps do seu plano ${currentPlan.toUpperCase()}. Faça upgrade para criar mais.`);
      navigate('/dashboard/apps');
      return;
    }

    if (!formData.name) {
      alert('Dê um nome ao seu rascunho pelo menos.');
      return;
    }

    try {
        addApp({
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          logo: formData.logo,
          primaryColor: formData.primaryColor,
          language: formData.language,
          customDomain: null,
          status: 'draft'
        });

        alert('Rascunho salvo com sucesso!');
        navigate('/dashboard/apps');
    } catch (error) {
        console.error("Erro ao salvar rascunho:", error);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none placeholder:text-slate-400 font-medium";

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 h-[calc(100vh-100px)] lg:h-[calc(100vh-140px)] font-['Inter'] pb-20 lg:pb-0">
      {/* Editor Side */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Bloqueio Inteligente: Mostra o plano e limite reais */}
        {isLimitReached && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 p-10 max-w-md text-center animate-slide-up">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Limite Atingido</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Você atingiu o limite de apps do seu plano <span className="text-brand-blue font-bold uppercase">{currentPlan}</span> ({maxApps} apps). Faça upgrade para continuar criando novos projetos incríveis.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate('/dashboard/plans')}
                  className="w-full py-4 h-auto text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
                >
                  Fazer Upgrade Agora
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/dashboard/apps')}
                  className="w-full py-4 h-auto text-xs font-black uppercase tracking-widest"
                >
                  Voltar para Meus Apps
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-brand-blue flex items-center justify-center font-black text-sm">
              {step}
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {step === 1 && "Info. Básicas"}
              {step === 2 && "Estilo & Cores"}
              {step === 3 && "Idioma"}
              {step === 4 && "Revisão"}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSaveDraft} className="text-[10px] md:text-xs font-black uppercase tracking-widest hidden md:flex">Rascunho</Button>
            <Button size="sm" onClick={handleSaveDraft} className="gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest">
              <Save className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Salvar</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
           {/* CONTEÚDO DOS STEPS (MANTIDO EXATAMENTE COMO NO SEU ARQUIVO) */}
           {step === 1 && (
             <div className="space-y-6 animate-fade-in">
               <div>
                 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Aplicativo</label>
                 <input 
                   type="text" 
                   value={formData.name}
                   onChange={(e) => updateField('name', e.target.value)}
                   className={inputClass} 
                   placeholder="Ex: Expert Digital"
                 />
               </div>
               <div>
                 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Slug da URL</label>
                 <div className="flex items-center gap-2">
                   <span className="text-slate-400 font-bold bg-slate-50 dark:bg-slate-900 px-3 py-3 rounded-xl border border-slate-100 dark:border-slate-700 text-xs md:text-sm">tribebuild.app/</span>
                   <input 
                     type="text" 
                     value={formData.slug}
                     onChange={(e) => updateField('slug', e.target.value)}
                     className={inputClass} 
                     placeholder="seu-app"
                   />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição</label>
                 <textarea 
                   rows={4}
                   value={formData.description}
                   onChange={(e) => updateField('description', e.target.value)}
                   className={inputClass} 
                   placeholder="Conte um pouco sobre o seu app..."
                 ></textarea>
               </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-8 animate-fade-in">
                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Cor Primária</label>
                   <div className="flex flex-wrap gap-4">
                      {['brand-blue', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                        <button 
                          key={color}
                          onClick={() => updateField('primaryColor', color)}
                          className={`w-12 h-12 rounded-2xl border-4 transition-all ${formData.primaryColor === color ? 'border-blue-400 scale-110 shadow-lg' : 'border-slate-100 dark:border-slate-700 hover:scale-105'}`}
                          style={{ backgroundColor: color === 'brand-blue' ? '#0066FF' : color }}
                        />
                      ))}
                      <div className="relative">
                        <input 
                          type="color" 
                          value={formData.primaryColor === 'brand-blue' ? '#0066FF' : formData.primaryColor}
                          onChange={(e) => updateField('primaryColor', e.target.value)}
                          className="w-12 h-12 rounded-2xl p-0 border-none outline-none cursor-pointer hover:scale-105 transition-transform opacity-0 absolute inset-0"
                        />
                         <div className="w-12 h-12 rounded-2xl border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-900">
                           <Palette className="w-5 h-5 text-slate-400" />
                         </div>
                      </div>
                   </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Identidade Visual (Logo)</label>
                  
                  {/* Área de Upload Clicável */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-slate-100 dark:border-slate-700 rounded-[2rem] p-8 md:p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden" 
                    />

                    {formData.logo ? (
                      <div className="relative group/image">
                        <img src={formData.logo} alt="Logo Preview" className="w-32 h-32 object-contain rounded-xl shadow-lg" />
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                          <p className="text-white font-bold text-xs">Trocar Imagem</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-brand-blue" />
                        </div>
                        <p className="text-slate-900 dark:text-white font-black tracking-tight">Clique para enviar sua logo</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">PNG ou JPG (512x512px)</p>
                      </>
                    )}
                  </div>
                  {formData.logo && (
                    <button 
                      onClick={() => updateField('logo', '')}
                      className="mt-2 text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remover logo
                    </button>
                  )}
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="space-y-3 animate-fade-in">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Selecione o Idioma Padrão</label>
                {['Português (Brasil)', 'English', 'Español', 'Français'].map(lang => (
                  <label key={lang} className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.language === lang.substring(0,2).toUpperCase() 
                      ? 'border-brand-blue bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' 
                      : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${formData.language === lang.substring(0,2).toUpperCase() ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                        <Globe className="w-5 h-5" />
                      </div>
                      <span className="font-black text-slate-900 dark:text-white tracking-tight">{lang}</span>
                    </div>
                    <input 
                      type="radio" 
                      name="lang" 
                      className="w-5 h-5 accent-brand-blue" 
                      checked={formData.language === lang.substring(0,2).toUpperCase()}
                      onChange={() => updateField('language', lang.substring(0,2).toUpperCase())}
                    />
                  </label>
                ))}
             </div>
           )}

           {step === 4 && (
             <div className="text-center py-8 md:py-12 animate-fade-in">
                <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Save className="w-10 h-10 stroke-[2.5px]" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Tudo pronto!</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium max-w-sm mx-auto leading-relaxed">Seu aplicativo está configurado e pronto para ser entregue aos seus clientes.</p>
                <Button 
                  size="lg" 
                  className="w-full max-w-sm h-16 text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30"
                  onClick={handlePublish}
                  isLoading={isSubmitting}
                >
                   Publicar Meu Aplicativo
                </Button>
             </div>
           )}
        </div>

        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/10 dark:bg-slate-900/10">
          <Button variant="ghost" onClick={prevStep} disabled={step === 1} className="gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" /> Anterior
          </Button>
          <div className="flex gap-1 md:gap-2">
             {[1,2,3,4].map(i => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'bg-brand-blue w-6 md:w-10' : 'bg-slate-200 dark:bg-slate-700 w-2 md:w-4'}`} />
             ))}
          </div>
          <Button onClick={nextStep} disabled={step === 4} className="gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest">
             Próximo <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Side */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-slate-100/50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-200/50 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-mesh opacity-[0.03]"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-3 relative z-10 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
          <Eye className="w-4 h-4 text-brand-blue" /> Visualização em tempo real
        </p>
        <div className="relative z-10 scale-90 xl:scale-100">
            <MockupMobile 
            primaryColor={formData.primaryColor === 'brand-blue' ? '#0066FF' : formData.primaryColor}
            appName={formData.name || 'Seu Aplicativo'}
            logoUrl={formData.logo || 'https://picsum.photos/seed/builderlogo/200/200'}
            />
        </div>
      </div>
    </div>
  );
};

export default AppBuilder;