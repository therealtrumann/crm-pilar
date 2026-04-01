import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Webhook — Funil Low2 Viagens
 * Leads recebidos aqui ganham automaticamente a tag "low2-viagens"
 * e são inseridos na coluna "Lead Low2".
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
    const origem   = body.origem || body.source || body.utm_source || 'webhook-low2-viagens';

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          nome,
          telefone,
          tags:         ['low2-viagens'],
          origem,
          funnel:       'low2',
          coluna:       'lead-low2',
          data_entrada: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[webhook/low2] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (err) {
    console.error('[webhook/low2] Parse error:', err);
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}
