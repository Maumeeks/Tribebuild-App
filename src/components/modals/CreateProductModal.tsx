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

// Centraliza o crop inicial
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
    // Tenta pegar params da URL. Se falhar, usa window.location como fallback de segurança
    const params = useParams();
    const appSlug = params.appSlug || window.location.pathname.split('/')[3];

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
                const file = await getCroppedImg(imgRef.current, completedCrop); // Usa o elemento HTMLImageElement
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
        if (!formData.name) return alert('Nome do produto é obrigatório');

        try {
            setLoading(true);

            // 1. Busca Robusta do App (ID ou Slug)
            let appId = null;

            // Tenta achar por ID
            const { data: appById } = await supabase.from('apps').select('id').eq('id', appSlug).maybeSingle();
            if (appById) {
                appId = appById.id;
            } else {
                // Se falhar, tenta achar por Slug
                const { data: appBySlug } = await supabase.from('apps').select('id').eq('slug', appSlug).maybeSingle();
                if (appBySlug) appId = appBySlug.id;
            }

            if (!appId) throw new Error(`App não encontrado para o código: ${appSlug}`);

            // 2. Upload da Imagem
            let thumbnailUrl = null;
            if (finalImageFile) {
                const fileExt = finalImageFile.name.split('.').pop();
                const fileName = `${appId}/${Date.now()}.${fileExt}`;
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

            // 3. Criar Produto
            const { error } = await supabase.from('products').insert([
                {
                    app_id: appId,
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-scale-in border border-slate-200 dark:border-slate-800 max-h-[90vh]">

                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-slate-900 dark:text-white">Novo Produto</h3>
                    <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar space-y-5">
                    <div className="flex gap-4">
                        <div className="shrink-0">
                            {previewUrl ? (
                                <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white transition-opacity">
                                        <Upload size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-all">
                                    <Upload size={18} />
                                    <span className="text-[9px] font-bold uppercase mt-1">Logo</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={onSelectFile} accept="image/*" className="hidden" />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nome do Produto</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none font-medium"
                                placeholder="Ex: Comunidade Premium"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tipo de Oferta</label>
                            <select
                                value={formData.offerType}
                                onChange={(e) => setFormData({ ...formData, offerType: e.target.value as any })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:border-brand-blue outline-none"
                            >
                                <option value="main">Principal</option>
                                <option value="bonus">Bônus</option>
                                <option value="order_bump">Order Bump</option>
                                <option value="upsell">Upsell</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Liberação</label>
                            <select
                                value={formData.releaseType}
                                onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as any })}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:border-brand-blue outline-none"
                            >
                                <option value="immediate">Imediata</option>
                                <option value="days_after">Dias após</option>
                                <option value="exact_date">Data Fixa</option>
                            </select>
                        </div>
                    </div>

                    {formData.releaseType === 'days_after' && (
                        <div>
                            <input type="number" value={formData.releaseDays} onChange={(e) => setFormData({ ...formData, releaseDays: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm animate-fade-in" placeholder="Dias após compra" />
                        </div>
                    )}
                    {formData.releaseType === 'exact_date' && (
                        <div>
                            <input type="date" value={formData.releaseDate} onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm animate-fade-in" />
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IDs Externos</label>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 flex flex-wrap gap-1.5 min-h-[40px] items-center">
                            {formData.platformIds.map((id) => (
                                <span key={id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                    {id}
                                    <button onClick={() => handleRemovePlatformId(id)} className="hover:text-red-500"><X size={10} /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={currentIdInput}
                                onChange={(e) => setCurrentIdInput(e.target.value)}
                                onKeyDown={handleKeyDownId}
                                className="flex-1 bg-transparent border-none outline-none text-xs px-1 min-w-[80px]"
                                placeholder={formData.platformIds.length > 0 ? "" : "Cole o ID..."}
                            />
                            <button onClick={handleAddPlatformId} disabled={!currentIdInput.trim()} className="text-brand-blue disabled:opacity-30 p-1"><Plus size={14} /></button>
                        </div>
                    </div>

                    {formData.offerType !== 'bonus' && (
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Link Checkout (Opcional)</label>
                            <input type="url" value={formData.salesPageUrl} onChange={(e) => setFormData({ ...formData, salesPageUrl: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" placeholder="https://..." />
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 transition-all">Cancelar</button>
                    <Button onClick={handleSubmit} isLoading={loading} size="sm" className="px-5 text-xs font-bold shadow-md">Criar Produto</Button>
                </div>
            </div>

            {showCropper && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-slate-900 dark:text-white">Ajustar Imagem</h3>
                            <button onClick={() => { setShowCropper(false); setImgSrc(''); }}><X size={18} className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 bg-slate-900 flex-1 overflow-hidden flex items-center justify-center relative">
                            {!!imgSrc && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    className="max-h-full"
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop"
                                        src={imgSrc}
                                        onLoad={onImageLoad}
                                        style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }}
                                    />
                                </ReactCrop>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 shrink-0">
                            <button onClick={() => { setShowCropper(false); setImgSrc(''); }} className="px-4 py-2 border rounded-lg text-xs font-bold uppercase">Cancelar</button>
                            <Button onClick={handleConfirmCrop} size="sm">Confirmar Recorte</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateProductModal;