import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Verifica se já existe um lead com o mesmo telefone em lead-low1 ou lead-low2.
 * Retorna o lead existente ou null.
 */
export async function findDuplicateLowLead(
  supabase: SupabaseClient,
  telefone: string,
) {
  if (!telefone) return null;

  const { data } = await supabase
    .from('leads')
    .select('id, nome, telefone, coluna')
    .eq('telefone', telefone)
    .in('coluna', ['lead-low1', 'lead-low2'])
    .maybeSingle();

  return data ?? null;
}
