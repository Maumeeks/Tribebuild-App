import React, { useState } from 'react';
import { X, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';

interface CreateLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    moduleId: string | null; // O Pai (Módulo)
}

const CreateLessonModal: React.FC<CreateLessonModalProps> = ({ isOpen, onClose, onSuccess, moduleId }) => {
    const [formData, setFormData] = useState({ name: '', video_url: '' });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.name.trim() || !moduleId) return;

        try {
            setLoading(true);
            // Simples: Cria aula apontando para o módulo pai
            const { error } = await supabase.from('lessons').insert([
                {
                    module_id: moduleId,
                    name: formData.name,
                    video_url: formData.video_url
                }
            ]);

            if (error) throw error;
            onSuccess();
            onClose();
            setFormData({ name: '', video_url: '' });
        } catch (error: any) {
            alert('Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800 animate-scale-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Video size={18} className="text-brand-blue" /> Nova Aula
                    </h3>
                    <button onClick={onClose}><X size={18} className="text-slate-400" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Título da Aula</label>
                        <input
                            autoFocus
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none"
                            placeholder="Ex: Como começar"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Link do Vídeo (YouTube/Vimeo)</label>
                        <input
                            type="url"
                            value={formData.video_url}
                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:border-brand-blue outline-none"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                    <Button onClick={handleSubmit} isLoading={loading} size="sm">Salvar Aula</Button>
                </div>
            </div>
        </div>
    );
};

export default CreateLessonModal;