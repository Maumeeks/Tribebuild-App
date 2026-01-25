import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import ReactDOM from 'react-dom';
import { X, Upload, Loader2, HelpCircle, Link as LinkIcon, Copy, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useParams, useLocation } from 'react-router-dom';
import Button from '../Button';

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productToEdit?: any;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose, onSuccess, productToEdit }) => {
    const params = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados do Formulário
    const [name, setName] = useState('');

    // Configurações Husky
    const [releaseType, setReleaseType] = useState('immediate'); // immediate, days, date
    const [releaseValue, setReleaseValue] = useState('');

    const [offerType, setOfferType] = useState('main'); // main, bonus, order_bump, upsell

    const [platformId, setPlatformId] = useState('');
    const [checkoutUrl, setCheckoutUrl] = useState('');

    // Imagem
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    // Identificar App ID
    const getAppIdentifier = () => {
        if (params.appSlug) return params.appSlug;
        if (params.id) return params.id;
        const pathParts = location.pathname.split('/');
        const appsIndex = pathParts.indexOf('apps');
        if (appsIndex !== -1 && pathParts[appsIndex + 1]) return pathParts[appsIndex + 1];
        return null;
    };
    const appSlug = getAppIdentifier();
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Carregar dados na edição
    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setName(productToEdit.name);
                setReleaseType(productToEdit.release_type || 'immediate');
                setReleaseValue(productToEdit.release_value || '');
                setOfferType(productToEdit.offer_type || 'main');
                setPlatformId(productToEdit.platform_product_id || '');
                setCheckoutUrl(productToEdit.checkout_url || '');
                setCoverPreview(productToEdit.image_url || productToEdit.thumbnail_url || null);
            } else {
                // Reset
                setName('');
                setReleaseType('immediate');
                setReleaseValue('');
                setOfferType('main');
                setPlatformId('');
                setCheckoutUrl('');
                setCoverPreview(null);
                setCoverImage(null);
            }
        }
    }, [isOpen, productToEdit]);

    if (!isOpen) return null;

    const handleCoverSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) return alert('Nome é obrigatório');

        // Validações simples
        if (releaseType !== 'immediate' && !releaseValue) return alert('Defina o valor da liberação (dias ou data).');

        try {
            setLoading(true);

            // 1. Upload Imagem
            let finalCoverUrl = productToEdit?.image_url || null;
            if (coverImage) {
                const fileName = `covers/${Date.now()}_${coverImage.name}`;
                const { error, data } = await supabase.storage.from('product-thumbnails').upload(fileName, coverImage);
                if (!error && data) {
                    const { data: publicUrl } = supabase.storage.from('product-thumbnails').getPublicUrl(fileName);
                    finalCoverUrl = publicUrl.publicUrl;
                }
            }

            // 2. Preparar Payload
            const payload: any = {
                name,
                release_type: releaseType,
                release_value: releaseValue,
                offer_type: offerType,
                platform_product_id: platformId,
                checkout_url: checkoutUrl,
                image_url: finalCoverUrl,
                status: 'published' // Default
            };

            // 3. Salvar no Banco
            if (productToEdit) {
                const { error } = await supabase.from('products').update(payload).eq('id', productToEdit.id);
                if (error) throw error;
            } else {
                // Descobrir App ID se for novo
                let appId = null;
                if (appSlug) {
                    let query = supabase.from('apps').select('id');
                    if (isUUID(appSlug)) query = query.eq('id', appSlug);
                    else query = query.eq('slug', appSlug);
                    const { data } = await query.single();
                    if (data) appId = data.id;
                }
                if (!appId) throw new Error("App ID não encontrado.");

                payload.app_id = appId;
                const { error } = await supabase.from('products').insert([payload]);
                if (error) throw error;
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Renderizado via Portal (Igual ao CreateLessonModal)
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Container do Modal (Visual Husky/Lesson) */}
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-scale-in border border-slate-200 dark:border-slate-800 font-['inter']">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-xl shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {productToEdit ? 'Editar Produto' : 'Novo Produto'}
                        </h3>
                        <p className="text-sm text-slate-500">Preencha as informações do produto</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400 hover:text-slate-600" />
                    </button>
                </div>

                {/* Corpo com Scroll */}
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950/50">

                    {/* 1. Logo Centralizada (Husky Style) */}
                    <div className="flex flex-col items-center justify-center">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Logo do Produto</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-slate-900 hover:border-brand-blue transition-all group relative overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
                        >
                            {coverPreview ? (
                                <img src={coverPreview} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Upload</span>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleCoverSelect} />
                        </div>
                    </div>

                    {/* 2. Nome do Produto */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Nome do Produto *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-medium"
                            placeholder="Ex: Comunidade Premium"
                        />
                    </div>

                    {/* 3. Tipo de Liberação */}
                    <div>
                        <div className="flex items-center gap-1 mb-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Tipo de Liberação</label>
                            <HelpCircle size={12} className="text-slate-400 cursor-help" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <select
                                value={releaseType}
                                onChange={(e) => setReleaseType(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none cursor-pointer"
                            >
                                <option value="immediate">Liberação Imediata</option>
                                <option value="days">Dias após a Compra</option>
                                <option value="date">Data Exata</option>
                            </select>

                            {/* Inputs Condicionais de Liberação */}
                            {releaseType === 'days' && (
                                <input
                                    type="number"
                                    value={releaseValue}
                                    onChange={(e) => setReleaseValue(e.target.value)}
                                    placeholder="Ex: 7 (dias)"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none animate-fade-in"
                                />
                            )}
                            {releaseType === 'date' && (
                                <input
                                    type="date"
                                    value={releaseValue}
                                    onChange={(e) => setReleaseValue(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none animate-fade-in"
                                />
                            )}
                        </div>
                    </div>

                    {/* 4. Tipo de Oferta */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Tipo de Oferta *</label>
                        <select
                            value={offerType}
                            onChange={(e) => setOfferType(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none cursor-pointer"
                        >
                            <option value="main">Produto Principal (Acesso Padrão)</option>
                            <option value="bonus">Bônus (Gratuito/Incluso)</option>
                            <option value="order_bump">Order Bump (Oferta Adicional)</option>
                            <option value="upsell">Upsell / Downsell (Oferta Extra)</option>
                        </select>
                        <p className="text-[10px] text-slate-500 mt-2 ml-1">
                            {offerType === 'main' && "Aparece liberado na lista de cursos."}
                            {offerType === 'bonus' && "Liberado automaticamente como bônus."}
                            {(offerType === 'order_bump' || offerType === 'upsell') && "Aparece bloqueado ou como banner de oferta."}
                        </p>
                    </div>

                    {/* 5. Link de Checkout (Opcional - só para upsell) */}
                    {(offerType === 'order_bump' || offerType === 'upsell') && (
                        <div className="animate-slide-up">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Link de Checkout</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="url"
                                    value={checkoutUrl}
                                    onChange={(e) => setCheckoutUrl(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none"
                                    placeholder="https://pay.kiwify.com.br/..."
                                />
                            </div>
                        </div>
                    )}

                    {/* 6. IDs da Plataforma (Husky Style) */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">IDs na Plataforma</label>
                                <HelpCircle size={12} className="text-slate-400" />
                            </div>
                            <button className="text-[10px] font-bold text-brand-blue flex items-center gap-1 hover:underline">
                                <Copy size={10} /> Como obter o ID?
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={platformId}
                                onChange={(e) => setPlatformId(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none font-mono text-slate-600 dark:text-slate-400"
                                placeholder="Cole o ID do produto aqui"
                            />
                            {/* Botão visual de adicionar (pode ser funcional no futuro para multiplos IDs) */}
                            <button className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-lg">+</button>
                        </div>

                        {/* Aviso informativo igual ao Husky */}
                        <div className="mt-3 flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl">
                            <AlertCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                Este ID conecta o pagamento à liberação automática. Cole o ID que aparece na URL ou Webhook da sua plataforma (Kiwify, Hotmart, etc).
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                    <Button onClick={handleSubmit} isLoading={loading} className="px-8 py-3 text-xs font-bold uppercase shadow-lg shadow-brand-blue/20">
                        {productToEdit ? 'Salvar Alterações' : 'Criar Produto'}
                    </Button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default CreateProductModal;