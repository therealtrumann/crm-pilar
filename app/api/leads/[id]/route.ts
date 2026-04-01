import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Colunas novas que o DB pode ainda não aceitar via constraint
// (fallback enquanto a migration não for executada no Supabase)
const COLUNA_DB_FALLBACK: Record<string, string> = {
  'lead-low1':   'novo-lead',
  'lead-low2':   'novo-lead',
  'agendado':    'fups',
  'fup-pos-call':'fups',
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const body = await request.json();
  const updated_at = new Date().toISOString();

  let { data, error } = await supabase
    .from('leads')
    .update({ ...body, updated_at })
    .eq('id', params.id)
    .select()
    .single();

  // Se houve violação de constraint (23514) e temos fallback para a coluna, tenta novamente
  if (error && (error.code === '23514' || error.message?.includes('violates check constraint')) && body.coluna) {
    const fallbackColuna = COLUNA_DB_FALLBACK[body.coluna as string];
    if (fallbackColuna) {
      ({ data, error } = await supabase
        .from('leads')
        .update({ ...body, coluna: fallbackColuna, updated_at })
        .eq('id', params.id)
        .select()
        .single());
    }
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();

  const { error } = await supabase.from('leads').delete().eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
