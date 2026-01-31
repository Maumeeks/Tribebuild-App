import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
    X,
    Upload,
    Video,
    FileText,
    Link as LinkIcon,
    Code,
    HelpCircle,
    Paperclip,
    Music,
    Globe,
    Download,
    FileCode,
    Play
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface CreateLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    moduleId: string | null;
    lessonToEdit?: any;
}

// ✅ TIPOS DE CONTEÚDO EXPANDIDOS
const contentTypes = [
    {
        id: 'video_youtube',
        label: 'YouTube',
        icon: Video,
        field: 'url',
        placeholder: 'Cole a URL do vídeo: https://youtube.com/watch?v=... ou https://youtu.be/...',
        description: 'O vídeo será incorporado automaticamente no player'
    },
    {
        id: 'video_vimeo',
        label: 'Vimeo',
        icon: Video,
        field: 'url',
        placeholder: 'Cole a URL do vídeo: https://vimeo.com/123456789',
        description: 'O vídeo será incorporado automaticamente no player'
    },
    {
        id: 'video_panda',
        label: 'Vturb/Panda',
        icon: Code,
        field: 'embed',
        placeholder: '<iframe src="https://player.vturb.com.br/..." ...></iframe>',
        description: 'Cole o código embed fornecido pela plataforma'
    },
    {
        id: 'audio',
        label: 'Áudio',
        icon: Music,
        field: 'file',
        placeholder: '',
        description: 'MP3, WAV, OGG - Máximo 100MB'
    },
    {
        id: 'html',
        label: 'HTML',
        icon: Code,
        field: 'embed',
        placeholder: '<div>Seu código HTML aqui...</div>',
        description: 'Código HTML personalizado será renderizado'
    },
    {
        id: 'link',
        label: 'Link Externo',
        icon: LinkIcon,
        field: 'url',
        placeholder: 'https://exemplo.com',
        description: 'Abre em nova aba (uso não recomendado)'
    },
    {
        id: 'website',
        label: 'Página Web',
        icon: Globe,
        field: 'url',
        placeholder: 'https://seusite.com/pagina',
        description: 'A página será incorporada via iframe'
    },
    {
        id: 'pdf_drive',
        label: 'PDF Google Drive',
        icon: FileText,
        field: 'url',
        placeholder: 'https://drive.google.com/file/d/.../view',
        description: 'PDF do Google Drive será incorporado'
    },
    {
        id: 'pdf',
        label: 'Arquivo para Download',
        icon: Download,
        field: 'file',
        placeholder: '',
        description: 'PDF, DOC, XLS, ZIP - Disponível para download'
    },
    {
        id: 'file_embed',
        label: 'Arquivo Incorporado',
        icon: FileCode,
        field: 'file',
        placeholder: '',
        description: 'PDF será exibido diretamente no player'
    },
];

// ✅ FUNÇÃO PARA EXTRAIR ID DO YOUTUBE
const extractYouTubeId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

