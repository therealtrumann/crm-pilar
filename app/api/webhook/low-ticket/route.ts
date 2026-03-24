import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Webhook — Funil Low Ticket
 * Leads recebidos aqui ganham automaticamente a tag "low1-express"
 * e são inseridos na coluna "Novo Lead" do funil Low Ticket.
 *
 * Campos aceitos no payload JSON:
 *   nome | name | full_name | contact_name
 *   telefone | phone | whatsapp | mobile
 *   email (ignorado, armazenado em origem)
 *   origem | source | utm_source
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const nome     = body.nome || body.name || body.full_name || body.contact_name || 'Lead sem nome';
    const telefone = body.telefone || body.phone || body.whatsapp || body.mobile || '';
    const origem   = body.origem || body.source || body.utm_source || 'webhook-low-ticket';

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          nome,
          telefone,
          tags:         ['low1-express'],
          origem,
          funnel:       'low-ticket',
          coluna:       'novo-lead',
          data_entrada: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[webhook/low-ticket] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (err) {
    console.error('[webhook/low-ticket] Parse error:', err);
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}
