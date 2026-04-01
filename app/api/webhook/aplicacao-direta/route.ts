import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Webhook — Board Revora (Aplicação Direta)
 * Extrai apenas nome e telefone. Tag: aplicacao-direta.
 * Coluna: novo-lead (já aceita pelo DB).
 * Funil: tenta 'revora', cai para 'perpetuo' se constraint não migrado,
 *        cai para 'low-ticket' se perpetuo também não funcionar.
 * O board Revora filtra por tag 'aplicacao-direta' independente do funil salvo.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    let body: Record<string, unknown> = {};
    const contentType = request.headers.get('content-type') || '';
    const text = await request.text();

    try {
      body = JSON.parse(text);
    } catch {
      if (contentType.includes('application/x-www-form-urlencoded')) {
        body = Object.fromEntries(new URLSearchParams(text));
      }
    }

    console.log('[webhook/aplicacao-direta] payload recebido:', JSON.stringify(body, null, 2));

    // Extrai nome — tenta campos comuns e objetos aninhados (buyer, customer, contact)
    const nested = [body.buyer, body.customer, body.contact, body.data, body.lead]
      .filter(o => o && typeof o === 'object' && !Array.isArray(o)) as Record<string, unknown>[];

    const findStr = (obj: Record<string, unknown>, keys: string[]) => {
      for (const k of keys) {
        const v = obj[k];
        if (v && typeof v === 'string' && v.trim()) return v.trim();
      }
      return '';
    };

    const nameKeys  = ['nome','name','full_name','fullName','first_name','firstName','contact_name','buyer_name','customer_name'];
    const phoneKeys = ['telefone','phone','whatsapp','mobile','celular','fone','tel','phone_number','mobile_phone','checkout_phone'];

    const nome =
      findStr(body, nameKeys) ||
      nested.map(o => findStr(o, nameKeys)).find(v => v) ||
      (() => {
        const first = findStr(body, ['first_name','firstName']) || nested.map(o => findStr(o, ['first_name','firstName'])).find(v => v) || '';
        const last  = findStr(body, ['last_name','lastName'])   || nested.map(o => findStr(o, ['last_name','lastName'])).find(v => v)  || '';
        return first && last ? `${first} ${last}` : first || last;
      })() ||
      'Lead sem nome';

    const telefone =
      findStr(body, phoneKeys) ||
      nested.map(o => findStr(o, phoneKeys)).find(v => v) ||
      '';

    console.log('[webhook/aplicacao-direta] extraído → nome:', nome, '| telefone:', telefone);

    const base = {
      nome,
      telefone,
      tags:         ['aplicacao-direta'],
      origem:       'aplicacao-direta',
      coluna:       'novo-lead',
      data_entrada: new Date().toISOString(),
    };

    // Tenta funis em ordem até um funcionar
    const funnels = ['revora', 'perpetuo', 'low-ticket'] as const;
    let data = null;
    let lastError = null;

    for (const funnel of funnels) {
      const result = await supabase
        .from('leads')
        .insert([{ ...base, funnel }])
        .select()
        .single();

      if (!result.error) {
        data = result.data;
        console.log('[webhook/aplicacao-direta] lead criado com funnel:', funnel);
        break;
      }

      lastError = result.error;
      if (result.error.code === '23514' || result.error.message?.includes('violates check constraint')) {
        console.warn('[webhook/aplicacao-direta] funnel', funnel, 'rejeitado, tentando próximo...');
        continue;
      }

      // Erro não relacionado a constraint — para imediatamente
      console.error('[webhook/aplicacao-direta] Supabase error:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    if (!data) {
      console.error('[webhook/aplicacao-direta] todos os funnels falharam:', lastError);
      return NextResponse.json({ error: lastError?.message || 'Erro ao criar lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (err) {
    console.error('[webhook/aplicacao-direta] erro inesperado:', err);
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}
