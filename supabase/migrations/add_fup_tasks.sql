-- Migração: Adicionar coluna fup_tasks para checklist de Follow UPs
-- Cada lead movido para a coluna 'fups' recebe automaticamente 5 tarefas (FUP1-FUP5)

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS fup_tasks JSONB NOT NULL DEFAULT '[]'::jsonb;
