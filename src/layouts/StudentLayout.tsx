// src/layouts/StudentLayout.tsx
import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function StudentLayout() {
    const { appSlug } = useParams<{ appSlug: string }>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const updateAppIdentity = async () => {
            if (!appSlug) return;

            try {
                // 1. Busca os dados do App (Logo, Nome, Cor)
                const { data: app } = await supabase
                    .from('apps')
                    .select('name, logo_url, primary_color, description')
                    .eq('slug', appSlug)
                    .single();

                if (app) {
                    // --- A. ATUALIZA TÍTULO DA ABA ---
                    document.title = app.name;

                    // --- B. ATUALIZA ÍCONES (FAVICON E IOS) ---
                    const iconUrl = app.logo_url || '/favicon.ico'; // Fallback

                    // Atualiza Favicon (Navegador Desktop/Android)
                    let linkIcon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                    if (!linkIcon) {
                        linkIcon = document.createElement('link');
                        linkIcon.rel = 'icon';
                        document.head.appendChild(linkIcon);
                    }
                    linkIcon.href = iconUrl;

                    // Atualiza Apple Touch Icon (iPhone - Tela Inicial)
                    let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
                    if (!appleLink) {
                        appleLink = document.createElement('link');
                        appleLink.rel = 'apple-touch-icon';
                        document.head.appendChild(appleLink);
                    }
                    appleLink.href = iconUrl;

                    // --- C. MANIFESTO DINÂMICO (ANDROID - TELA INICIAL) ---
                    // Isso faz o Android instalar o app com o Nome e Ícone do SEU CLIENTE
                    const dynamicManifest = {
                        name: app.name,
                        short_name: app.name,
                        description: app.description || `App oficial ${app.name}`,
                        start_url: `/${appSlug}/home`,
                        display: "standalone",
                        background_color: "#0f172a",
                        theme_color: app.primary_color || "#f59e0b",
                        icons: [
                            {
                                src: iconUrl,
                                sizes: "192x192",
                                type: "image/png"
                            },
                            {
                                src: iconUrl,
                                sizes: "512x512",
                                type: "image/png"
                            }
                        ]
                    };

                    const stringManifest = JSON.stringify(dynamicManifest);
                    const blob = new Blob([stringManifest], { type: 'application/json' });
                    const manifestURL = URL.createObjectURL(blob);

                    let linkManifest = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
                    if (linkManifest) {
                        linkManifest.setAttribute('href', manifestURL);
                    } else {
                        const newManifest = document.createElement('link');
                        newManifest.rel = 'manifest';
                        newManifest.href = manifestURL;
                        document.head.appendChild(newManifest);
                    }

                    // Define a cor do tema na barra do navegador mobile
                    let metaThemeColor = document.querySelector("meta[name='theme-color']");
                    if (metaThemeColor) {
                        metaThemeColor.setAttribute('content', app.primary_color || '#0f172a');
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar identidade do app:", error);
            } finally {
                setLoading(false);
            }
        };

        updateAppIdentity();
    }, [appSlug]);

    // Enquanto carrega a identidade, mostra um loading simples ou nada (para não piscar o logo antigo)
    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

    return <Outlet />;
}