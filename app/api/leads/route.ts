import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const funnel = searchParams.get('funnel');
  const search = searchParams.get('search');

  const board = searchParams.get('board');

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (funnel) query = query.eq('funnel', funnel);

  // Filtro por board — usa funnel + tag para isolar Pilar e Revora
  if (board === 'revora') {
    // Revora: funnel='revora' OU tag 'aplicacao-direta' (cobre fallback pré-migration)
    query = query.or(`funnel.eq.revora,tags.cs.{"aplicacao-direta"}`);
  } else if (board === 'pilar') {
    // Pilar: funnels Pilar E não tem tag 'aplicacao-direta'
    query = query
      .in('funnel', ['perpetuo', 'low-ticket', 'low2'])
      .not('tags', 'cs', '{"aplicacao-direta"}');
  }

  if (search) {
    query = query.or(
      `nome.ilike.%${search}%,telefone.ilike.%${search}%,origem.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  if (!body.nome?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        nome:         body.nome.trim(),
        telefone:     body.telefone ?? '',
        tags:         body.tags ?? [],
        origem:       body.origem ?? '',
        funnel:       body.funnel ?? 'perpetuo',
        coluna:       body.coluna ?? 'novo-lead',
        data_entrada: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
