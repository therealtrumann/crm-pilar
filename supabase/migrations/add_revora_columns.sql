-- Migração: Adicionar colunas Revora (agendado, fup-pos-call) e funil revora
-- Execute este SQL no Supabase SQL Editor

-- 1. Remover constraint antiga de coluna
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_coluna_check;

-- 2. Nova constraint incluindo todas as colunas (Pilar + Revora)
ALTER TABLE leads
  ADD CONSTRAINT leads_coluna_check
  CHECK (coluna IN (
    'lead-low1', 'lead-low2',
    'novo-lead',
    'agendado', 'fup-pos-call',
    'fups', 'negociacao',
    'venda-realizada', 'perdido'
  ));

-- 3. Remover constraint antiga de funil
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_funnel_check;

-- 4. Nova constraint de funil incluindo 'revora'
ALTER TABLE leads
  ADD CONSTRAINT leads_funnel_check
  CHECK (funnel IN ('perpetuo', 'low-ticket', 'low2', 'revora'));

-- 5. (Opcional) Verificação final
-- SELECT coluna, funnel, COUNT(*) FROM leads GROUP BY coluna, funnel ORDER BY funnel, coluna;
