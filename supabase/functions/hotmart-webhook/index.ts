import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const payload = await req.json();
        console.log('[Hotmart] Webhook recebido:', payload.event);

        // Extrair dados
        const event = payload.event;
        const productId = payload.data?.product?.id?.toString();
        const buyerEmail = payload.data?.buyer?.email;
        const buyerName = payload.data?.buyer?.name;

        if (!productId || !buyerEmail) {
            throw new Error('Dados incompletos no webhook');
        }

        console.log(`[Hotmart] Produto: ${productId}, Email: ${buyerEmail}`);

        // Buscar produtos com este external_id
        const { data: products, error: productsError } = await supabaseAdmin
            .from('products')
            .select('id, name, app_id, user_id')
            .or(`external_id.eq.${productId},external_id.like.%${productId}%`)
            .eq('is_active', true);

        if (productsError) throw productsError;
        if (!products || products.length === 0) {
            console.log('[Hotmart] Nenhum produto encontrado');
            return new Response(
                JSON.stringify({ error: 'Produto não encontrado', productId }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`[Hotmart] ${products.length} produto(s) encontrado(s)`);

        // Pegar o app_id do primeiro produto
        const mainProduct = products[0];
        const appId = mainProduct.app_id;

        if (!appId) {
            console.error('[Hotmart] ERRO: Produto sem app_id!');
            throw new Error('Produto não está vinculado a um app');
        }

        // Verificar se cliente já existe
        let client;
        const { data: existingClient } = await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('email', buyerEmail)
            .eq('app_id', appId)
            .single();

        if (existingClient) {
            console.log('[Hotmart] Cliente já existe:', buyerEmail);
            client = existingClient;
        } else {
            // Criar novo cliente vinculado ao app
            const { data: newClient, error: clientError } = await supabaseAdmin
                .from('clients')
                .insert({
                    email: buyerEmail,
                    name: buyerName,
                    source: 'hotmart',
                    status: 'active',
                    app_id: appId, // ✅ VINCULA AO APP DO PRODUTO
                })
                .select()
                .single();

            if (clientError) throw clientError;
            console.log('[Hotmart] Novo aluno criado:', buyerEmail);
            client = newClient;
        }

        // Liberar acesso aos produtos
        const accessesGranted = [];
        for (const product of products) {
            // Verificar se já tem acesso
            const { data: existingAccess } = await supabaseAdmin
                .from('client_products')
                .select('id')
                .eq('client_id', client.id)
                .eq('product_id', product.id)
                .single();

            if (!existingAccess) {
                const { error: accessError } = await supabaseAdmin
                    .from('client_products')
                    .insert({
                        client_id: client.id,
                        product_id: product.id,
                        status: 'active',
                        granted_by: 'hotmart',
                    });

                if (accessError) {
                    console.error('[Hotmart] Erro ao liberar acesso:', accessError);
                } else {
                    console.log('[Hotmart] Acesso liberado:', product.name);
                    accessesGranted.push(product.name);
                }
            }
        }

        // Buscar e liberar bônus
        const productIds = products.map(p => p.id);
        const { data: bonuses } = await supabaseAdmin
            .from('products')
            .select('id, name')
            .in('parent_product_id', productIds)
            .eq('is_active', true);

        if (bonuses && bonuses.length > 0) {
            for (const bonus of bonuses) {
                const { data: existingBonusAccess } = await supabaseAdmin
                    .from('client_products')
                    .select('id')
                    .eq('client_id', client.id)
                    .eq('product_id', bonus.id)
                    .single();

                if (!existingBonusAccess) {
                    await supabaseAdmin
                        .from('client_products')
                        .insert({
                            client_id: client.id,
                            product_id: bonus.id,
                            status: 'active',
                            granted_by: 'hotmart',
                        });

                    console.log('[Hotmart] Bônus liberado:', bonus.name);
                    accessesGranted.push(`Bônus - ${bonus.name}`);
                }
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Webhook processado com sucesso',
                email: buyerEmail,
                products_processed: accessesGranted.length,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('[Hotmart] Erro:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});