// ✅ FUNÇÃO PARA EXTRAIR ID DO VIMEO
const extractVimeoId = (url: string): string | null => {
    const patterns = [
        /vimeo\.com\/(\d+)/,
        /player\.vimeo\.com\/video\/(\d+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

// ✅ FUNÇÃO PARA EXTRAIR ID DO GOOGLE DRIVE
const extractGoogleDriveId = (url: string): string | null => {
    const patterns = [
        /drive\.google\.com\/file\/d\/([^\/]+)/,
        /drive\.google\.com\/open\?id=([^&]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

// ✅ GERAR EMBED CODE AUTOMATICAMENTE
const generateEmbedCode = (type: string, url: string): string | null => {
    switch (type) {
        case 'video_youtube': {
            const videoId = extractYouTubeId(url);
            if (!videoId) return null;
            return `<iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                style="aspect-ratio: 16/9;"
            ></iframe>`;
        }
        case 'video_vimeo': {
            const videoId = extractVimeoId(url);
            if (!videoId) return null;
            return `<iframe 
                width="100%" 
                height="100%" 
                src="https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen
                style="aspect-ratio: 16/9;"
            ></iframe>`;
        }
        case 'pdf_drive': {
            const fileId = extractGoogleDriveId(url);
            if (!fileId) return null;
            return `<iframe 
                src="https://drive.google.com/file/d/${fileId}/preview" 
                width="100%" 
                height="100%" 
                style="min-height: 600px;"
                allow="autoplay"
            ></iframe>`;
        }
        case 'website': {
            return `<iframe 
                src="${url}" 
                width="100%" 
                height="100%" 
                style="min-height: 600px; border: none;"
            ></iframe>`;
        }
        default:
            return null;
    }
};

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
    const contentFileInputRef = useRef<HTMLInputElement>(null);
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
    const [contentFile, setContentFile] = useState<File | null>(null);
    const [contentFileName, setContentFileName] = useState<string | null>(null);
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [attachmentName, setAttachmentName] = useState<string | null>(null);
    const [urlValid, setUrlValid] = useState<boolean | null>(null);
    const [previewEmbed, setPreviewEmbed] = useState<string | null>(null);

    const quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    // ✅ VALIDAR URL E GERAR PREVIEW
    useEffect(() => {
        if (['video_youtube', 'video_vimeo', 'pdf_drive', 'website'].includes(formData.type) && formData.url) {
            const embed = generateEmbedCode(formData.type, formData.url);
            if (embed) {
                setUrlValid(true);
                setPreviewEmbed(embed);
            } else {
                setUrlValid(false);
                setPreviewEmbed(null);
            }
        } else {
            setUrlValid(null);
            setPreviewEmbed(null);
        }
    }, [formData.url, formData.type]);

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
                if (['pdf', 'audio', 'file_embed'].includes(lessonToEdit.content_type) && lessonToEdit.file_url) {
                    setContentFileName('Arquivo Atual');
                }
                // ✅ CARREGAR ANEXO DO CAMPO attachments (jsonb)
                if (lessonToEdit.attachments) {
                    const att = typeof lessonToEdit.attachments === 'string'
                        ? JSON.parse(lessonToEdit.attachments)
                        : lessonToEdit.attachments;
                    if (att?.name) {
                        setAttachmentName(att.name);
                    }
                }
            } else {
                setFormData({ name: '', type: 'video_youtube', url: '', embedCode: '', description: '' });
                setCoverPreview(null);
                setCoverImage(null);
                setContentFile(null);
                setContentFileName(null);
                setAttachmentFile(null);
                setAttachmentName(null);
                setUrlValid(null);
                setPreviewEmbed(null);
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

    const handleContentFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setContentFile(e.target.files[0]);
            setContentFileName(e.target.files[0].name);
        }
    };

    const handleAttachmentSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setAttachmentFile(e.target.files[0]);
            setAttachmentName(e.target.files[0].name);
        }
    };

    const getAcceptedFileTypes = () => {
        switch (formData.type) {
            case 'audio':
                return 'audio/mp3,audio/wav,audio/ogg,audio/mpeg,.mp3,.wav,.ogg';
            case 'pdf':
                return '.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar';
            case 'file_embed':
                return '.pdf';
            default:
                return '*';
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return alert('Nome obrigatório');

        // Validação específica por tipo
        if (['video_youtube', 'video_vimeo'].includes(formData.type) && !urlValid) {
            return alert('URL do vídeo inválida. Verifique o formato.');
        }

        try {
            setLoading(true);

            // Upload da capa
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

            // Upload do arquivo de conteúdo (PDF, áudio, etc)
            let finalFileUrl = lessonToEdit?.file_url || null;
            if (['pdf', 'audio', 'file_embed'].includes(formData.type) && contentFile) {
                const fileName = `files/${Date.now()}_${contentFile.name}`;
                const { error } = await supabase.storage.from('product-thumbnails').upload(fileName, contentFile);
                if (!error) {
                    const { data } = supabase.storage.from('product-thumbnails').getPublicUrl(fileName);
                    finalFileUrl = data.publicUrl;
                }
            }

            // ✅ Upload do anexo e preparar objeto JSON
            let finalAttachments: any = lessonToEdit?.attachments || null;
            if (attachmentFile) {
                const fileName = `attachments/${Date.now()}_${attachmentFile.name}`;
                const { error } = await supabase.storage.from('product-thumbnails').upload(fileName, attachmentFile);
                if (!error) {
                    const { data } = supabase.storage.from('product-thumbnails').getPublicUrl(fileName);
                    // ✅ SALVAR COMO OBJETO JSON (não como colunas separadas)
                    finalAttachments = {
                        url: data.publicUrl,
                        name: attachmentFile.name
                    };
                }
            }

            // ✅ GERAR EMBED CODE AUTOMATICAMENTE
            let finalEmbedCode = formData.embedCode;
            if (['video_youtube', 'video_vimeo', 'pdf_drive', 'website'].includes(formData.type)) {
                finalEmbedCode = generateEmbedCode(formData.type, formData.url) || '';
            }

            // ✅ PAYLOAD USANDO APENAS COLUNAS QUE EXISTEM
            const payload: any = {
                name: formData.name,
                content_type: formData.type,
                description: formData.description,
                thumbnail_url: finalCoverUrl,
                attachments: finalAttachments, // ✅ Campo jsonb correto
                is_active: true
            };

            // Definir campos com base no tipo
            if (['video_youtube', 'video_vimeo', 'pdf_drive', 'website'].includes(formData.type)) {
                payload.video_url = formData.url;
                payload.embed_code = finalEmbedCode;
                payload.file_url = null;
            } else if (['video_panda', 'html'].includes(formData.type)) {
                payload.embed_code = formData.embedCode;
                payload.video_url = null;
                payload.file_url = null;
            } else if (formData.type === 'link') {
                payload.video_url = formData.url;
                payload.embed_code = null;
                payload.file_url = null;
            } else if (['pdf', 'audio', 'file_embed'].includes(formData.type)) {
                payload.file_url = finalFileUrl;
                payload.video_url = null;
                payload.embed_code = formData.type === 'file_embed' && finalFileUrl
                    ? `<iframe src="${finalFileUrl}" width="100%" height="100%" style="min-height: 600px;"></iframe>`
                    : null;
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
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-scale-in border border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-xl shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {lessonToEdit ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                        </h3>
                        <p className="text-sm text-slate-500">Preencha as informações do conteúdo</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <X size={24} className="text-slate-400 hover:text-slate-600" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950/50">

                    {/* Capa do Conteúdo */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                Capa do Conteúdo
                            </label>
                            <HelpCircle size={14} className="text-slate-400" />
                        </div>
                        <div className="flex justify-center">
                            {coverPreview ? (
                                <div className="relative group w-48 h-28 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                                    <img src={coverPreview} className="w-full h-full object-cover" alt="Capa" />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <Upload size={24} className="text-white" />
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-48 h-28 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                                >
                                    <Upload size={24} />
                                    <span className="text-xs font-medium">Clique para enviar</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleCoverSelect} accept="image/*" className="hidden" />
                        </div>
                    </div>

                    {/* Nome do Conteúdo */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                Nome do Conteúdo*
                            </label>
                            <HelpCircle size={14} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="Ex: Aula 01 - Introdução"
                        />
                    </div>

                    {/* Tipo de Conteúdo */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                Tipo de Conteúdo*
                            </label>
                            <HelpCircle size={14} className="text-slate-400" />
                        </div>
                        <select
                            value={formData.type}
                            onChange={(e) => {
                                setFormData({ ...formData, type: e.target.value, url: '', embedCode: '' });
                                setContentFile(null);
                                setContentFileName(null);
                                setUrlValid(null);
                                setPreviewEmbed(null);
                            }}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                        >
                            <option value="" disabled>Selecione o tipo de conteúdo</option>
                            {contentTypes.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                        {currentType.description && (
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                <currentType.icon size={12} />
                                {currentType.description}
                            </p>
                        )}
                    </div>

                    {/* Campo dinâmico baseado no tipo */}
                    <div className="animate-fade-in">
                        {/* URL Field (YouTube, Vimeo, Link, Website, PDF Drive) */}
                        {currentType.field === 'url' && (
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-2">
                                    {currentType.id === 'link' ? 'Link Externo*' : 'URL do Conteúdo*'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        className={`w-full px-4 py-3 pr-10 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${urlValid === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' :
                                            urlValid === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' :
                                                'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                                            }`}
                                        placeholder={currentType.placeholder}
                                    />
                                    {urlValid === true && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                            <Play size={18} />
                                        </div>
                                    )}
                                    {urlValid === false && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs font-medium">
                                            Inválido
                                        </div>
                                    )}
                                </div>

                                {/* Preview do Embed */}
                                {previewEmbed && ['video_youtube', 'video_vimeo'].includes(formData.type) && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black">
                                        <div className="aspect-video" dangerouslySetInnerHTML={{ __html: previewEmbed }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Embed Field (Panda, HTML) */}
                        {currentType.field === 'embed' && (
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-2">
                                    Código Embed*
                                </label>
                                <textarea
                                    value={formData.embedCode}
                                    onChange={(e) => setFormData({ ...formData, embedCode: e.target.value })}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none h-32 font-mono resize-none transition-all"
                                    placeholder={currentType.placeholder}
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    💡 Cole o código &lt;iframe&gt; ou HTML fornecido pela plataforma
                                </p>
                            </div>
                        )}

                        {/* File Field (PDF, Audio, File Embed) */}
                        {currentType.field === 'file' && (
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-2">
                                    {formData.type === 'audio' ? 'Arquivo de Áudio*' : 'Arquivo*'}
                                </label>
                                <div
                                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 cursor-pointer hover:border-blue-500 transition-all group"
                                    onClick={() => contentFileInputRef.current?.click()}
                                >
                                    {formData.type === 'audio' ? (
                                        <Music className="w-10 h-10 text-slate-300 group-hover:text-blue-500 mb-3 transition-colors" />
                                    ) : (
                                        <FileText className="w-10 h-10 text-slate-300 group-hover:text-blue-500 mb-3 transition-colors" />
                                    )}

                                    {contentFileName ? (
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            {contentFileName}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-slate-500 mb-2">
                                            Arraste ou clique para selecionar
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                    >
                                        Escolher Arquivo
                                    </button>

                                    <input
                                        type="file"
                                        ref={contentFileInputRef}
                                        onChange={handleContentFileSelect}
                                        accept={getAcceptedFileTypes()}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Descrição com Editor Rico */}
                    <div className="quill-wrapper">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-2">
                            Descrição / Texto Adicional
                        </label>
                        <p className="text-xs text-slate-500 mb-3">
                            Texto adicional que será exibido junto com o conteúdo principal
                        </p>
                        <ReactQuill
                            theme="snow"
                            value={formData.description}
                            onChange={(value) => setFormData({ ...formData, description: value })}
                            modules={quillModules}
                            className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden"
                            placeholder="Adicione notas, instruções ou informações complementares..."
                        />

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
                                min-height: 100px;
                                font-size: 0.875rem;
                            }
                            .quill-wrapper .ql-editor {
                                min-height: 80px;
                            }
                            .quill-wrapper .ql-editor.ql-blank::before {
                                font-style: normal;
                                color: #94a3b8;
                            }
                            
                            /* Dark Mode */
                            .dark .quill-wrapper .ql-toolbar {
                                background-color: #0f172a;
                                border-color: #1e293b;
                            }
                            .dark .quill-wrapper .ql-container {
                                border-color: #1e293b;
                                color: #e2e8f0;
                            }
                            .dark .quill-wrapper .ql-editor {
                                color: #e2e8f0;
                            }
                            .dark .quill-wrapper .ql-stroke { stroke: #94a3b8; }
                            .dark .quill-wrapper .ql-fill { fill: #94a3b8; }
                            .dark .quill-wrapper .ql-picker { color: #94a3b8; }
                            .dark .quill-wrapper .ql-picker-options { 
                                background-color: #0f172a; 
                                border-color: #1e293b; 
                            }
                        `}</style>
                    </div>

                    {/* Anexos */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-2">
                            Anexos
                        </label>
                        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <Paperclip size={20} className="text-slate-400" />
                            <p className="flex-1 text-sm text-slate-500 truncate">
                                {attachmentName || "Nenhum anexo adicionado"}
                            </p>
                            <button
                                onClick={() => attachmentInputRef.current?.click()}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Escolher Arquivo
                            </button>
                            <input
                                type="file"
                                ref={attachmentInputRef}
                                onChange={handleAttachmentSelect}
                                className="hidden"
                            />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-white dark:bg-slate-900 rounded-b-xl shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={loading}
                        className="px-8 py-3 text-sm font-semibold"
                    >
                        {lessonToEdit ? 'Salvar Alterações' : 'Criar Conteúdo'}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateLessonModal;