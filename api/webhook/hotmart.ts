import type { NextRequest } from 'next/server';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: NextRequest) {
    const SUPABASE_WEBHOOK = 'https://wgfgjznkrbwfqadnmkgv.supabase.co/functions/v1/hotmart-webhook';

    try {
        const body = await req.text();

        const response = await fetch(SUPABASE_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });

        const data = await response.text();

        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Proxy error' }),
            { status: 500 }
        );
    }
}