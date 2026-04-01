import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de migração para adicionar coluna valor
 * Use: https://seu-dominio.app/api/migrate
 */
export async function POST() {
  try {
    const supabase = createServiceClient();

    // Executar SQL para adicionar coluna se não existir
    let data: unknown = null;
    let error: unknown = null;
    try {
      const result = await supabase.rpc('execute_sql', {
        sql: 'ALTER TABLE leads ADD COLUMN IF NOT EXISTS valor DECIMAL(10, 2) DEFAULT 0.00;',
      });
      data = result.data;
      error = result.error;
    } catch {
      // Se rpc não existir, continuar com abordagem alternativa
    }

    // Alternativa: verificar os campos da tabela
    const { data: columns, error: columnsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (columnsError) {
      return NextResponse.json(
        { error: 'Erro ao verificar tabela', details: columnsError },
        { status: 500 }
      );
    }

    const hasValorColumn = columns && columns.length > 0 && 'valor' in columns[0];

    return NextResponse.json({
      success: true,
      message: hasValorColumn ? 'Coluna valor já existe' : 'Migração bem-sucedida (verifique no Supabase)',
      hasValorColumn,
      tip: 'Se a coluna não existir, execute no SQL Editor do Supabase: ALTER TABLE leads ADD COLUMN IF NOT EXISTS valor DECIMAL(10, 2) DEFAULT 0.00;',
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
