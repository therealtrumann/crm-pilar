export type Tag = 'low1-express' | 'lead-perpetuo' | 'aluno-perpetuo';
export type FunnelId = 'perpetuo' | 'low-ticket';
export type ColumnId = 'novo-lead' | 'fups' | 'negociacao' | 'venda-realizada' | 'perdido';

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  tags: Tag[];
  origem: string;
  funnel: FunnelId;
  coluna: ColumnId;
  valor?: number;
  data_entrada: string;
  created_at: string;
  updated_at: string;
}

export interface KanbanColumnDef {
  id: ColumnId;
  label: string;
  color: string;
  bg: string;
}

export interface FunnelDef {
  id: FunnelId;
  label: string;
  webhookPath: string;
}

export const FUNNELS: FunnelDef[] = [
  { id: 'perpetuo',   label: 'Perpétuo',   webhookPath: '/api/webhook/perpetuo' },
  { id: 'low-ticket', label: 'Low Ticket', webhookPath: '/api/webhook/low-ticket' },
];

export const COLUMNS: KanbanColumnDef[] = [
  { id: 'novo-lead',       label: 'Novo Lead',        color: '#3b82f6', bg: '#3b82f610' },
  { id: 'fups',            label: 'FUPs',              color: '#f59e0b', bg: '#f59e0b10' },
  { id: 'negociacao',      label: 'Negociação',        color: '#8b5cf6', bg: '#8b5cf610' },
  { id: 'venda-realizada', label: 'Venda realizada',   color: '#10b981', bg: '#10b98110' },
  { id: 'perdido',         label: 'Perdido',           color: '#ef4444', bg: '#ef444410' },
];

export const TAG_META: Record<Tag, { label: string; color: string }> = {
  'low1-express':   { label: 'low1 express',   color: '#f59e0b' },
  'lead-perpetuo':  { label: 'lead perpétuo',  color: '#8b5cf6' },
  'aluno-perpetuo': { label: 'aluno perpétuo', color: '#10b981' },
};

export const ALL_TAGS: Tag[] = ['low1-express', 'lead-perpetuo', 'aluno-perpetuo'];
