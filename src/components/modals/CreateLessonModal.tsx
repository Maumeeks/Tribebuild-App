import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Upload, Video, FileText, Link as LinkIcon, Code, HelpCircle, Paperclip, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';

interface CreateLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    moduleId: string | null;
    lessonToEdit?: any; // Recebe a aula para edição
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

// Função utilitária para redimensionar imagem (Max 800px width)
const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Define limite de largura
                const scaleSize = MAX_WIDTH / img.width;

                // Se a imagem for menor que o limite, não redimensiona
                if (scaleSize >= 1) {
                    resolve(file);
                    return;
                }

                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const resizedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(resizedFile);
                    } else {
                        resolve(file); // Fallback
                    }
                }, file.type, 0.8); // 80% qualidade
            };
        };
    });
};

const CreateLessonModal: React.FC<CreateLessonModalProps> = ({ isOpen, onClose, onSuccess, moduleId, lessonToEdit }) => {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null); // Capa
    const pdfInputRef = useRef<HTMLInputElement>(null); // PDF
    const attachmentInputRef = useRef<HTMLInputElement>(null); // Anexos

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

    // Efeito: Carregar dados ao abrir (Modo Edição)
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

                if (lessonToEdit.content_type === 'pdf' && lessonToEdit.file_url) {
                    setPdfName('Arquivo PDF Atual'); // Indica que já existe um
                }
            } else {
                // Reset Limpo
                setFormData({ name: '', type: 'video_youtube', url: '', embedCode: '', description: '' });
                setCoverPreview(null); setCoverImage(null);
                setPdfFile(null); setPdfName(null);
                setAttachmentName(null);
            }
        }
    }, [isOpen, lessonToEdit]);

    if (!isOpen) return null;

    const handleCoverSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setCoverImage(file); // Guarda o arquivo original
            setCoverPreview(URL.createObjectURL(file)); // Preview imediato
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

            // 1. Upload Capa (com Resize)
            let finalCoverUrl = lessonToEdit?.thumbnail_url || null;
            if (coverImage) {
                const resizedImage = await resizeImage(coverImage); // Redimensiona!
                const fileName = `covers/${Date.now()}_${resizedImage.name}`;
                const { error } = await supabase.storage.from('product-thumbnails').upload(fileName, resizedImage);
                if (!error) {
                    const { data } = supabase.storage.from('product-thumbnails').getPublicUrl(fileName);
                    finalCoverUrl = data.publicUrl;
                }
            }

            // 2. Upload PDF (se for o caso)
            let finalFileUrl = lessonToEdit?.file_url || null;
            if (formData.type === 'pdf' && pdfFile) {
                const fileName = `files/${Date.now()}_${pdfFile.name}`;
                // Nota: Garanta que o bucket 'lesson-files' ou 'product-thumbnails' exista e seja público
                const { error } = await supabase.storage.from('product-thumbnails').upload(fileName, pdfFile);
                if (!error) {
                    const { data } = supabase.storage.from('product-thumbnails').getPublicUrl(fileName);
                    finalFileUrl = data.publicUrl;
                }
            }

            // 3. Monta Payload
            const payload: any = {
                name: formData.name,
                content_type: formData.type,
                description: formData.description,
                thumbnail_url: finalCoverUrl,
                is_active: true
            };

            // Limpeza de campos baseada no tipo
            if (['video_youtube', 'video_vimeo', 'link', 'website'].includes(formData.type)) {
                payload.video_url = formData.url;
                payload.embed_code = null;
                payload.file_url = null;
            } else if (['video_panda', 'html'].includes(formData.type)) {
                payload.embed_code = formData.embedCode;
                payload.video_url = null;
                payload.file_url = null;
            } else if (formData.type === 'pdf') {
                payload.file_url = finalFileUrl;
                payload.video_url = null;
                payload.embed_code = null;
            }

            // 4. Salva no Banco
            if (lessonToEdit) {
                // Update
                const { error } = await supabase.from('lessons').update(payload).eq('id', lessonToEdit.id);
                if (error) throw error;
            } else {
                // Create
                if (!moduleId) throw new Error('Erro: Módulo não identificado');
                payload.module_id = moduleId;
                const { error } = await supabase.from('lessons').insert([payload]);
                if (error) throw error;
            }

            onSuccess();
            onClose();

        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const currentType = contentTypes.find(t => t.id === formData.type) || contentTypes[0];

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-scale-in border border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-xl shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {lessonToEdit ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                        </h3>
                        <p className="text-sm text-slate-500">Preencha as informações do conteúdo</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950/50">

                    {/* Capa */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Capa do Conteúdo</label>
                            <HelpCircle size={12} className="text-slate-400" />
                        </div>
                        <div className="flex justify-center">
                            {coverPreview ? (
                                <div className="relative group w-40 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><Upload size={20} /></button>
                                </div>
                            ) : (
                                <button onClick={() => fileInputRef.current?.click()} className="w-40 h-24 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-blue hover:text-brand-blue transition-all">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full"><Upload size={16} /></div>
                                    <span className="text-[10px]">Max 800px</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleCoverSelect} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    {/* Nome */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">Nome do Conteúdo*</label>
                        <input
                            autoFocus
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-medium"
                            placeholder="Digite o nome do conteúdo"
                        />
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">Tipo de Conteúdo*</label>
                        <div className="relative">
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none appearance-none font-medium cursor-pointer"
                            >
                                {contentTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Video size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Campo Dinâmico (Lógica de PDF adicionada aqui) */}
                    <div className="animate-fade-in">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                            {currentType.field === 'embed' ? 'Código de Incorporação (Embed)*' : currentType.id === 'pdf' ? 'Arquivo PDF*' : 'Link / URL*'}
                        </label>

                        {currentType.field === 'embed' ? (
                            <textarea
                                value={formData.embedCode}
                                onChange={(e) => setFormData({ ...formData, embedCode: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none h-24 resize-none font-mono"
                                placeholder={currentType.placeholder}
                            />
                        ) : currentType.id === 'pdf' ? (
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 transition-all hover:border-brand-blue group cursor-pointer" onClick={() => pdfInputRef.current?.click()}>
                                <FileText className="w-10 h-10 text-slate-300 group-hover:text-brand-blue mb-3 transition-colors" />
                                <p className="text-sm text-slate-500 mb-2 font-medium">{pdfName || "Clique para escolher o PDF"}</p>
                                <button type="button" className="text-xs font-bold text-brand-blue bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    Selecionar Arquivo
                                </button>
                                <input type="file" ref={pdfInputRef} onChange={handlePdfSelect} accept="application/pdf" className="hidden" />
                            </div>
                        ) : (
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-brand-blue outline-none"
                                placeholder={currentType.placeholder}
                            />
                        )}
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">Descrição (Opcional)</label>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue/10 focus-within:border-brand-blue transition-all">
                            <div className="flex items-center gap-2 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                                <span className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer text-xs font-bold w-6 h-6 flex items-center justify-center">B</span>
                                <span className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer text-xs italic w-6 h-6 flex items-center justify-center">I</span>
                                <span className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer text-xs underline w-6 h-6 flex items-center justify-center">U</span>
                            </div>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-transparent border-none outline-none text-sm h-24 resize-none"
                                placeholder="Insira a descrição do conteúdo aqui..."
                            />
                        </div>
                    </div>

                    {/* Anexos */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Anexos</label>
                            <HelpCircle size={12} className="text-slate-400" />
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                                <Paperclip size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                    {attachmentName || "Nenhum anexo adicionado"}
                                </p>
                            </div>
                            <button
                                onClick={() => attachmentInputRef.current?.click()}
                                className="text-xs font-bold text-brand-blue hover:text-blue-700 transition-colors"
                            >
                                Escolher Arquivo
                            </button>
                            <input type="file" ref={attachmentInputRef} onChange={(e) => setAttachmentName(e.target.files?.[0]?.name || null)} className="hidden" />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 rounded-b-xl shrink-0">
                    <button onClick={onClose} className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Cancelar
                    </button>
                    <Button onClick={handleSubmit} isLoading={loading} className="px-8 py-3 text-xs font-bold uppercase shadow-lg shadow-brand-blue/20">
                        {lessonToEdit ? 'Salvar Alterações' : 'Salvar'}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateLessonModal;