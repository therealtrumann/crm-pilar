import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Webhook — Board Revora (Aplicação Direta)
 * Leads recebidos ganham automaticamente a tag "aplicacao-direta"
 * e são inseridos na coluna "Novos Leads" do board Revora.
 *
 * Campos aceitos no payload JSON:
 *   nome | name | full_name | contact_name
 *   telefone | phone | whatsapp | mobile
 *   origem | source | utm_source
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    let body: Record<string, unknown>;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = Object.fromEntries(new URLSearchParams(text));
      }
    }

    console.log('[webhook/aplicacao-direta] payload recebido:', JSON.stringify(body, null, 2));

    // Extração flexível de campos (estruturas planas e aninhadas)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pick = (obj: any, keys: string[]): string => {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return '';
      for (const k of keys) {
        const v = obj[k];
        if (v && typeof v === 'string' && v.trim()) return v.trim();
        if (v && typeof v === 'number') return String(v);
      }
      return '';
    };

    const nameKeys  = ['nome','name','full_name','fullName','first_name','firstName','contact_name','lead_name','buyer_name','customer_name','client_name'];
    const phoneKeys = ['telefone','phone','whatsapp','mobile','celular','fone','tel','phone_number','mobile_phone','checkout_phone','whatsapp_number'];
    const nested    = [body.data, body.buyer, body.customer, body.contact, body.lead, body.dados].filter(
      o => o && typeof o === 'object' && !Array.isArray(o)
    ) as Record<string, unknown>[];

    const nome = (
      pick(body, nameKeys) ||
      nested.map(o => pick(o, nameKeys)).find(v => v) ||
      (() => {
        const first = pick(body, ['first_name','firstName']) || nested.map(o => pick(o, ['first_name','firstName'])).find(v => v) || '';
        const last  = pick(body, ['last_name','lastName'])   || nested.map(o => pick(o, ['last_name','lastName'])).find(v => v)  || '';
        return first && last ? `${first} ${last}` : first || last;
      })()
    ) || 'Lead sem nome';

    const telefone =
      pick(body, phoneKeys) ||
      nested.map(o => pick(o, phoneKeys)).find(v => v) ||
      '';

    const origem =
      pick(body, ['origem','source','utm_source','utm_medium','campaign']) ||
      'webhook-aplicacao-direta';

    console.log('[webhook/aplicacao-direta] extraído → nome:', nome, '| telefone:', telefone);

    const { data, error } = await supabase
      .from('leads')
      .insert([{
        nome,
        telefone,
        tags:         ['aplicacao-direta'],
        origem,
        funnel:       'revora',
        coluna:       'novo-lead',
        data_entrada: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('[webhook/aplicacao-direta] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (err) {
    console.error('[webhook/aplicacao-direta] erro inesperado:', err);
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}
