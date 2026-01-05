
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, Palette, Globe, Smartphone, ArrowRight, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import Button from '../../components/Button';
import MockupMobile from '../../components/MockupMobile';
import { useApps } from '../../contexts/AppsContext';

const AppBuilder: React.FC = () => {
  const { addApp, apps } = useApps();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic limit check
  const maxApps = 1;
  const isLimitReached = apps.length >= maxApps;

  useEffect(() => {
    if (isLimitReached) {
      // We allow editing but if it's a "New App" flow, we might want to block
      // For simplicity in this demo, we'll show a persistent warning if they are trying to create a NEW one.
    }
  }, [isLimitReached]);

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

  const handlePublish = async () => {
    if (isLimitReached) {
      alert('Você atingiu o limite de apps do seu plano. Faça upgrade para criar mais apps.');
      navigate('/dashboard/apps');
      return;
    }

    if (!formData.name || !formData.slug) {
      alert('Por favor, preencha o nome e o slug do aplicativo.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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
  };

  const handleSaveDraft = () => {
    if (isLimitReached) {
      alert('Você atingiu o limite de apps do seu plano. Faça upgrade para criar mais apps.');
      navigate('/dashboard/apps');
      return;
    }

    if (!formData.name) {
      alert('Dê um nome ao seu rascunho pelo menos.');
      return;
    }

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
  };

  const inputClass = "w-full px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-xl focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none placeholder:text-slate-400 font-medium";

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)] font-['Inter']">
      {/* Editor Side */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Overlay block if limit reached and trying to create new */}
        {isLimitReached && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 p-10 max-w-md text-center animate-slide-up">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Limite Atingido</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Você atingiu o limite de apps do seu plano Basic (1 app). Faça upgrade para continuar criando novos projetos incríveis.
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

        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-black text-sm">
              {step}
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {step === 1 && "Informações Básicas"}
              {step === 2 && "Estilo & Cores"}
              {step === 3 && "Configurações de Idioma"}
              {step === 4 && "Revisão Final"}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSaveDraft} className="text-xs font-black uppercase tracking-widest">Rascunho</Button>
            <Button size="sm" onClick={handleSaveDraft} className="gap-2 text-xs font-black uppercase tracking-widest">
              <Save className="w-4 h-4" /> Salvar
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
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
                    <span className="text-slate-400 font-bold bg-slate-50 dark:bg-slate-900 px-3 py-3 rounded-xl border border-slate-100 dark:border-slate-700">tribebuild.app/</span>
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
                          className={`w-12 h-12 rounded-2xl border-4 transition-all ${formData.primaryColor === color ? 'border-blue-400 scale-110 shadow-lg' : 'border-white hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input 
                        type="color" 
                        value={formData.primaryColor}
                        onChange={(e) => updateField('primaryColor', e.target.value)}
                        className="w-12 h-12 rounded-2xl p-0 border-none outline-none cursor-pointer hover:scale-105 transition-transform"
                      />
                   </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Identidade Visual (Logo)</label>
                  <div className="border-4 border-dashed border-slate-100 rounded-[2rem] p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Smartphone className="w-8 h-8 text-slate-400 group-hover:text-primary" />
                    </div>
                    <p className="text-slate-900 dark:text-white font-black tracking-tight">Arraste sua logo aqui</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">PNG ou JPG (512x512px)</p>
                  </div>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="space-y-3 animate-fade-in">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Selecione o Idioma Padrão</label>
                {['Português (Brasil)', 'English', 'Español', 'Français'].map(lang => (
                  <label key={lang} className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.language === lang.substring(0,2).toUpperCase() ? 'border-primary bg-blue-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${formData.language === lang.substring(0,2).toUpperCase() ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                        <Globe className="w-5 h-5" />
                      </div>
                      <span className="font-black text-slate-900 dark:text-white tracking-tight">{lang}</span>
                    </div>
                    <input 
                      type="radio" 
                      name="lang" 
                      className="w-5 h-5 accent-primary" 
                      checked={formData.language === lang.substring(0,2).toUpperCase()}
                      onChange={() => updateField('language', lang.substring(0,2).toUpperCase())}
                    />
                  </label>
                ))}
             </div>
           )}

           {step === 4 && (
             <div className="text-center py-12 animate-fade-in">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Save className="w-10 h-10 stroke-[2.5px]" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Tudo pronto!</h3>
                <p className="text-slate-500 mb-10 font-medium max-w-sm mx-auto leading-relaxed">Seu aplicativo está configurado e pronto para ser entregue aos seus clientes.</p>
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

        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/10">
          <Button variant="ghost" onClick={prevStep} disabled={step === 1} className="gap-2 text-xs font-black uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Anterior
          </Button>
          <div className="flex gap-2">
             {[1,2,3,4].map(i => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'bg-primary w-10' : 'bg-slate-200 w-4'}`} />
             ))}
          </div>
          <Button onClick={nextStep} disabled={step === 4} className="gap-2 text-xs font-black uppercase tracking-widest">
             Próximo <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Side */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-slate-100/50 rounded-[3rem] border border-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-mesh opacity-[0.03]"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-3 relative z-10 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <Eye className="w-4 h-4 text-primary" /> Visualização em tempo real
        </p>
        <div className="relative z-10 scale-90 xl:scale-100">
            <MockupMobile 
            primaryColor={formData.primaryColor}
            appName={formData.name || 'Seu Aplicativo'}
            logoUrl={formData.logo || 'https://picsum.photos/seed/builderlogo/200/200'}
            />
        </div>
      </div>
    </div>
  );
};

export default AppBuilder;
