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
                    // Cenário 1: Acesso via subdomínio (app.tribebuild.pro/janice)
                    query = query.eq('slug', appSlug);
                } else if (isCustomDomain) {
                    // Cenário 2: Acesso via domínio próprio (docinhosdajanice.site)
                    // O appSlug vem vazio, então buscamos pelo domínio
                    query = query.eq('custom_domain', hostname);
                } else {
                    // Não é app de aluno (pode ser a home do tribebuild), não faz nada
                    setLoading(false);
                    return;
                }

                const { data: app, error } = await query.single();

                if (error || !app) {
                    // Se não achou app, segue a vida (usa o default do index.html)
                    setLoading(false);
                    return;
                }

                // --- MÁGICA DE IDENTIDADE ---
                // 1. Título
                document.title = app.name;

                // 2. Ícones (Favicon + iPhone)
                const iconUrl = app.logo_url || '/favicon.png';

                // Remove ícones antigos (arranca o TribeBuild)
                document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());

                // Injeta Ícone do Cliente
                const linkIcon = document.createElement('link');
                linkIcon.rel = 'icon';
                linkIcon.href = iconUrl;
                document.head.appendChild(linkIcon);

                const appleLink = document.createElement('link');
                appleLink.rel = 'apple-touch-icon';
                appleLink.href = iconUrl;
                document.head.appendChild(appleLink);

                // 3. Manifesto Android (Nome e Cor do Cliente na instalação)
                const dynamicManifest = {
                    name: app.name,
                    short_name: app.name,
                    description: app.description || `App oficial ${app.name}`,
                    start_url: window.location.pathname, // Usa a rota atual para garantir
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

                // 4. Cor do Tema (Mobile Status Bar)
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
    }, [appSlug, location.pathname]); // Executa sempre que mudar o slug ou a rota

    if (loading) {
        // Tela preta limpa enquanto troca a identidade para não piscar o logo errado
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-white/20" />
            </div>
        );
    }

    return <Outlet />;
}