import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, BookOpen, Users, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavProps {
    primaryColor?: string;
}

export default function BottomNavigation({ primaryColor = '#0066FF' }: BottomNavProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { appSlug } = useParams();

    const navItems = [
        { label: 'Início', icon: Home, path: `/${appSlug}/home` },
        { label: 'Feed', icon: BookOpen, path: `/${appSlug}/feed` }, // Ajuste se a rota for 'products' ou 'feed'
        { label: 'Comunidade', icon: Users, path: `/${appSlug}/community` },
        { label: 'Perfil', icon: User, path: `/${appSlug}/profile` },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            {/* Container Limitado para Desktop (para não esticar) */}
            <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 pb-safe pt-2 px-6 shadow-2xl">
                <div className="flex justify-between items-center h-16">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className="group flex flex-col items-center justify-center gap-1.5 w-16 relative"
                            >
                                {/* Indicador de Ativo (Glow) */}
                                {isActive && (
                                    <div
                                        className="absolute -top-2 w-8 h-1 rounded-b-full shadow-[0_0_10px_currentColor] transition-all duration-300"
                                        style={{ backgroundColor: primaryColor, color: primaryColor }}
                                    />
                                )}

                                <Icon
                                    size={22}
                                    className={cn(
                                        "transition-all duration-300",
                                        isActive ? "scale-110" : "text-slate-500 group-hover:text-slate-300"
                                    )}
                                    style={{ color: isActive ? primaryColor : undefined }}
                                    // Se não estiver ativo, usa cor padrão slate-500
                                    strokeWidth={isActive ? 2.5 : 2}
                                />

                                <span
                                    className={cn(
                                        "text-[9px] font-bold uppercase tracking-wider transition-colors",
                                        isActive ? "text-white" : "text-slate-600"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}