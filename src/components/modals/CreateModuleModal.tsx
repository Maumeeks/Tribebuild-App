import React, { useState, useEffect } from 'react';
import { X, Layers, HelpCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';

interface CreateModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productId: string | null; // ✅ A página manda isso
    moduleToEdit?: any;       // ✅ E manda isso também
}

const CreateModuleModal: React.FC<CreateModuleModalProps> = ({ isOpen, onClose, onSuccess, productId, moduleToEdit }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    // Carrega dados se for edição
    useEffect(() => {
        if (isOpen) {
            if (moduleToEdit) {
                setName(moduleToEdit.name);
            } else {
                setName('');
            }
        }
    }, [isOpen, moduleToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!name.trim()) return;
        try {
            setLoading(true);

            if (moduleToEdit) {
                // UPDATE
                const { error } = await supabase.from('modules').update({ name: name }).eq('id', moduleToEdit.id);
                if (error) throw error;
            } else {
                // INSERT
                if (!productId) throw new Error("ID do Produto obrigatório");
                const { error } = await supabase.from('modules').insert([{ product_id: productId, name: name }]);
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
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-800 animate-scale-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers size={18} className="text-brand-blue" /> {moduleToEdit ? 'Editar Módulo' : 'Novo Módulo'}
                    </h3>
                    <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nome do Módulo</label>
                            <HelpCircle size={12} className="text-slate-400" />
                        </div>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Módulo 01 - Boas Vindas"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none font-medium"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                    <Button onClick={handleSubmit} isLoading={loading} size="sm">{moduleToEdit ? 'Salvar' : 'Criar'}</Button>
                </div>
            </div>
        </div>
    );
};

export default CreateModuleModal;