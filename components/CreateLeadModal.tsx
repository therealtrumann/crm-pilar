'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Lead, FunnelId, ColumnId, Tag, COLUMNS, FUNNELS, ALL_TAGS, TAG_META } from '@/lib/types';

interface CreateLeadModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSave: (data: Partial<Lead>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export default function CreateLeadModal({
  lead,
  onClose,
  onSave,
  onDelete,
  onRefresh,
}: CreateLeadModalProps) {
  const isEdit = !!lead;

  const [nome,     setNome]     = useState(lead?.nome     ?? '');
  const [telefone, setTelefone] = useState(lead?.telefone ?? '');
  const [origem,   setOrigem]   = useState(lead?.origem   ?? '');
  const [funnel,   setFunnel]   = useState<FunnelId>(lead?.funnel ?? 'perpetuo');
  const [coluna,   setColuna]   = useState<ColumnId>(lead?.coluna ?? 'novo-lead');
  const [tags,     setTags]     = useState<Tag[]>(lead?.tags ?? []);
  const [loading,  setLoading]  = useState(false);
  const [confirm,  setConfirm]  = useState(false);

  useEffect(() => {
    if (lead) {
      setNome(lead.nome);
      setTelefone(lead.telefone);
      setOrigem(lead.origem);
      setFunnel(lead.funnel);
      setColuna(lead.coluna);
      setTags(lead.tags);
    }
  }, [lead]);

  const toggleTag = (tag: Tag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!nome.trim()) return;
    setLoading(true);
    try {
      await onSave({ nome: nome.trim(), telefone, origem, funnel, coluna, tags });
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!lead || !onDelete) return;
    setLoading(true);
    try {
      await onDelete(lead.id);
      onRefresh();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="modal-enter bg-[#131316] border border-[#2a2a30] rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e24]">
          <h2 className="text-base font-semibold text-[#e4e4e7]">
            {isEdit ? 'Editar Lead' : 'Novo Lead'}
          </h2>
          <button onClick={onClose} className="text-[#71717a] hover:text-[#e4e4e7] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <div className="px-6 py-5 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-[#71717a] mb-1.5">
              Nome <span className="text-[#ef4444]">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Nome do lead"
              className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-lg px-3 py-2.5 text-sm text-[#e4e4e7] placeholder-[#52525b] focus:border-[#7c3aed] transition-colors"
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-medium text-[#71717a] mb-1.5">Telefone / WhatsApp</label>
            <input
              type="tel"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              placeholder="+55 11 99999-9999"
              className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-lg px-3 py-2.5 text-sm text-[#e4e4e7] placeholder-[#52525b] focus:border-[#7c3aed] transition-colors"
            />
          </div>

          {/* Origem */}
          <div>
            <label className="block text-xs font-medium text-[#71717a] mb-1.5">Tag de origem</label>
            <input
              type="text"
              value={origem}
              onChange={e => setOrigem(e.target.value)}
              placeholder="Ex: instagram, formulário, indicação..."
              className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-lg px-3 py-2.5 text-sm text-[#e4e4e7] placeholder-[#52525b] focus:border-[#7c3aed] transition-colors"
            />
          </div>

          {/* Funil + Coluna */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#71717a] mb-1.5">Funil</label>
              <select
                value={funnel}
                onChange={e => setFunnel(e.target.value as FunnelId)}
                className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-lg px-3 py-2.5 text-sm text-[#e4e4e7] focus:border-[#7c3aed] transition-colors"
              >
                {FUNNELS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#71717a] mb-1.5">Coluna</label>
              <select
                value={coluna}
                onChange={e => setColuna(e.target.value as ColumnId)}
                className="w-full bg-[#0d0d0f] border border-[#2a2a30] rounded-lg px-3 py-2.5 text-sm text-[#e4e4e7] focus:border-[#7c3aed] transition-colors"
              >
                {COLUMNS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-[#71717a] mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map(tag => {
                const meta    = TAG_META[tag];
                const checked = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                    style={{
                      color: checked ? meta.color : '#71717a',
                      backgroundColor: checked ? `${meta.color}18` : '#1e1e24',
                      border: `1px solid ${checked ? `${meta.color}50` : '#2a2a30'}`,
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[#1e1e24]">
          {isEdit && onDelete && !confirm && (
            <button
              onClick={() => setConfirm(true)}
              className="p-2 rounded-lg text-[#71717a] hover:text-[#ef4444] hover:bg-[#ef444415] transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}
          {confirm && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#ef4444]">Confirmar exclusão?</span>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-xs px-2 py-1 rounded bg-[#ef4444] text-white hover:bg-red-600 transition-colors"
              >
                Sim
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="text-xs px-2 py-1 rounded bg-[#1e1e24] text-[#71717a] hover:text-white transition-colors"
              >
                Não
              </button>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[#71717a] hover:text-[#e4e4e7] hover:bg-[#1e1e24] transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !nome.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#7c3aed] hover:bg-[#6d28d9] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
