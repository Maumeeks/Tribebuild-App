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

                // LÓGICA HÍBRIDA: Slug ou Domínio Personalizado
                const hostname = window.location.hostname;
                const isCustomDomain = !hostname.includes('tribebuild.pro') && !hostname.includes('localhost');

                if (appSlug) {
                    // Cenário 1: Acesso via subdomínio (app.tribebuild.pro/aviao)
                    query = query.eq('slug', appSlug);
                } else if (isCustomDomain) {
                    // Cenário 2: Acesso via domínio próprio
                    query = query.eq('custom_domain', hostname);
                } else {
                    setLoading(false);
                    return;
                }

                const { data: app, error } = await query.single();

                if (error || !app) {
                    setLoading(false);
                    return;
                }

                // --- MÁGICA DE IDENTIDADE ---

                // 1. Título da Aba
                document.title = app.name;

                // 2. Título do App no iOS (IMPORTANTE: Isso define o nome ao salvar na tela de início)
                let metaAppleTitle = document.querySelector("meta[name='apple-mobile-web-app-title']");
                if (!metaAppleTitle) {
                    metaAppleTitle = document.createElement('meta');
                    metaAppleTitle.setAttribute('name', 'apple-mobile-web-app-title');
                    document.head.appendChild(metaAppleTitle);
                }
                metaAppleTitle.setAttribute('content', app.name);

                // 3. Ícones (Favicon + iPhone)
                const iconUrl = app.logo_url || '/favicon.png';

                // Remove TODOS os ícones antigos para evitar cache ou duplicação
                document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
                document.querySelectorAll("link[rel='apple-touch-icon']").forEach(el => el.remove());

                // Injeta Novo Favicon (Navegador)
                const linkIcon = document.createElement('link');
                linkIcon.rel = 'icon';
                linkIcon.type = 'image/png';
                linkIcon.href = iconUrl;
                document.head.appendChild(linkIcon);

                // Injeta Novo Ícone Apple (Tela de Início)
                const appleLink = document.createElement('link');
                appleLink.rel = 'apple-touch-icon';
                appleLink.href = iconUrl;
                document.head.appendChild(appleLink);

                // 4. Manifesto Android (Nome e Cor do Cliente na instalação)
                const dynamicManifest = {
                    name: app.name,
                    short_name: app.name,
                    description: app.description || `App oficial ${app.name}`,
                    start_url: location.pathname, // Usa a rota atual exata (ex: /aviao/login)
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

                document.querySelector("link[rel='manifest']")?.remove();
                const newManifest = document.createElement('link');
                newManifest.rel = 'manifest';
                newManifest.href = manifestURL;
                document.head.appendChild(newManifest);

                // 5. Cor do Tema (Mobile Status Bar)
                let metaTheme = document.querySelector("meta[name='theme-color']");
                if (metaTheme) {
                    metaTheme.setAttribute('content', app.primary_color || '#0066FF');
                }

            } catch (error) {
                console.error("Erro identidade:", error);
            } finally {
                setLoading(false);
            }
        };

        updateAppIdentity();
    }, [appSlug, location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-white/20" />
            </div>
        );
    }

    return <Outlet />;
}