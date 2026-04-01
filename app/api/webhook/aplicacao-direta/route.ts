import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Webhook — Board Revora (Aplicação Direta)
 *
 * Identificação no CRM: origem = 'aplicacao-direta'
 * A aba Revora filtra por esse campo — funciona independente do DB migration.
 *
 * Extrai apenas: nome e telefone.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    let body: Record<string, unknown> = {};
    const text = await request.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = Object.fromEntries(new URLSearchParams(text));
    }

    console.log('[webhook/aplicacao-direta] payload recebido:', JSON.stringify(body, null, 2));

    // Busca nome e telefone em campos diretos e em objetos aninhados (buyer, customer, etc.)
    const str = (obj: Record<string, unknown>, keys: string[]) => {
      for (const k of keys) {
        const v = obj?.[k];
        if (v && typeof v === 'string' && v.trim()) return v.trim();
      }
      return '';
    };

    const nested = [body.buyer, body.customer, body.contact, body.data, body.lead]
      .filter((o): o is Record<string, unknown> => !!o && typeof o === 'object' && !Array.isArray(o));

    const nameKeys  = ['nome','name','full_name','fullName','first_name','firstName','contact_name','buyer_name','customer_name'];
    const phoneKeys = ['telefone','phone','whatsapp','mobile','celular','fone','phone_number','mobile_phone','checkout_phone'];

    const nome =
      str(body, nameKeys) ||
      nested.map(o => str(o, nameKeys)).find(Boolean) ||
      (() => {
        const first = str(body, ['first_name','firstName']) || nested.map(o => str(o, ['first_name','firstName'])).find(Boolean) || '';
        const last  = str(body, ['last_name','lastName'])   || nested.map(o => str(o, ['last_name','lastName'])).find(Boolean)  || '';
        return first && last ? `${first} ${last}` : first || last;
      })() ||
      'Lead sem nome';

    const telefone =
      str(body, phoneKeys) ||
      nested.map(o => str(o, phoneKeys)).find(Boolean) ||
      '';

    console.log('[webhook/aplicacao-direta] extraído → nome:', nome, '| telefone:', telefone);

    const { data, error } = await supabase
      .from('leads')
      .insert([{
        nome,
        telefone,
        tags:         ['aplicacao-direta'],
        origem:       'aplicacao-direta',   // chave de roteamento para aba Revora
        funnel:       'perpetuo',           // aceito pelo DB sem migration
        coluna:       'novo-lead',
        data_entrada: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('[webhook/aplicacao-direta] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[webhook/aplicacao-direta] lead criado:', data.id);
    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (err) {
    console.error('[webhook/aplicacao-direta] erro inesperado:', err);
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}
