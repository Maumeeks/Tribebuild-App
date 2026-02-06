import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, ZoomIn, Loader2, Move, Maximize2 } from 'lucide-react';
import { getCroppedImg } from '../../lib/canvasUtils';

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

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }

    const handleSave = async () => {
        if (completedCrop && imgRef.current) {
            setLoading(true);
            try {
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
        // CAMADA 1: Fundo Escuro com Blur (Centraliza o Modal)
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">

            {/* CAMADA 2: O Card do Modal (Com limite de tamanho) */}
            <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-200">

                {/* Header Premium */}
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Maximize2 className="w-4 h-4 text-brand-blue" /> Ajustar Corte
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-slate-400 hover:bg-red-900/20 hover:text-red-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Área de Edição (Com scroll se necessário, mas travada) */}
                <div className="flex-1 bg-black/50 relative overflow-hidden flex items-center justify-center p-6 select-none">
                    {/* Fundo Xadrez para profissionalismo */}
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />

                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1} // Quadrado Fixo
                        className="shadow-2xl rounded-sm ring-1 ring-white/10"
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Edit"
                            onLoad={onImageLoad}
                            // IMPORTANTE: Isso impede que imagens verticais estourem a tela
                            className="max-h-[50vh] w-auto object-contain"
                        />
                    </ReactCrop>

                    {/* Badge flutuante */}
                    <div className="absolute bottom-4 bg-black/70 backdrop-blur text-white/70 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 flex items-center gap-2 pointer-events-none">
                        <Move className="w-3 h-3" /> Arraste e Zoom
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2.5 bg-brand-blue hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wide rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>Confirmar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}