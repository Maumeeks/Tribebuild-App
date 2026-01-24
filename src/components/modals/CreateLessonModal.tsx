import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Upload, Video, FileText, Link as LinkIcon, Code, HelpCircle, Paperclip } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';
import ReactQuill from 'react-quill'; // ✅ Import do Editor
import 'react-quill/dist/quill.snow.css'; // ✅ Import do CSS do Editor

interface CreateLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    moduleId: string | null;
    lessonToEdit?: any;
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
                const scaleSize = MAX_WIDTH / img.width;
                if (scaleSize >= 1) { resolve(file); return; }
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
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
        description: '', // Agora armazena HTML do Quill
    });

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfName, setPdfName] = useState<string | null>(null);
    const [attachmentName, setAttachmentName] = useState<string | null>(null);

    // Configuração da Barra de Ferramentas do Editor
    const quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

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

    const handleCoverSelect = async (e: ChangeEvent<HTMLInputElement>) => {
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
        if (!formData.name.trim()) return alert('Nome obrigatório');
        try {
            setLoading(true);

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
                description: formData.description, // HTML rico
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
                    <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950/50">

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

                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Nome*</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none" placeholder="Nome da aula" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Tipo*</label>
                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none">
                            {contentTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                    </div>

                    <div className="animate-fade-in">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">
                            {currentType.field === 'embed' ? 'Código Embed*' : currentType.id === 'pdf' ? 'Arquivo PDF*' : 'Link / URL*'}
                        </label>

                        {currentType.field === 'embed' ? (
                            <textarea value={formData.embedCode} onChange={(e) => setFormData({ ...formData, embedCode: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none h-24 font-mono" placeholder={currentType.placeholder} />
                        ) : currentType.id === 'pdf' ? (
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 cursor-pointer hover:border-brand-blue transition-all" onClick={() => pdfInputRef.current?.click()}>
                                <FileText className="w-8 h-8 text-slate-300 mb-2" />
                                <p className="text-sm text-slate-500 mb-2">{pdfName || "Clique para selecionar PDF"}</p>
                                <button type="button" className="text-xs font-bold text-brand-blue bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">Escolher Arquivo</button>
                                <input type="file" ref={pdfInputRef} onChange={handlePdfSelect} accept="application/pdf" className="hidden" />
                            </div>
                        ) : (
                            <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none" placeholder={currentType.placeholder} />
                        )}
                    </div>

                    {/* ✅ EDITOR DE TEXTO (Substituindo textarea) */}
                    <div className="quill-wrapper">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-2">Descrição</label>
                        <ReactQuill
                            theme="snow"
                            value={formData.description}
                            onChange={(value) => setFormData({ ...formData, description: value })}
                            modules={quillModules}
                            className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden"
                        />

                        {/* Estilos Customizados para o Quill no Dark Mode */}
                        <style>{`
                .quill-wrapper .ql-toolbar {
                    border: 1px solid #e2e8f0;
                    border-bottom: none;
                    border-radius: 0.75rem 0.75rem 0 0;
                    background-color: #f8fafc;
                }
                .quill-wrapper .ql-container {
                    border: 1px solid #e2e8f0;
                    border-radius: 0 0 0.75rem 0.75rem;
                    min-height: 120px;
                    font-size: 0.875rem; /* text-sm */
                }
                
                /* Dark Mode Overrides */
                .dark .quill-wrapper .ql-toolbar {
                    background-color: #0f172a; /* slate-900 */
                    border-color: #1e293b; /* slate-800 */
                }
                .dark .quill-wrapper .ql-container {
                    border-color: #1e293b;
                    color: #e2e8f0; /* slate-200 */
                }
                .dark .quill-wrapper .ql-stroke { stroke: #94a3b8; }
                .dark .quill-wrapper .ql-fill { fill: #94a3b8; }
                .dark .quill-wrapper .ql-picker { color: #94a3b8; }
                .dark .quill-wrapper .ql-picker-options { background-color: #0f172a; border-color: #1e293b; }
            `}</style>
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