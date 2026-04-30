-- Migração: Adicionar coluna "Abordado" entre Lead Low1/Low2 e Lead Perpétuo
-- Execute este SQL no Supabase SQL Editor

-- 1. Remover constraint antiga de coluna
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_coluna_check;

-- 2. Nova constraint incluindo 'abordado'
ALTER TABLE leads
  ADD CONSTRAINT leads_coluna_check
  CHECK (coluna IN (
    'lead-low1', 'lead-low2',
    'abordado',
    'novo-lead',
    'agendado', 'fup-pos-call',
    'fups', 'negociacao',
    'venda-realizada', 'perdido'
  ));
