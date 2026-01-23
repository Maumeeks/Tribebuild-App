import React, { useState, useRef, ChangeEvent } from 'react';
import { X, Upload, Plus, HelpCircle, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useParams } from 'react-router-dom';
import Button from '../Button';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '../../lib/canvasUtils';
import { cn } from '../../lib/utils';

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Função auxiliar para centralizar o crop inicial
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { appSlug } = useParams<{ appSlug: string }>();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados do Formulário
    const [formData, setFormData] = useState({
        name: '',
        offerType: 'main' as 'main' | 'bonus' | 'order_bump' | 'upsell',
        releaseType: 'immediate' as 'immediate' | 'days_after' | 'exact_date',
        releaseDays: '',
        releaseDate: '',
        platformIds: [] as string[],
        salesPageUrl: '',
    });
    const [currentIdInput, setCurrentIdInput] = useState('');

    // Estados do Cropper de Imagem
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [showCropper, setShowCropper] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [finalImageFile, setFinalImageFile] = useState<File | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    if (!isOpen) return null;

    // --- Lógica de Imagem ---
    const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Reset crop
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setShowCropper(true);
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        // Centraliza o crop inicial com aspecto 1:1
        setCrop(centerAspectCrop(width, height, 1));
    };

    const handleConfirmCrop = async () => {
        // ✅ CORREÇÃO: Passando .src (string) para a função de crop
        if (imgRef.current && completedCrop) {
            try {
                const file = await getCroppedImg(imgRef.current.src, completedCrop);
                if (file) {
                    setFinalImageFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                    setShowCropper(false);
                }
            } catch (e) {
                console.error('Erro ao recortar imagem:', e);
            }
        }
    };

    // --- Lógica de IDs da Plataforma (Tags) ---
    const handleAddPlatformId = () => {
        if (currentIdInput.trim() && !formData.platformIds.includes(currentIdInput.trim())) {
            setFormData(prev => ({ ...prev, platformIds: [...prev.platformIds, currentIdInput.trim()] }));
            setCurrentIdInput('');
        }
    };

    const handleRemovePlatformId = (idToRemove: string) => {
        setFormData(prev => ({ ...prev, platformIds: prev.platformIds.filter(id => id !== idToRemove) }));
    };

    const handleKeyDownId = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddPlatformId();
        }
    };


    // --- Submissão ---
    const handleSubmit = async () => {
        if (!formData.name) return alert('O nome do produto é obrigatório');

        try {
            setLoading(true);

            // 1. Busca ID do App
            const { data: appData, error: appError } = await supabase
                .from('apps').select('id').eq('slug', appSlug).single();
            if (appError || !appData) throw new Error("App não encontrado.");

            // 2. Upload da Imagem (se houver)
            let thumbnailUrl = null;
            if (finalImageFile) {
                const fileExt = finalImageFile.name.split('.').pop();
                const fileName = `${appData.id}/${Date.now()}.${fileExt}`;

                // Tenta fazer upload
                const { error: uploadError } = await supabase.storage
                    .from('product-thumbnails')
                    .upload(fileName, finalImageFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('product-thumbnails')
                    .getPublicUrl(fileName);
                thumbnailUrl = publicUrlData.publicUrl;
            }

            // 3. Inserção no Banco
            const { error } = await supabase.from('products').insert([
                {
                    app_id: appData.id,
                    name: formData.name,
                    offer_type: formData.offerType,
                    release_type: formData.releaseType,
                    release_days: formData.releaseType === 'days_after' ? parseInt(formData.releaseDays) : null,
                    release_date: formData.releaseType === 'exact_date' ? formData.releaseDate : null,
                    platform_ids: formData.platformIds, // Array de strings
                    sales_page_url: formData.salesPageUrl,
                    thumbnail_url: thumbnailUrl,
                    is_active: true
                }
            ]);

            if (error) throw error;

            onSuccess();
            onClose();
            // Reset total
            setFormData({ name: '', offerType: 'main', releaseType: 'immediate', releaseDays: '', releaseDate: '', platformIds: [], salesPageUrl: '' });
            setPreviewUrl(null); setFinalImageFile(null); setImgSrc('');

        } catch (error: any) {
            console.error('Erro:', error);
            alert('Erro ao criar produto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            {/* Modal Principal - Compacto e Centralizado */}
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col animate-slide-up border border-slate-200 dark:border-slate-800">

                {/* Header Compacto */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Novo Produto</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Preencha as informações básicas</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Corpo com Scroll */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">

                        {/* Upload Compacto e Nome (Lado a Lado para economizar espaço vertical) */}
                        <div className="flex gap-5">
                            <div className="shrink-0">
                                <div className="flex items-center gap-1 mb-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logo</label>
                                </div>
                                {previewUrl ? (
                                    <div className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                        >
                                            <Upload size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setPreviewUrl(null); setFinalImageFile(null); setImgSrc(''); }}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-brand-blue hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                                    >
                                        <Upload size={20} />
                                        <span className="text-[10px] font-bold uppercase">Upload</span>
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} onChange={onSelectFile} accept="image/*" className="hidden" />
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Nome do Produto*</label>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all font-medium placeholder:text-slate-400"
                                        placeholder="Ex: Comunidade Premium"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Tipo de Oferta</label>
                                    </div>
                                    <select
                                        value={formData.offerType}
                                        onChange={(e) => setFormData({ ...formData, offerType: e.target.value as any })}
                                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none"
                                    >
                                        <option value="main">Principal</option>
                                        <option value="bonus">Bônus</option>
                                        <option value="order_bump">Order Bump</option>
                                        <option value="upsell">Upsell</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Liberação */}
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Regra de Liberação</label>
                            </div>
                            <div className="flex gap-3">
                                <select
                                    value={formData.releaseType}
                                    onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as any })}
                                    className="w-1/2 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none"
                                >
                                    <option value="immediate">Imediata</option>
                                    <option value="days_after">Dias após</option>
                                    <option value="exact_date">Data Fixa</option>
                                </select>

                                <div className="flex-1">
                                    {formData.releaseType === 'days_after' && (
                                        <input
                                            type="number"
                                            value={formData.releaseDays}
                                            onChange={(e) => setFormData({ ...formData, releaseDays: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm animate-fade-in focus:border-brand-blue outline-none"
                                            placeholder="Dias (ex: 7)"
                                        />
                                    )}
                                    {formData.releaseType === 'exact_date' && (
                                        <input
                                            type="date"
                                            value={formData.releaseDate}
                                            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm animate-fade-in focus:border-brand-blue outline-none"
                                        />
                                    )}
                                    {formData.releaseType === 'immediate' && (
                                        <div className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-sm text-slate-400 italic cursor-not-allowed">
                                            Acesso liberado na hora
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* IDs da Plataforma */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">IDs na Plataforma</label>
                                <a href="#" className="text-[10px] font-bold text-brand-blue hover:underline">Ajuda?</a>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 flex flex-wrap gap-2 focus-within:border-brand-blue focus-within:ring-1 focus-within:ring-brand-blue/20 transition-all">
                                {formData.platformIds.map((id) => (
                                    <span key={id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 animate-scale-in">
                                        {id}
                                        <button onClick={() => handleRemovePlatformId(id)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
                                    </span>
                                ))}

                                <div className="flex-1 flex items-center gap-2 min-w-[140px]">
                                    <input
                                        type="text"
                                        value={currentIdInput}
                                        onChange={(e) => setCurrentIdInput(e.target.value)}
                                        onKeyDown={handleKeyDownId}
                                        className="flex-1 bg-transparent border-none outline-none text-sm px-1 py-0.5 placeholder:text-slate-400"
                                        placeholder={formData.platformIds.length > 0 ? "" : "Cole o ID e tecle Enter"}
                                    />
                                    <button
                                        onClick={handleAddPlatformId}
                                        disabled={!currentIdInput.trim()}
                                        className={cn(
                                            "p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors",
                                            currentIdInput.trim() ? "text-brand-blue" : "text-slate-300"
                                        )}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Link de Vendas */}
                        {formData.offerType !== 'bonus' && (
                            <div className="animate-fade-in">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">Link de Checkout (Opcional)</label>
                                <input
                                    type="url"
                                    value={formData.salesPageUrl}
                                    onChange={(e) => setFormData({ ...formData, salesPageUrl: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none transition-all placeholder:text-slate-400"
                                    placeholder="https://..."
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        Cancelar
                    </button>
                    <Button onClick={handleSubmit} isLoading={loading} size="sm" className="px-6 font-bold shadow-lg shadow-brand-blue/20">
                        Criar Produto
                    </Button>
                </div>
            </div>

            {/* --- Modal Cropper (Camada Superior) --- */}
            {showCropper && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white">Ajustar Imagem</h3>
                            <button onClick={() => { setShowCropper(false); setImgSrc(''); }}><X size={20} className="text-slate-400" /></button>
                        </div>

                        <div className="p-6 bg-slate-900 flex flex-col items-center justify-center min-h-[300px]">
                            {!!imgSrc && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    className="rounded-lg shadow-2xl border-2 border-white/20 max-h-[50vh]"
                                >
                                    <img ref={imgRef} alt="Crop" src={imgSrc} onLoad={onImageLoad} style={{ maxWidth: '100%', maxHeight: '50vh' }} />
                                </ReactCrop>
                            )}
                            <p className="text-white/50 text-xs mt-4">Arraste para posicionar. A imagem será salva quadrada.</p>
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
                            <button onClick={() => { setShowCropper(false); setImgSrc(''); }} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 transition-colors">
                                Cancelar
                            </button>
                            <Button onClick={handleConfirmCrop} size="sm">Confirmar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateProductModal;