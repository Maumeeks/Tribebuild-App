import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, ZoomIn, Loader2, Maximize2, Move } from 'lucide-react';
import { getCroppedImg } from '../../lib/canvasUtils';

// Helper para centralizar o crop inicial
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
        // Define o crop inicial quadrado
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
        // Overlay Escuro (Backdrop) com blur alto para foco total
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">

            {/* Container do Modal */}
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header Premium */}
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Maximize2 className="w-4 h-4 text-brand-blue" /> Ajustar Enquadramento
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Arraste e ajuste o zoom para o corte perfeito.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Área de Crop (O Coração do componente) */}
                <div className="flex-1 bg-black/40 relative overflow-hidden flex items-center justify-center p-6 select-none">
                    {/* Fundo Xadrez sutil para dar ar profissional */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />

                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1} // Força Quadrado
                        className="shadow-2xl"
                        ruleOfThirds
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop area"
                            onLoad={onImageLoad}
                            // O SEGREDO ESTÁ AQUI: max-h-[60vh] impede que a imagem estoure a tela
                            className="max-h-[60vh] w-auto object-contain rounded-sm shadow-lg border border-white/10"
                        />
                    </ReactCrop>

                    {/* Dica flutuante */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 pointer-events-none">
                        <Move className="w-3 h-3 text-white/60" />
                        <span className="text-[10px] font-medium text-white/80 uppercase tracking-widest">Arraste para mover</span>
                    </div>
                </div>

                {/* Footer Ações */}
                <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-2.5 bg-brand-blue hover:bg-blue-600 active:scale-95 disabled:opacity-50 disabled:scale-100 text-white text-xs font-bold uppercase tracking-wide rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                        ) : (
                            <><Check className="w-4 h-4" /> Confirmar Corte</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}