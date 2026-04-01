import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Webhook — Hotmart
 * Recebe notificações de vendas da Hotmart para o produto Low Ticket
 *
 * Exemplo de payload esperado da Hotmart:
 * {
 *   "product": { "name": "Low Ticket Express", "id": "xxx" },
 *   "customer": { "name": "João Silva", "email": "joao@email.com", "phone": "11999999999" },
 *   "sale": { "date": "2024-01-15T10:30:00", "status": "approved", "price": "XX.XX" }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    // Extrair dados do payload da Hotmart
    const customer = body.customer || body.dados_cliente || {};
    const sale = body.sale || body.dados_venda || {};

    const nome = customer.name || customer.nome || body.buyer_name || 'Lead sem nome';
    const telefone = customer.phone || customer.telefone || body.buyer_phone || '';
    const origem = `hotmart - ${body.product?.name || 'venda'}`;

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          nome,
          telefone,
          tags: ['low1-express'],
          origem,
          funnel: 'low-ticket',
          coluna: 'lead-low1',
          data_entrada: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[webhook/hotmart] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (err) {
    console.error('[webhook/hotmart] Parse error:', err);
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}
