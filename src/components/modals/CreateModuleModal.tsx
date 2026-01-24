import React, { useState, useEffect } from 'react';
import { X, Layers, HelpCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';

interface CreateModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productId: string | null;
    moduleToEdit?: any; // ✅ Agora ele aceita edição!
}

const CreateModuleModal: React.FC<CreateModuleModalProps> = ({ isOpen, onClose, onSuccess, productId, moduleToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        releaseType: 'immediate' as 'immediate' | 'days_after' | 'exact_date',
        releaseDays: '',
        releaseDate: ''
    });
    const [loading, setLoading] = useState(false);

    // Preenche os dados se for edição
    useEffect(() => {
        if (isOpen) {
            if (moduleToEdit) {
                setFormData({
                    name: moduleToEdit.name,
                    releaseType: moduleToEdit.release_type || 'immediate',
                    releaseDays: moduleToEdit.release_days || '',
                    releaseDate: moduleToEdit.release_date || ''
                });
            } else {
                setFormData({ name: '', releaseType: 'immediate', releaseDays: '', releaseDate: '' });
            }
        }
    }, [isOpen, moduleToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;
        try {
            setLoading(true);

            const payload: any = {
                name: formData.name,
                release_type: formData.releaseType,
                release_days: formData.releaseType === 'days_after' ? parseInt(formData.releaseDays) : null,
                release_date: formData.releaseType === 'exact_date' ? formData.releaseDate : null,
            };

            if (moduleToEdit) {
                // UPDATE (Edição)
                const { error } = await supabase.from('modules').update(payload).eq('id', moduleToEdit.id);
                if (error) throw error;
            } else {
                // INSERT (Criação)
                if (!productId) throw new Error('Produto não identificado');
                payload.product_id = productId;
                payload.order_index = 0;
                const { error } = await supabase.from('modules').insert([payload]);
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
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers size={18} className="text-brand-blue" /> {moduleToEdit ? 'Editar Módulo' : 'Novo Módulo'}
                    </h3>
                    <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Nome do Módulo</label>
                        <input
                            autoFocus
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Módulo 01"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none font-medium"
                        />
                    </div>

                    {/* Regras de Liberação Simplificadas */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Liberação</label>
                        <select
                            value={formData.releaseType}
                            onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as any })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none"
                        >
                            <option value="immediate">Imediata</option>
                            <option value="days_after">Dias após compra</option>
                            <option value="exact_date">Data Fixa</option>
                        </select>
                    </div>

                    {formData.releaseType === 'days_after' && (
                        <input type="number" value={formData.releaseDays} onChange={(e) => setFormData({ ...formData, releaseDays: e.target.value })} placeholder="Dias" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
                    )}
                    {formData.releaseType === 'exact_date' && (
                        <input type="date" value={formData.releaseDate} onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" />
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Cancelar</button>
                    <Button onClick={handleSubmit} isLoading={loading} size="sm">{moduleToEdit ? 'Salvar' : 'Criar'}</Button>
                </div>
            </div>
        </div>
    );
};

export default CreateModuleModal;