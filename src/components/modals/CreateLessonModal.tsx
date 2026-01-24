import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Upload, Video, FileText, Link as LinkIcon, Code, HelpCircle, Paperclip } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';

interface CreateLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    moduleId: string | null;
    lessonToEdit?: any; // ✅ Agora aceita edição
}

const contentTypes = [
    { id: 'video_youtube', label: 'YouTube', icon: Video, field: 'url', placeholder: 'https://youtube.com/watch?v=...' },
    { id: 'video_vimeo', label: 'Vimeo', icon: Video, field: 'url', placeholder: 'https://vimeo.com/...' },
    { id: 'video_panda', label: 'Vturb/Panda', icon: Code, field: 'embed', placeholder: '<iframe src="..." ...></iframe>' },
    { id: 'link', label: 'Link Externo', icon: LinkIcon, field: 'url', placeholder: 'https://...' },
    { id: 'website', label: 'Página Web (Embed)', icon: LinkIcon, field: 'url', placeholder: 'https://seusite.com' },
    { id: 'html', label: 'HTML', icon: Code, field: 'embed', placeholder: '<div>...</div>' },
    { id: 'pdf', label: 'PDF / Arquivo', icon: FileText, field: 'file', placeholder: '' },
];

const CreateLessonModal: React.FC<CreateLessonModalProps> = ({ isOpen, onClose, onSuccess, moduleId, lessonToEdit }) => {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // States
    const [name, setName] = useState('');
    const [type, setType] = useState('video_youtube');
    const [url, setUrl] = useState('');
    const [embedCode, setEmbedCode] = useState('');
    const [description, setDescription] = useState('');

    // ✅ EFEITO: Carrega dados na edição
    useEffect(() => {
        if (isOpen) {
            if (lessonToEdit) {
                setName(lessonToEdit.name);
                setType(lessonToEdit.content_type || 'video_youtube');
                setUrl(lessonToEdit.video_url || '');
                setEmbedCode(lessonToEdit.embed_code || '');
                setDescription(lessonToEdit.description || '');
            } else {
                // Reset para criação
                setName(''); setType('video_youtube'); setUrl(''); setEmbedCode(''); setDescription('');
            }
        }
    }, [isOpen, lessonToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!name.trim()) return alert('Nome obrigatório');
        try {
            setLoading(true);

            const payload: any = {
                name,
                content_type: type,
                description,
                is_active: true
            };

            if (['video_youtube', 'video_vimeo', 'link', 'website'].includes(type)) {
                payload.video_url = url;
                payload.embed_code = null;
            } else if (['video_panda', 'html'].includes(type)) {
                payload.embed_code = embedCode;
                payload.video_url = null;
            }

            if (lessonToEdit) {
                // UPDATE
                const { error } = await supabase.from('lessons').update(payload).eq('id', lessonToEdit.id);
                if (error) throw error;
            } else {
                // INSERT
                if (!moduleId) return;
                payload.module_id = moduleId;
                const { error } = await supabase.from('lessons').insert([payload]);
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

    const currentType = contentTypes.find(t => t.id === type) || contentTypes[0];

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-scale-in border border-slate-200 dark:border-slate-800">

                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-xl shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{lessonToEdit ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h3>
                        <p className="text-sm text-slate-500">Preencha as informações do conteúdo</p>
                    </div>
                    <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950/50">

                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Nome*</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none" placeholder="Nome da aula" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Tipo*</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none">
                            {contentTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                    </div>

                    <div className="animate-fade-in">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">
                            {currentType.field === 'embed' ? 'Código Embed' : 'URL / Link'}
                        </label>
                        {currentType.field === 'embed' ? (
                            <textarea value={embedCode} onChange={(e) => setEmbedCode(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none h-24 font-mono" placeholder={currentType.placeholder} />
                        ) : (
                            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none" placeholder={currentType.placeholder} />
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Descrição</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm h-24 resize-none focus:border-brand-blue outline-none" placeholder="Descrição opcional..." />
                    </div>

                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 rounded-b-xl">
                    <button onClick={onClose} className="px-6 py-3 border border-slate-200 rounded-xl text-xs font-bold uppercase">Cancelar</button>
                    <Button onClick={handleSubmit} isLoading={loading} className="px-8 py-3 text-xs font-bold uppercase">{lessonToEdit ? 'Salvar' : 'Criar'}</Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateLessonModal;