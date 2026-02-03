import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function StudentLayout() {
    const { appSlug } = useParams<{ appSlug: string }>();
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const updateAppIdentity = async () => {
            try {
                let query = supabase.from('apps').select('name, logo_url, primary_color, description, custom_domain, slug');

                // Detecta se é acesso por domínio próprio ou subdomínio
                const hostname = window.location.hostname;
                const isCustomDomain = !hostname.includes('tribebuild.pro') && !hostname.includes('localhost');

                if (appSlug) {
                    query = query.eq('slug', appSlug);
                } else if (isCustomDomain) {
                    query = query.eq('custom_domain', hostname);
                } else {
                    // Se não tiver slug nem domínio próprio, não faz nada (home do sistema)
                    setLoading(false);
                    return;
                }

                const { data: app, error } = await query.single();

                if (error || !app) {
                    setLoading(false);
                    return;
                }

                // --- INÍCIO DA IDENTIDADE VISUAL DINÂMICA ---

                // 1. Título da Aba do Navegador
                document.title = app.name; // Vai aparecer "Zootopia" na aba

                // 2. Título do App no iOS (A tag mágica para o nome ao salvar)
                let metaAppleTitle = document.querySelector("meta[name='apple-mobile-web-app-title']");
                if (!metaAppleTitle) {
                    metaAppleTitle = document.createElement('meta');
                    metaAppleTitle.setAttribute('name', 'apple-mobile-web-app-title');
                    document.head.appendChild(metaAppleTitle);
                }
                metaAppleTitle.setAttribute('content', app.name); // Define "Zootopia"

                // 3. Ícones (Favicon + iPhone Touch Icon)
                const iconUrl = app.logo_url || '/favicon.png';

                // Remove TODOS os ícones antigos para garantir que não use o cache
                document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']").forEach(el => el.remove());

                // Cria o Favicon novo (Navegador PC)
                const linkIcon = document.createElement('link');
                linkIcon.rel = 'icon';
                linkIcon.type = 'image/png';
                linkIcon.href = iconUrl;
                document.head.appendChild(linkIcon);

                // Cria o Ícone da Apple (Tela de Início iOS)
                const appleLink = document.createElement('link');
                appleLink.rel = 'apple-touch-icon';
                appleLink.href = iconUrl;
                document.head.appendChild(appleLink);

                // 4. Manifesto Dinâmico (Para instalação Android)
                // Criamos um arquivo JSON virtual com os dados do cliente
                const dynamicManifest = {
                    name: app.name,
                    short_name: app.name,
                    description: app.description || `Acesse o app ${app.name}`,
                    start_url: location.pathname, // Salva a URL exata onde o usuário está (ex: /01/login)
                    display: "standalone",
                    background_color: "#0f172a",
                    theme_color: app.primary_color || "#0066FF",
                    icons: [
                        { src: iconUrl, sizes: "192x192", type: "image/png" },
                        { src: iconUrl, sizes: "512x512", type: "image/png" }
                    ]
                };

                const stringManifest = JSON.stringify(dynamicManifest);
                const blob = new Blob([stringManifest], { type: 'application/json' });
                const manifestURL = URL.createObjectURL(blob);

                // Remove manifesto antigo e insere o novo
                document.querySelector("link[rel='manifest']")?.remove();
                const newManifest = document.createElement('link');
                newManifest.rel = 'manifest';
                newManifest.href = manifestURL;
                document.head.appendChild(newManifest);

                // 5. Cor da Barra de Status (Mobile)
                let metaTheme = document.querySelector("meta[name='theme-color']");
                if (metaTheme) {
                    metaTheme.setAttribute('content', app.primary_color || '#0066FF');
                }

            } catch (error) {
                console.error("Erro ao carregar identidade do app:", error);
            } finally {
                setLoading(false);
            }
        };

        updateAppIdentity();
    }, [appSlug, location.pathname]);

    if (loading) {
        // Tela de carregamento enquanto troca o ícone/nome
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-white/20" />
            </div>
        );
    }

    return <Outlet />;
}