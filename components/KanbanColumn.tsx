'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Lead, KanbanColumnDef } from '@/lib/types';
import LeadCard from './LeadCard';

interface KanbanColumnProps {
  column: KanbanColumnDef;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export default function KanbanColumn({ column, leads, onLeadClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });

  const totalValor = leads.reduce((sum, lead) => sum + (lead.valor ?? 0), 0);

  return (
    <div className="flex flex-col w-[272px] shrink-0">
      {/* Cabeçalho da coluna */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <span className="text-sm font-semibold text-[#c4c4cc]">{column.label}</span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            color: column.color,
            backgroundColor: column.bg,
            border: `1px solid ${column.color}30`,
          }}
        >
          {leads.length}
        </span>
      </div>

      {/* Total de valores */}
      {totalValor > 0 && (
        <div className="mb-3 px-2 py-1.5 rounded-lg bg-[#7c3aed15] border border-[#7c3aed30]">
          <p className="text-xs text-[#7c3aed] font-semibold">
            Total: R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      )}

      {/* Zona de drop */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 min-h-[calc(100vh-220px)] flex flex-col gap-2 transition-colors duration-150 ${
          isOver
            ? 'bg-[#7c3aed12] border border-[#7c3aed50]'
            : 'bg-[#131316] border border-[#1e1e24]'
        }`}
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-[#3d3d46]">Solte aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
