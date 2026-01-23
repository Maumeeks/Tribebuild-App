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
        setCrop(centerAspectCrop(width, height, 1 / 1)); // Força aspecto 1:1 (quadrado)
    };

    const handleConfirmCrop = async () => {
        // ✅ CORREÇÃO AQUI: Passamos .src (string) em vez do elemento
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

                // Verifica/Cria bucket se necessário (idealmente criado via SQL, mas aqui tentamos upload direto)
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full my-8 animate-slide-up border border-slate-200 dark:border-slate-800">

                {/* Header estilo Husky */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Novo Produto</h3>
                        <p className="text-sm text-slate-500 mt-1">Preencha as informações do novo produto</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-8 space-y-8">

                    {/* --- Área de Upload de Imagem --- */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Logo do Produto</label>
                            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Clique no ícone abaixo para fazer upload da logo do produto (será recortada em 400x400)</p>

                        <div className="flex justify-center">
                            {previewUrl ? (
                                <div className="relative group w-40 h-40 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                    >
                                        <Upload className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => { setPreviewUrl(null); setFinalImageFile(null); setImgSrc(''); }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-40 h-40 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-brand-blue hover:border-brand-blue hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                                >
                                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 group-hover:border-brand-blue/30 group-hover:shadow-md transition-all">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider">Upload Imagem</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={onSelectFile} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    {/* --- Campos do Formulário --- */}
                    <div className="space-y-6">
                        {/* Nome */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Nome do Produto*</label>
                                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                            </div>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none font-medium"
                                placeholder="Digite o nome do produto"
                            />
                        </div>

                        {/* Tipo de Liberação (Dinâmico) */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Tipo de Liberação*</label>
                                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                            </div>
                            <select
                                value={formData.releaseType}
                                onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as any })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none appearance-none font-medium"
                            >
                                <option value="immediate">Liberação Imediata</option>
                                <option value="days_after">Dias após a Compra</option>
                                <option value="exact_date">Data Exata</option>
                            </select>

                            {/* Campos Condicionais */}
                            {formData.releaseType === 'days_after' && (
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.releaseDays}
                                    onChange={(e) => setFormData({ ...formData, releaseDays: e.target.value })}
                                    className="mt-3 w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none animate-fade-in"
                                    placeholder="Número de dias após a compra (ex: 7)"
                                />
                            )}
                            {formData.releaseType === 'exact_date' && (
                                <input
                                    type="date"
                                    value={formData.releaseDate}
                                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                    className="mt-3 w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none animate-fade-in"
                                />
                            )}
                        </div>

                        {/* Tipo de Oferta */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Tipo de Oferta*</label>
                                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                            </div>
                            <select
                                value={formData.offerType}
                                onChange={(e) => setFormData({ ...formData, offerType: e.target.value as any })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none appearance-none font-medium"
                            >
                                <option value="main">Produto Principal</option>
                                <option value="bonus">Bônus</option>
                                <option value="order_bump">Order Bump</option>
                                <option value="upsell">Upsell/Downsell</option>
                            </select>
                        </div>

                        {/* IDs da Plataforma (Tag Input) */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">IDs do Produto na Plataforma*</label>
                                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                                <span className="text-xs text-brand-blue hover:underline cursor-pointer ml-auto">Como obter o ID?</span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 flex flex-wrap gap-2 items-center focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/10 transition-all">
                                {/* Tags Existentes */}
                                {formData.platformIds.map((id) => (
                                    <div key={id} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 animate-fade-in">
                                        {id}
                                        <button onClick={() => handleRemovePlatformId(id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* Input e Botão de Adicionar */}
                                <div className="flex-1 flex items-center min-w-[200px]">
                                    <input
                                        type="text"
                                        value={currentIdInput}
                                        onChange={(e) => setCurrentIdInput(e.target.value)}
                                        onKeyDown={handleKeyDownId}
                                        className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-1.5"
                                        placeholder={formData.platformIds.length > 0 ? "" : "Digite o ID do produto na plataforma"}
                                    />
                                    <button
                                        onClick={handleAddPlatformId}
                                        disabled={!currentIdInput.trim()}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors flex-shrink-0",
                                            currentIdInput.trim() ? "text-brand-blue hover:bg-blue-100 dark:hover:bg-blue-900/30" : "text-slate-300 cursor-not-allowed"
                                        )}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {formData.offerType !== 'bonus' && (
                                <div className="mt-4 animate-fade-in">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Link da Página de Vendas (Opcional)</label>
                                    <input
                                        type="url"
                                        value={formData.salesPageUrl}
                                        onChange={(e) => setFormData({ ...formData, salesPageUrl: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer com Botões de Ação */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 sticky bottom-0 backdrop-blur-md rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        Cancelar
                    </button>
                    <Button onClick={handleSubmit} isLoading={loading} className="px-8 py-3 text-sm font-bold shadow-lg shadow-blue-500/20">
                        Criar Produto
                    </Button>
                </div>
            </div>

            {/* --- Modal Secundário: Recorte de Imagem --- */}
            {showCropper && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recortar Imagem</h3>
                            <button onClick={() => { setShowCropper(false); setImgSrc(''); }}><X className="w-6 h-6 text-slate-400" /></button>
                        </div>

                        <div className="p-8 flex flex-col items-center bg-slate-100 dark:bg-slate-950">
                            <p className="text-slate-500 mb-6 font-medium">Arraste para ajustar a área. A imagem final será um quadrado (1:1).</p>
                            {!!imgSrc && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1} // Força quadrado 1:1
                                    className="rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 max-h-[60vh]"
                                >
                                    <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} className="max-w-full" />
                                </ReactCrop>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900">
                            <button onClick={() => { setShowCropper(false); setImgSrc(''); }} className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                                Cancelar
                            </button>
                            <Button onClick={handleConfirmCrop} className="px-8 py-3 text-sm font-bold">
                                Confirmar Recorte
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateProductModal;