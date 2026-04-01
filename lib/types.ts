export type Tag = 'low1-express' | 'low2-viagens' | 'lead-perpetuo' | 'aluno-perpetuo' | 'aplicacao-direta';
export type FunnelId = 'perpetuo' | 'low-ticket' | 'low2' | 'revora';
export type ColumnId =
  | 'lead-low1' | 'lead-low2'
  | 'novo-lead'
  | 'agendado' | 'fup-pos-call'
  | 'fups' | 'negociacao'
  | 'venda-realizada' | 'perdido';
export type BoardId = 'pilar' | 'revora';

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

export interface BoardDef {
  id: BoardId;
  label: string;
  funnels: FunnelId[];
  defaultFunnel: FunnelId;
  defaultColuna: ColumnId;
  columns: KanbanColumnDef[];
}

export const BOARDS: BoardDef[] = [
  {
    id: 'pilar',
    label: 'Pilar',
    funnels: ['perpetuo', 'low-ticket', 'low2'],
    defaultFunnel: 'perpetuo',
    defaultColuna: 'novo-lead',
    columns: [
      { id: 'lead-low1',       label: 'Lead Low1',       color: '#f59e0b', bg: '#f59e0b10' },
      { id: 'lead-low2',       label: 'Lead Low2',       color: '#06b6d4', bg: '#06b6d410' },
      { id: 'novo-lead',       label: 'Lead Perpétuo',   color: '#8b5cf6', bg: '#8b5cf610' },
      { id: 'fups',            label: 'FUPs',             color: '#3b82f6', bg: '#3b82f610' },
      { id: 'negociacao',      label: 'Negociação',       color: '#a855f7', bg: '#a855f710' },
      { id: 'venda-realizada', label: 'Venda realizada',  color: '#10b981', bg: '#10b98110' },
      { id: 'perdido',         label: 'Perdido',          color: '#ef4444', bg: '#ef444410' },
    ],
  },
  {
    id: 'revora',
    label: 'Revora',
    funnels: ['revora'],
    defaultFunnel: 'revora',
    defaultColuna: 'novo-lead',
    columns: [
      { id: 'novo-lead',       label: 'Novos Leads',     color: '#3b82f6', bg: '#3b82f610' },
      { id: 'fups',            label: 'FUPs',             color: '#f59e0b', bg: '#f59e0b10' },
      { id: 'agendado',        label: 'Agendado',         color: '#06b6d4', bg: '#06b6d410' },
      { id: 'fup-pos-call',    label: 'FUP pós call',    color: '#8b5cf6', bg: '#8b5cf610' },
      { id: 'venda-realizada', label: 'Venda realizada',  color: '#10b981', bg: '#10b98110' },
      { id: 'perdido',         label: 'Perdido',          color: '#ef4444', bg: '#ef444410' },
    ],
  },
];

// Alias para compatibilidade com CreateLeadModal (usa colunas do board Pilar)
export const COLUMNS = BOARDS[0].columns;

export const FUNNELS: FunnelDef[] = [
  { id: 'perpetuo',   label: 'Perpétuo',      webhookPath: '/api/webhook/perpetuo' },
  { id: 'low-ticket', label: 'Low Ticket',    webhookPath: '/api/webhook/low-ticket' },
  { id: 'low2',       label: 'Low2 Viagens',  webhookPath: '/api/webhook/low2' },
  { id: 'revora',     label: 'Revora',        webhookPath: '/api/webhook/aplicacao-direta' },
];

export const TAG_META: Record<Tag, { label: string; color: string }> = {
  'low1-express':    { label: 'low1 express',    color: '#f59e0b' },
  'low2-viagens':    { label: 'low2 viagens',    color: '#06b6d4' },
  'lead-perpetuo':   { label: 'lead perpétuo',   color: '#8b5cf6' },
  'aluno-perpetuo':  { label: 'aluno perpétuo',  color: '#10b981' },
  'aplicacao-direta':{ label: 'aplicação direta',color: '#3b82f6' },
};

export const ALL_TAGS: Tag[] = [
  'low1-express', 'low2-viagens', 'lead-perpetuo', 'aluno-perpetuo', 'aplicacao-direta',
];
