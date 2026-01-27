import type { NextRequest } from 'next/server';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: NextRequest) {
    // URL da Edge Function do Supabase
    const SUPABASE_WEBHOOK = 'https://wgfgjznkrbwfqadnmkgv.supabase.co/functions/v1/kiwify-webhook';

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Pegar o body da requisição
        const body = await req.text();

        console.log('[API Proxy] Recebendo webhook da Kiwify...');

        // Fazer proxy para o Supabase
        const response = await fetch(SUPABASE_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });

        const data = await response.text();

        console.log('[API Proxy] Resposta do Supabase:', response.status);

        return new Response(data, {
            status: response.status,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('[API Proxy] Erro:', error);

        return new Response(
            JSON.stringify({ error: 'Proxy error', details: error instanceof Error ? error.message : 'Unknown' }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                }
            }
        );
    }
}