-- Migração: Adicionar colunas Lead Low1, Lead Low2 e funil low2
-- Execute este SQL no Supabase SQL Editor

-- 1. Remover constraint antiga de coluna
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_coluna_check;

-- 2. Adicionar nova constraint com as colunas extras
ALTER TABLE leads
  ADD CONSTRAINT leads_coluna_check
  CHECK (coluna IN ('lead-low1', 'lead-low2', 'novo-lead', 'fups', 'negociacao', 'venda-realizada', 'perdido'));

-- 3. Remover constraint antiga de funil
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_funnel_check;

-- 4. Adicionar nova constraint de funil incluindo 'low2'
ALTER TABLE leads
  ADD CONSTRAINT leads_funnel_check
  CHECK (funnel IN ('perpetuo', 'low-ticket', 'low2'));

-- 5. Migrar leads antigos: quem tem tag 'low1-express' vai para 'lead-low1'
UPDATE leads
SET    coluna = 'lead-low1',
       funnel = 'low-ticket',
       updated_at = NOW()
WHERE  'low1-express' = ANY(tags)
  AND  coluna = 'novo-lead';

-- 6. (Opcional) Verificação: conferir quantos leads foram migrados por coluna
-- SELECT coluna, COUNT(*) FROM leads GROUP BY coluna ORDER BY coluna;
