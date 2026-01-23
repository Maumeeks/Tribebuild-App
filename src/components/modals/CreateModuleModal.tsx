import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';

interface CreateModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productId: string | null; // <-- OBRIGATÓRIO AQUI
}

const CreateModuleModal: React.FC<CreateModuleModalProps> = ({ isOpen, onClose, onSuccess, productId }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !productId) return null;

    const handleSubmit = async () => {
        if (!name.trim()) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('modules').insert([
                { product_id: productId, name: name }
            ]);

            if (error) throw error;
            onSuccess();
            onClose();
            setName('');
        } catch (error: any) {
            alert('Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 animate-scale-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers size={18} className="text-brand-blue" /> Novo Módulo
                    </h3>
                    <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Nome do Módulo</label>
                        <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Módulo 01 - Boas Vindas" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none font-medium" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Cancelar</button>
                    <Button onClick={handleSubmit} isLoading={loading} size="sm">Criar Módulo</Button>
                </div>
            </div>
        </div>
    );
};

export default CreateModuleModal;