import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; // Importante para o visual funcionar
import { X, Check, ZoomIn } from 'lucide-react';
import { getCroppedImg } from '../../lib/canvasUtils'; // Importe sua função aqui

// Função auxiliar para centralizar o corte inicial
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

interface ImageCropperModalProps {
    imageSrc: string;
    onClose: () => void;
    onCropComplete: (croppedFile: File) => void;
}

export default function ImageCropperModal({ imageSrc, onClose, onCropComplete }: ImageCropperModalProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);
    const [loading, setLoading] = useState(false);

    // Carrega o corte inicial centralizado assim que a imagem carrega
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1)); // Aspect 1 = Quadrado
    }

    const handleSave = async () => {
        if (completedCrop && imgRef.current) {
            setLoading(true);
            try {
                // Usa sua função getCroppedImg que já redimensiona para 400x400
                const file = await getCroppedImg(imgRef.current, completedCrop, 'post-image.jpg');
                if (file) onCropComplete(file);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide flex items-center gap-2">
                        <ZoomIn className="w-4 h-4 text-brand-blue" /> Ajustar Imagem
                    </h3>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Área de Crop (Scrollável se a img for gigante) */}
                <div className="flex-1 overflow-auto bg-slate-100 dark:bg-black p-4 flex items-center justify-center">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1} // Força quadrado
                        className="rounded-lg shadow-lg"
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop me"
                            onLoad={onImageLoad}
                            className="max-w-full max-h-[60vh] object-contain"
                        />
                    </ReactCrop>
                </div>

                {/* Footer Ações */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold uppercase rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        {loading ? 'Processando...' : <><Check className="w-4 h-4" /> Confirmar</>}
                    </button>
                </div>
            </div>
        </div>
    );
}