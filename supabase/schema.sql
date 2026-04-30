-- CRM Pilar del Espanhol — Schema
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS leads (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        TEXT        NOT NULL,
  telefone    TEXT        NOT NULL DEFAULT '',
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  origem      TEXT        NOT NULL DEFAULT '',
  funnel      TEXT        NOT NULL DEFAULT 'perpetuo'   CHECK (funnel IN ('perpetuo', 'low-ticket', 'low2')),
  coluna      TEXT        NOT NULL DEFAULT 'novo-lead'  CHECK (coluna IN ('lead-low1', 'lead-low2', 'abordado', 'novo-lead', 'agendado', 'fup-pos-call', 'fups', 'negociacao', 'venda-realizada', 'perdido')),
  valor       DECIMAL(10, 2) DEFAULT 0.00,
  data_entrada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para busca e filtros
CREATE INDEX IF NOT EXISTS leads_funnel_idx  ON leads (funnel);
CREATE INDEX IF NOT EXISTS leads_coluna_idx  ON leads (coluna);
CREATE INDEX IF NOT EXISTS leads_nome_idx    ON leads USING gin (to_tsvector('portuguese', nome));

-- Realtime
ALTER TABLE leads REPLICA IDENTITY FULL;

-- Row Level Security desabilitado (uso interno sem auth)
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
