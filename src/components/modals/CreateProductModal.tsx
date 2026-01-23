import React, { useState } from 'react';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useParams } from 'react-router-dom';
import Button from '../Button';

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Para avisar a ProductsPage que deve atualizar a lista
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { appSlug } = useParams<{ appSlug: string }>();
    const [loading, setLoading] = useState(false);

    // Estado do Formulário
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        offerType: 'main',
        releaseType: 'immediate',
        price: '',
        salesPageUrl: '',
        thumbnailUrl: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.name) return alert('O nome do produto é obrigatório');

        try {
            setLoading(true);

            // 1. Precisamos do ID do App (buscando pelo Slug da URL)
            // Se você já tiver isso no Contexto, pode usar direto.
            const { data: appData, error: appError } = await supabase
                .from('apps')
                .select('id')
                .eq('slug', appSlug)
                .single();

            if (appError || !appData) throw new Error("App não encontrado para vincular o produto.");

            // 2. Inserção no Supabase
            const { error } = await supabase.from('products').insert([
                {
                    app_id: appData.id,
                    name: formData.name,
                    description: formData.description,
                    offer_type: formData.offerType, // Certifique-se que sua coluna no banco usa snake_case ou ajuste aqui
                    release_type: formData.releaseType,
                    price: parseFloat(formData.price) || 0,
                    sales_page_url: formData.salesPageUrl,
                    thumbnail_url: formData.thumbnailUrl,
                    is_active: true
                }
            ]);

            if (error) throw error;

            // 3. Sucesso
            onSuccess(); // Avisa o pai para recarregar a lista
            onClose();   // Fecha o modal

            // Reset form
            setFormData({
                name: '', description: '', offerType: 'main',
                releaseType: 'immediate', price: '', salesPageUrl: '', thumbnailUrl: ''
            });

        } catch (error: any) {
            console.error('Erro ao criar produto:', error);
            alert('Erro ao criar produto: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay Escuro */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            {/* Card do Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-slate-200 dark:border-slate-800">

                {/* Cabeçalho */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Novo Produto</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Corpo do Formulário */}
                <div className="p-6 space-y-5">
                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Nome do Produto</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all font-medium"
                            placeholder="Ex: Mentoria Elite 2.0"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Tipo de Oferta</label>
                            <select
                                value={formData.offerType}
                                onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none appearance-none"
                            >
                                <option value="main">Produto Principal</option>
                                <option value="bonus">Bônus (Gratuito)</option>
                                <option value="upsell">Upsell (Pago)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Preço (R$)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Link de Vendas (Checkout)</label>
                        <input
                            type="url"
                            value={formData.salesPageUrl}
                            onChange={(e) => setFormData({ ...formData, salesPageUrl: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none"
                            placeholder="https://pay.kiwify.com.br/..."
                        />
                        <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                            * Necessário para o botão de compra no "Cadeado" de Upsell.
                        </p>
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <Button
                            onClick={handleSubmit}
                            isLoading={loading}
                            className="flex-1 py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                        >
                            Criar Produto
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProductModal;