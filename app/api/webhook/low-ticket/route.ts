import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Webhook — Funil Low Ticket (Low1 Express)
 * Leads recebidos aqui ganham automaticamente a tag "low1-express"
 * e são inseridos na coluna "Lead Low1".
 *
 * Compatível com payloads de: PlugLead, ActiveCampaign, RD Station,
 * LeadLovers, Kiwify, Eduzz, Monetizze, Hotmart e formulários genéricos.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractField(obj: any, keys: string[]): string {
  for (const key of keys) {
    const val = obj?.[key];
    if (val && typeof val === 'string' && val.trim()) return val.trim();
    if (val && typeof val === 'number') return String(val);
  }
  return '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractNome(body: any): string {
  // Tentativas diretas
  const direct = extractField(body, [
    'nome', 'name', 'full_name', 'fullName', 'contact_name', 'contactName',
    'first_name', 'firstName', 'lead_name', 'leadName',
    'customer_name', 'customerName', 'client_name', 'clientName',
    'subscriber_name', 'Nome', 'Name', 'NOME', 'NAME',
    'buyer_name', 'buyerName', 'contact',
  ]);
  if (direct) return direct;

  // Nomes compostos (first + last)
  const first = extractField(body, ['first_name', 'firstName', 'nome', 'name']);
  const last  = extractField(body, ['last_name', 'lastName', 'sobrenome', 'surname']);
  if (first && last) return `${first} ${last}`;
  if (first) return first;

  // Objetos aninhados comuns
  const nested = [
    body?.customer, body?.contact, body?.lead, body?.data,
    body?.buyer, body?.subscriber, body?.client, body?.user,
    body?.dados, body?.dados_cliente, body?.personal_data,
  ];
  for (const obj of nested) {
    const val = extractNome(obj);
    if (val) return val;
  }

  return '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTelefone(body: any): string {
  const direct = extractField(body, [
    'telefone', 'phone', 'whatsapp', 'mobile', 'celular', 'fone', 'tel',
    'phone_number', 'phoneNumber', 'mobile_phone', 'mobilePhone',
    'phone_mobile', 'phoneMobile', 'lead_phone', 'leadPhone',
    'customer_phone', 'customerPhone', 'client_phone', 'clientPhone',
    'buyer_phone', 'buyerPhone', 'Telefone', 'Phone', 'TELEFONE',
    'whatsapp_number', 'whatsappNumber', 'numero', 'number',
  ]);
  if (direct) return direct;

  const nested = [
    body?.customer, body?.contact, body?.lead, body?.data,
    body?.buyer, body?.subscriber, body?.client, body?.user,
    body?.dados, body?.dados_cliente, body?.personal_data,
  ];
  for (const obj of nested) {
    const val = extractTelefone(obj);
    if (val) return val;
  }

  return '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractOrigem(body: any): string {
  return extractField(body, [
    'origem', 'source', 'utm_source', 'utmSource', 'medium', 'utm_medium',
    'campaign', 'utm_campaign', 'funil', 'funnel', 'product', 'produto',
  ]) || 'webhook-low-ticket';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Suporte a JSON e application/x-www-form-urlencoded
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
        // Tenta form-urlencoded como fallback
        body = Object.fromEntries(new URLSearchParams(text));
      }
    }

    // Log completo para diagnóstico (visível nos logs da Vercel)
    console.log('[webhook/low-ticket] payload recebido:', JSON.stringify(body, null, 2));

    const nome     = extractNome(body)     || 'Lead sem nome';
    const telefone = extractTelefone(body) || '';
    const origem   = extractOrigem(body);

    console.log('[webhook/low-ticket] extraído → nome:', nome, '| telefone:', telefone, '| origem:', origem);

    const leadPayload = {
      nome,
      telefone,
      tags:         ['low1-express'],
      origem,
      funnel:       'low-ticket',
      data_entrada: new Date().toISOString(),
    };

    // Tenta inserir na coluna lead-low1; se o constraint ainda não foi migrado,
    // cai para 'novo-lead' (o frontend normaliza pela tag low1-express)
    let { data, error } = await supabase
      .from('leads')
      .insert([{ ...leadPayload, coluna: 'lead-low1' }])
      .select()
      .single();

    if (error && (error.code === '23514' || error.message?.includes('violates check constraint'))) {
      console.warn('[webhook/low-ticket] constraint não migrado, usando novo-lead como fallback');
      ({ data, error } = await supabase
        .from('leads')
        .insert([{ ...leadPayload, coluna: 'novo-lead' }])
        .select()
        .single());
    }

    if (error) {
      console.error('[webhook/low-ticket] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: data }, { status: 201 });
  } catch (err) {
    console.error('[webhook/low-ticket] erro inesperado:', err);
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }
}
