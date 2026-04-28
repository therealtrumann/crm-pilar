'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Calendar, GripVertical, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lead, TAG_META, FupTask } from '@/lib/types';
import { useTheme } from '@/lib/theme-context';
import { getColors } from '@/lib/theme-utils';

function FupMiniChecklist({ tasks }: { tasks: FupTask[] }) {
  const done = tasks.filter(t => t.done).length;
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs text-[#52525b]">FUPs</span>
        <span className="text-xs text-[#3b82f6] font-medium ml-auto">{done}/{tasks.length}</span>
      </div>
      <div className="flex gap-1">
        {tasks.map(task => (
          <div
            key={task.id}
            title={task.label}
            className="flex-1 h-1.5 rounded-full transition-colors"
            style={{ backgroundColor: task.done ? '#3b82f6' : '#1e1e24' }}
          />
        ))}
      </div>
    </div>
  );
}

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  overlay?: boolean;
  isBeingDragged?: boolean;
}

export default function LeadCard({ lead, onClick, overlay, isBeingDragged }: LeadCardProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: 'card', columnId: lead.coluna },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="group relative rounded-xl p-3.5 cursor-grab select-none transition-all active:cursor-grabbing"
      onClick={onClick}
      style={{
        ...style,
        backgroundColor: colors.bgTertiary,
        borderColor: overlay ? '#7c3aed60' : colors.border,
        borderWidth: '1px',
        opacity: isDragging ? 0.35 : 1,
        zIndex: isDragging ? 999 : undefined,
        ...(overlay && { boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', transform: 'rotate(1deg) scale(1.05)' }),
      }}
    >
      {/* Drag handle indicator */}
      <div
        className="absolute right-2 top-2 p-1 rounded opacity-0 group-hover:opacity-100 text-[#52525b] hover:text-[#71717a] transition-opacity"
        onClick={e => e.stopPropagation()}
      >
        <GripVertical size={12} />
      </div>

      {/* Delete icon (aparece quando arrastando) */}
      {isBeingDragged && (
        <div className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-[#ef4444] text-white shadow-lg animate-pulse">
          <Trash2 size={14} />
        </div>
      )}

      {/* Nome */}
      <p className="text-sm font-medium text-[#e4e4e7] pr-6 leading-snug mb-2 line-clamp-2">
        {lead.nome}
      </p>

      {/* Valor */}
      {lead.valor ? (
        <div className="mb-2 px-2 py-1 rounded-lg bg-[#7c3aed15] border border-[#7c3aed35]">
          <p className="text-xs font-semibold text-[#7c3aed]">
            R$ {lead.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      ) : null}

      {/* Telefone */}
      {lead.telefone && (
        <div className="flex items-center gap-1.5 text-xs text-[#71717a] mb-2">
          <Phone size={10} className="shrink-0" />
          <span>{lead.telefone}</span>
        </div>
      )}

      {/* Tags */}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {lead.tags.map(tag => {
            const meta = TAG_META[tag];
            if (!meta) return null;
            return (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  color: meta.color,
                  backgroundColor: `${meta.color}18`,
                  border: `1px solid ${meta.color}35`,
                }}
              >
                {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Checklist FUPs */}
      {lead.fup_tasks && lead.fup_tasks.length > 0 && (
        <FupMiniChecklist tasks={lead.fup_tasks} />
      )}

      {/* Data */}
      <div className="flex items-center gap-1 text-xs text-[#52525b]">
        <Calendar size={10} />
        <span>
          {format(new Date(lead.data_entrada), "dd 'de' MMM", { locale: ptBR })}
        </span>
        {lead.origem && (
          <>
            <span className="mx-1">·</span>
            <span className="truncate max-w-[80px]">{lead.origem}</span>
          </>
        )}
      </div>
    </div>
  );
}
