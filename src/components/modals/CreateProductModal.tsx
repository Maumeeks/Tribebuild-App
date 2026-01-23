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

    // Estados do Cropper
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
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setShowCropper(true);
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    };

    const handleConfirmCrop = async () => {
        if (imgRef.current && completedCrop) {
            try {
                const file = await getCroppedImg(imgRef.current.src, completedCrop);
                if (file) {
                    setFinalImageFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                    setShowCropper(false);
                }
            } catch (e) {
                console.error('Erro crop:', e);
            }
        }
    };

    // --- Lógica de IDs ---
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
        if (!formData.name) return alert('Nome obrigatório');

        try {
            setLoading(true);
            const { data: appData, error: appError } = await supabase
                .from('apps').select('id').eq('slug', appSlug).single();
            if (appError || !appData) throw new Error("App não encontrado.");

            let thumbnailUrl = null;
            if (finalImageFile) {
                const fileExt = finalImageFile.name.split('.').pop();
                const fileName = `${appData.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('product-thumbnails')
                    .upload(fileName, finalImageFile);

                if (!uploadError) {
                    const { data: publicUrlData } = supabase.storage
                        .from('product-thumbnails')
                        .getPublicUrl(fileName);
                    thumbnailUrl = publicUrlData.publicUrl;
                }
            }

            const { error } = await supabase.from('products').insert([
                {
                    app_id: appData.id,
                    name: formData.name,
                    offer_type: formData.offerType,
                    release_type: formData.releaseType,
                    release_days: formData.releaseType === 'days_after' ? parseInt(formData.releaseDays) : null,
                    release_date: formData.releaseType === 'exact_date' ? formData.releaseDate : null,
                    platform_ids: formData.platformIds,
                    sales_page_url: formData.salesPageUrl,
                    thumbnail_url: thumbnailUrl,
                    is_active: true
                }
            ]);

            if (error) throw error;
            onSuccess();
            onClose();
            setFormData({ name: '', offerType: 'main', releaseType: 'immediate', releaseDays: '', releaseDate: '', platformIds: [], salesPageUrl: '' });
            setPreviewUrl(null); setFinalImageFile(null); setImgSrc('');

        } catch (error: any) {
            alert('Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        // ✅ Z-INDEX MÁXIMO E CENTRALIZAÇÃO CORRIGIDA
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            {/* ✅ BORDAS MAIS SUAVES (rounded-xl) E LARGURA OTIMIZADA */}
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col animate-slide-up border border-slate-200 dark:border-slate-800">

                {/* Header Compacto */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Novo Produto</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scroll Apenas no Corpo do Formulário */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">

                        {/* Upload Compacto */}
                        <div className="flex items-center gap-6">
                            <div className="shrink-0">
                                {previewUrl ? (
                                    <div className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                        >
                                            <Upload size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all"
                                    >
                                        <Upload size={20} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase">Logo</span>
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} onChange={onSelectFile} accept="image/*" className="hidden" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Nome do Produto*</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none transition-all"
                                    placeholder="Ex: Comunidade Premium"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Grid de Opções */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Tipo de Oferta</label>
                                <select
                                    value={formData.offerType}
                                    onChange={(e) => setFormData({ ...formData, offerType: e.target.value as any })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none"
                                >
                                    <option value="main">Principal</option>
                                    <option value="bonus">Bônus</option>
                                    <option value="order_bump">Order Bump</option>
                                    <option value="upsell">Upsell</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Liberação</label>
                                <select
                                    value={formData.releaseType}
                                    onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as any })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none"
                                >
                                    <option value="immediate">Imediata</option>
                                    <option value="days_after">Dias após</option>
                                    <option value="exact_date">Data Fixa</option>
                                </select>
                            </div>
                        </div>

                        {/* Inputs Condicionais */}
                        {formData.releaseType === 'days_after' && (
                            <div className="animate-fade-in">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Dias após compra</label>
                                <input
                                    type="number"
                                    value={formData.releaseDays}
                                    onChange={(e) => setFormData({ ...formData, releaseDays: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                    placeholder="Ex: 7"
                                />
                            </div>
                        )}

                        {formData.releaseType === 'exact_date' && (
                            <div className="animate-fade-in">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Data de Liberação</label>
                                <input
                                    type="date"
                                    value={formData.releaseDate}
                                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                />
                            </div>
                        )}

                        {/* IDs da Plataforma */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">IDs da Plataforma</label>
                                <a href="#" className="text-[10px] font-bold text-brand-blue hover:underline">Onde encontrar?</a>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 flex flex-wrap gap-2 focus-within:border-brand-blue transition-colors">
                                {formData.platformIds.map((id) => (
                                    <span key={id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                        {id}
                                        <button onClick={() => handleRemovePlatformId(id)} className="hover:text-red-500"><X size={12} /></button>
                                    </span>
                                ))}
                                <div className="flex-1 flex items-center gap-2 min-w-[120px]">
                                    <input
                                        type="text"
                                        value={currentIdInput}
                                        onChange={(e) => setCurrentIdInput(e.target.value)}
                                        onKeyDown={handleKeyDownId}
                                        className="flex-1 bg-transparent border-none outline-none text-sm px-1 py-1"
                                        placeholder="Cole o ID e tecle Enter"
                                    />
                                    <button onClick={handleAddPlatformId} disabled={!currentIdInput.trim()} className="text-slate-400 hover:text-brand-blue disabled:opacity-50">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Link de Vendas (Opcional) */}
                        {formData.offerType !== 'bonus' && (
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Link de Checkout (Opcional)</label>
                                <input
                                    type="url"
                                    value={formData.salesPageUrl}
                                    onChange={(e) => setFormData({ ...formData, salesPageUrl: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold uppercase text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                        Cancelar
                    </button>
                    <Button onClick={handleSubmit} isLoading={loading} size="sm" className="px-6 font-bold shadow-lg shadow-brand-blue/20">
                        Criar Produto
                    </Button>
                </div>
            </div>

            {/* Modal Cropper (Z-Index ainda maior) */}
            {showCropper && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white">Ajustar Imagem</h3>
                            <button onClick={() => setShowCropper(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 bg-slate-900 flex justify-center">
                            {!!imgSrc && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    className="max-h-[50vh]"
                                >
                                    <img ref={imgRef} alt="Crop" src={imgSrc} onLoad={onImageLoad} style={{ maxWidth: '100%', maxHeight: '50vh' }} />
                                </ReactCrop>
                            )}
                        </div>
                        <div className="p-4 flex justify-end gap-3 bg-white dark:bg-slate-900">
                            <button onClick={() => setShowCropper(false)} className="px-4 py-2 border rounded-lg text-xs font-bold uppercase">Cancelar</button>
                            <Button onClick={handleConfirmCrop} size="sm">Confirmar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateProductModal;