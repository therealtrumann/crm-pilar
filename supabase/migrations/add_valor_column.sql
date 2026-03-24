-- Adiciona coluna 'valor' à tabela 'leads' se não existir
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS valor DECIMAL(10, 2) DEFAULT 0.00;
