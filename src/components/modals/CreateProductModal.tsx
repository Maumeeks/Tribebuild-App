import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useParams, useLocation } from 'react-router-dom';
import Button from '../Button';

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productToEdit?: any; // ✅ Agora aceita edição
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose, onSuccess, productToEdit }) => {
    const params = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper para identificar App
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

    // States
    const [name, setName] = useState('');
    const [offerType, setOfferType] = useState('main');
    const [salesPageUrl, setSalesPageUrl] = useState('');

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    // ✅ EFEITO: Carrega os dados se for edição
    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setName(productToEdit.name);
                setOfferType(productToEdit.offer_type || 'main');
                setSalesPageUrl(productToEdit.sales_page_url || '');
                setCoverPreview(productToEdit.thumbnail_url || null);
            } else {
                // Reset para Criação
                setName('');
                setOfferType('main');
                setSalesPageUrl('');
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

        try {
            setLoading(true);

            // 1. Upload da Capa (se houver nova)
            let finalCoverUrl = productToEdit?.thumbnail_url || null;

            if (coverImage) {
                // Tenta salvar, se der erro de permissão (bucket não existe), avisa
                try {
                    const fileName = `covers/${Date.now()}_${coverImage.name}`;
                    const { error, data } = await supabase.storage.from('product-thumbnails').upload(fileName, coverImage);
                    if (!error && data) {
                        const { data: publicUrl } = supabase.storage.from('product-thumbnails').getPublicUrl(fileName);
                        finalCoverUrl = publicUrl.publicUrl;
                    }
                } catch (err) {
                    console.warn("Upload falhou (verifique se o bucket 'product-thumbnails' existe)", err);
                }
            }

            const payload: any = {
                name,
                offer_type: offerType,
                sales_page_url: salesPageUrl,
                thumbnail_url: finalCoverUrl,
                is_active: true
            };

            if (productToEdit) {
                // ✅ UPDATE (Editar)
                const { error } = await supabase.from('products').update(payload).eq('id', productToEdit.id);
                if (error) throw error;
            } else {
                // ✅ INSERT (Criar)
                // Busca o ID do App
                let appId = null;
                if (appSlug) {
                    let query = supabase.from('apps').select('id');
                    if (isUUID(appSlug)) query = query.eq('id', appSlug);
                    else query = query.eq('slug', appSlug);
                    const { data } = await query.single();
                    if (data) appId = data.id;
                }

                if (!appId) throw new Error("Erro ao identificar o App.");

                payload.app_id = appId;
                const { error } = await supabase.from('products').insert([payload]);
                if (error) throw error;
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            alert('Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 animate-scale-in">

                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white">{productToEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
                    <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
                </div>

                <div className="space-y-5">
                    {/* Capa */}
                    <div className="flex gap-4">
                        <div className="shrink-0">
                            {coverPreview ? (
                                <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white transition-opacity"><Upload size={14} /></button>
                                </div>
                            ) : (
                                <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-all"><Upload size={18} /><span className="text-[9px] font-bold uppercase mt-1">Logo</span></button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleCoverSelect} accept="image/*" className="hidden" />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nome do Produto</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none font-medium" placeholder="Ex: Comunidade Premium" autoFocus />
                        </div>
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tipo de Oferta</label>
                        <select value={offerType} onChange={(e) => setOfferType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:border-brand-blue outline-none">
                            <option value="main">Principal</option>
                            <option value="bonus">Bônus</option>
                            <option value="order_bump">Order Bump</option>
                            <option value="upsell">Upsell</option>
                        </select>
                    </div>

                    {offerType !== 'bonus' && (
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Link Checkout (Opcional)</label>
                            <input type="url" value={salesPageUrl} onChange={(e) => setSalesPageUrl(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" placeholder="https://..." />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Cancelar</button>
                    <Button onClick={handleSubmit} isLoading={loading} size="sm">{productToEdit ? 'Salvar' : 'Criar'}</Button>
                </div>
            </div>
        </div>
    );
};

export default CreateProductModal;