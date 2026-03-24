import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Webhook — Funil Perpétuo (PlugLead)
 * Configure este URL como destino no PlugLead:
 *   https://webhook.pluglead.com/webhook/a40dc6fa-aa9d-46e9-a267-ddc8ae8ee982
 *
 * Leads recebidos ganham automaticamente a tag "lead-perpetuo"
 * e são inseridos na coluna "Novo Lead" do funil Perpétuo.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const nome     = body.nome || body.name || body.full_name || body.contact_name || 'Lead sem nome';
    const telefone = body.telefone || body.phone || body.whatsapp || body.mobile || '';
    const origem   = body.origem || body.source || 'pluglead';

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          nome,
          telefone,
          tags:         ['lead-perpetuo'],
          origem,
          funnel:       'perpetuo',
          coluna:       'novo-lead',
          data_entrada: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[webhook/perpetuo] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (err) {
    console.error('[webhook/perpetuo] Parse error:', err);
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}
