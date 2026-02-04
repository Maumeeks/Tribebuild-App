import React from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

// Traduções e conteúdo
const translations: Record<string, any> = {
    PT: {
        title: 'Como instalar o app no seu iPhone',
        step1: <>Toque no ícone de <strong>compartilhar</strong> <Share className="inline w-4 h-4 mx-1" /> na parte inferior da tela.</>,
        step2: <>Role para baixo e selecione a opção <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="inline w-4 h-4 mx-1" />.</>,
        step3: 'Toque em "Adicionar" no canto superior direito.'
    },
    ES: {
        title: 'Cómo instalar la app en tu iPhone',
        step1: <>Toca el ícono de <strong>compartir</strong> <Share className="inline w-4 h-4 mx-1" /> en la parte inferior de la pantalla.</>,
        step2: <>Desliza hacia abajo y selecciona la opción <strong>"Agregar a Pantalla de Inicio"</strong> <PlusSquare className="inline w-4 h-4 mx-1" />.</>,
        step3: 'Presiona "Agregar" en la esquina superior derecha.'
    },
    EN: {
        title: 'How to install the app on your iPhone',
        step1: <>Tap the <strong>share</strong> icon <Share className="inline w-4 h-4 mx-1" /> at the bottom of the screen.</>,
        step2: <>Scroll down and select the <strong>"Add to Home Screen"</strong> option <PlusSquare className="inline w-4 h-4 mx-1" />.</>,
        step3: 'Tap "Add" in the top right corner.'
    }
};

interface InstallTutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    language?: string;
    primaryColor: string;
}

const InstallTutorialModal: React.FC<InstallTutorialModalProps> = ({ isOpen, onClose, language = 'PT', primaryColor }) => {
    if (!isOpen) return null;

    // Garante que language nunca seja undefined e converte para maiúsculo
    const safeLang = (language || 'PT').toUpperCase();
    const t = translations[safeLang] || translations['PT'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Fundo Escuro */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Card do Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-slide-up border border-slate-800">
                {/* Botão Fechar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center leading-tight">
                        {t.title}
                    </h2>

                    {/* Passos */}
                    <div className="space-y-4 mb-6">
                        {[t.step1, t.step2, t.step3].map((step: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start">
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {idx + 1}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{step}</p>
                            </div>
                        ))}
                    </div>

                    {/* GIF (Lembre-se de ter o arquivo na pasta public) */}
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative aspect-[9/19] bg-slate-100 dark:bg-slate-800">
                        <img
                            src="/install-tutorial.gif"
                            alt="Tutorial de Instalação"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstallTutorialModal;