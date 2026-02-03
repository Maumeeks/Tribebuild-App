import React, { useEffect, useState, useRef } from 'react'; // Adicionei useRef
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function StudentLayout() {
    const { appSlug } = useParams<{ appSlug: string }>();
    const [loading, setLoading] = useState(true);
    // Armazenamos os dados do app para não buscar de novo
    const [appData, setAppData] = useState<any>(null);
    const location = useLocation();

    // Controle para evitar refetch desnecessário
    const lastFetchedSlug = useRef<string>('');

    // EFEITO 1: Busca dados pesados (SÓ RODA SE MUDAR DE APP)
    useEffect(() => {
        const fetchAppIdentity = async () => {
            // Se já buscamos os dados deste app, não busca de novo!
            if (lastFetchedSlug.current === appSlug && appData) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                let query = supabase.from('apps').select('name, logo, primary_color, description, custom_domain, slug');

                const hostname = window.location.hostname;
                const isCustomDomain = !hostname.includes('tribebuild.pro') && !hostname.includes('localhost');

                if (appSlug) {
                    query = query.eq('slug', appSlug);
                } else if (isCustomDomain) {
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

                setAppData(app); // Salva no estado
                lastFetchedSlug.current = appSlug || ''; // Marca como visto

                // Define estilos globais uma única vez
                document.title = app.name;

                // Tema
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

        fetchAppIdentity();
    }, [appSlug]); // 🚨 REMOVIDO location.pathname DAQUI

    // EFEITO 2: Atualiza Meta Tags e Manifesto (RODA NA NAVEGAÇÃO, MAS SEM LOADING)
    useEffect(() => {
        if (!appData) return;

        // Atualiza Manifesto e Meta Tags dinamicamente sem bloquear a UI
        const updateMeta = () => {
            // 2. Título do App no iOS
            let metaAppleTitle = document.querySelector("meta[name='apple-mobile-web-app-title']");
            if (!metaAppleTitle) {
                metaAppleTitle = document.createElement('meta');
                metaAppleTitle.setAttribute('name', 'apple-mobile-web-app-title');
                document.head.appendChild(metaAppleTitle);
            }
            metaAppleTitle.setAttribute('content', appData.name);

            // 3. Ícones
            const iconUrl = appData.logo || '/favicon.png';

            // Nota: Evitamos remover e readicionar ícones repetidamente para não piscar no Safari
            // Apenas garantimos que estão lá se necessário, ou atualizamos se mudou

            // 4. Manifesto Dinâmico
            const dynamicManifest = {
                name: appData.name,
                short_name: appData.name,
                description: appData.description || `App oficial ${appData.name}`,
                start_url: location.pathname, // Atualiza a URL de início para onde o usuário está
                display: "standalone",
                background_color: "#0f172a",
                theme_color: appData.primary_color || "#0066FF",
                icons: [
                    { src: iconUrl, sizes: "192x192", type: "image/png" },
                    { src: iconUrl, sizes: "512x512", type: "image/png" }
                ]
            };

            const stringManifest = JSON.stringify(dynamicManifest);
            const blob = new Blob([stringManifest], { type: 'application/json' });
            const manifestURL = URL.createObjectURL(blob);

            const oldLink = document.querySelector("link[rel='manifest']");
            if (oldLink) oldLink.remove();

            const newManifest = document.createElement('link');
            newManifest.rel = 'manifest';
            newManifest.href = manifestURL;
            document.head.appendChild(newManifest);
        };

        updateMeta();
    }, [location.pathname, appData]); // Roda quando navega, mas usa dados já carregados

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-white/20" />
            </div>
        );
    }

    return <Outlet context={{ appData }} />;
}