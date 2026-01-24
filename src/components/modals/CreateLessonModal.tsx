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
    lessonToEdit?: any; // ✅ Aceita edição
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

// ✅ Resize para 512x512 (Seu pedido)
const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 512;
                const MAX_HEIGHT = 512;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
                    else resolve(file);
                }, file.type, 0.9);
            };
        };
    });
};

const CreateLessonModal: React.FC<CreateLessonModalProps> = ({ isOpen, onClose, onSuccess, moduleId, lessonToEdit }) => {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'video_youtube',
        url: '',
        embedCode: '',
        description: '',
    });

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfName, setPdfName] = useState<string | null>(null);
    const [attachmentName, setAttachmentName] = useState<string | null>(null);

    // Carrega dados se for Edição
    useEffect(() => {
        if (isOpen) {
            if (lessonToEdit) {
                setFormData({
                    name: lessonToEdit.name,
                    type: lessonToEdit.content_type || 'video_youtube',
                    url: lessonToEdit.video_url || '',
                    embedCode: lessonToEdit.embed_code || '',
                    description: lessonToEdit.description || '',
                });
                setCoverPreview(lessonToEdit.thumbnail_url || null);
                if (lessonToEdit.content_type === 'pdf' && lessonToEdit.file_url) setPdfName('Arquivo PDF Atual');
            } else {
                setFormData({ name: '', type: 'video_youtube', url: '', embedCode: '', description: '' });
                setCoverPreview(null); setCoverImage(null); setPdfFile(null); setPdfName(null); setAttachmentName(null);
            }
        }
    }, [isOpen, lessonToEdit]);

    if (!isOpen) return null;

    const handleCoverSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handlePdfSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setPdfFile(e.target.files[0]);
            setPdfName(e.target.files[0].name);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return alert('Nome é obrigatório');
        try {
            setLoading(true);

            // Upload Capa (com Resize 512px)
            let finalCoverUrl = lessonToEdit?.thumbnail_url || null;
            if (coverImage) {
                const resized = await resizeImage(coverImage);
                const fileName = `covers/${Date.now()}_${resized.name}`;
                const { error } = await supabase.storage.from('product-thumbnails').upload(fileName, resized);
                if (!error) {
                    const { data } = supabase.storage.from('product-thumbnails').getPublicUrl(fileName);
                    finalCoverUrl = data.publicUrl;
                }
            }

            // Upload PDF
            let finalFileUrl = lessonToEdit?.file_url || null;
            if (formData.type === 'pdf' && pdfFile) {
                const fileName = `files/${Date.now()}_${pdfFile.name}`;
                const { error } = await supabase.storage.from('product-thumbnails').upload(fileName, pdfFile);
                if (!error) {
                    const { data } = supabase.storage.from('product-thumbnails').getPublicUrl(fileName);
                    finalFileUrl = data.publicUrl;
                }
            }

            const payload: any = {
                name: formData.name,
                content_type: formData.type,
                description: formData.description,
                thumbnail_url: finalCoverUrl,
                is_active: true
            };

            if (['video_youtube', 'video_vimeo', 'link', 'website'].includes(formData.type)) {
                payload.video_url = formData.url;
                payload.embed_code = null; payload.file_url = null;
            } else if (['video_panda', 'html'].includes(formData.type)) {
                payload.embed_code = formData.embedCode;
                payload.video_url = null; payload.file_url = null;
            } else if (formData.type === 'pdf') {
                payload.file_url = finalFileUrl;
                payload.video_url = null; payload.embed_code = null;
            }

            if (lessonToEdit) {
                const { error } = await supabase.from('lessons').update(payload).eq('id', lessonToEdit.id);
                if (error) throw error;
            } else {
                if (!moduleId) throw new Error('Módulo não identificado');
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

    const currentType = contentTypes.find(t => t.id === formData.type) || contentTypes[0];

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-scale-in border border-slate-200 dark:border-slate-800">

                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-xl shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{lessonToEdit ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h3>
                        <p className="text-sm text-slate-500">Preencha as informações do conteúdo</p>
                    </div>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950/50">
                    {/* Capa */}
                    <div>
                        <div className="flex items-center gap-2 mb-2"><label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Capa (Max 512px)</label><HelpCircle size={12} className="text-slate-400" /></div>
                        <div className="flex justify-center">
                            {coverPreview ? (
                                <div className="relative group w-40 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <img src={coverPreview} className="w-full h-full object-cover" />
                                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white"><Upload size={20} /></button>
                                </div>
                            ) : (
                                <button onClick={() => fileInputRef.current?.click()} className="w-40 h-24 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-blue"><Upload size={16} /></button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleCoverSelect} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    {/* Nome */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Nome*</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none" />
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Tipo*</label>
                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none">
                            {contentTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                    </div>

                    {/* Dinâmico */}
                    <div className="animate-fade-in">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">{currentType.field === 'embed' ? 'Embed Code' : currentType.id === 'pdf' ? 'Arquivo PDF' : 'URL'}</label>
                        {currentType.field === 'embed' ? (
                            <textarea value={formData.embedCode} onChange={(e) => setFormData({ ...formData, embedCode: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none h-24 font-mono" />
                        ) : currentType.id === 'pdf' ? (
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-blue" onClick={() => pdfInputRef.current?.click()}>
                                <FileText className="w-8 h-8 text-slate-300 mb-2" />
                                <p className="text-sm text-slate-500">{pdfName || "Selecionar PDF"}</p>
                                <input type="file" ref={pdfInputRef} onChange={handlePdfSelect} accept="application/pdf" className="hidden" />
                            </div>
                        ) : (
                            <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none" />
                        )}
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Descrição</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm h-24 resize-none focus:border-brand-blue outline-none" />
                    </div>

                    {/* Anexos */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Anexos</label>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <Paperclip size={18} className="text-slate-400" />
                            <p className="flex-1 text-sm text-slate-500 truncate">{attachmentName || "Nenhum anexo"}</p>
                            <button onClick={() => attachmentInputRef.current?.click()} className="text-xs font-bold text-brand-blue">Escolher</button>
                            <input type="file" ref={attachmentInputRef} onChange={(e) => setAttachmentName(e.target.files?.[0]?.name || null)} className="hidden" />
                        </div>
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