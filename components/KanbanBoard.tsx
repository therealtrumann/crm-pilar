'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
  useDroppable,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';
import { Lead, ColumnId, KanbanColumnDef, Tag } from '@/lib/types';
import { playCashRegisterSound } from '@/lib/sounds';

/**
 * Normaliza a coluna de um lead com base nas suas tags.
 * Necessário enquanto o banco ainda usa 'novo-lead' como fallback
 * para leads de Low1/Low2 (antes da migration de constraint).
 */
function normalizeLeadColuna(lead: Lead): Lead {
  if (lead.coluna !== 'novo-lead') return lead;
  if (lead.tags.includes('low1-express'))  return { ...lead, coluna: 'lead-low1' };
  if (lead.tags.includes('low2-viagens'))  return { ...lead, coluna: 'lead-low2' };
  return lead;
}

function normalizeLeads(leads: Lead[]): Lead[] {
  return leads.map(normalizeLeadColuna);
}

interface KanbanBoardProps {
  leads: Lead[];
  columns: KanbanColumnDef[];
  onLeadMove: (leadId: string, newColumn: ColumnId, tags: Tag[]) => void;
  onLeadClick: (lead: Lead) => void;
  onLeadDelete?: (leadId: string) => Promise<void>;
}

function DeleteZone() {
  const { setNodeRef, isOver } = useDroppable({ id: '__delete__' });

  return (
    <div
      ref={setNodeRef}
      className={`fixed bottom-6 right-6 p-4 rounded-full transition-all ${
        isOver
          ? 'bg-[#ef4444] shadow-xl scale-125'
          : 'bg-[#1e1e24] border border-[#2a2a30]'
      }`}
    >
      <Trash2 size={24} className={isOver ? 'text-white' : 'text-[#71717a]'} />
    </div>
  );
}

export default function KanbanBoard({ leads, columns, onLeadMove, onLeadClick, onLeadDelete }: KanbanBoardProps) {
  const [localLeads, setLocalLeads] = useState<Lead[]>(() => normalizeLeads(leads));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  // Sincroniza quando as props mudam (ex: webhook chega) — normaliza colunas por tag
  useEffect(() => {
    setLocalLeads(normalizeLeads(leads));
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getColumnLeads = (colId: ColumnId) => localLeads.filter(l => l.coluna === colId);

  const findColumnOfItem = (id: string): ColumnId | undefined => {
    return localLeads.find(l => l.id === id)?.coluna;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;

    const activeId = active.id as string;
    const overId   = over.id as string;

    const activeColumn = findColumnOfItem(activeId);

    // Determinar a coluna de destino
    const isOverColumn = columns.some(c => c.id === overId);
    const overColumn   = isOverColumn
      ? (overId as ColumnId)
      : findColumnOfItem(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    // Mover card para nova coluna no estado local (otimista)
    setLocalLeads(prev => {
      const updated = prev.map(l =>
        l.id === activeId ? { ...l, coluna: overColumn } : l
      );

      if (!isOverColumn) {
        // Reordenar dentro da nova coluna
        const oldIndex = updated.findIndex(l => l.id === activeId);
        const newIndex = updated.findIndex(l => l.id === overId);
        return arrayMove(updated, oldIndex, newIndex);
      }
      return updated;
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);

    if (!over) {
      setLocalLeads(leads); // reverte
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Se solto sobre a lixeira
    if (overId === '__delete__') {
      const leadToDelete = leads.find(l => l.id === activeId);
      if (leadToDelete) {
        setPendingDelete(activeId);
      }
      setLocalLeads(leads); // reverte
      return;
    }

    const originalLead = leads.find(l => l.id === activeId);
    const movedLead    = localLeads.find(l => l.id === activeId);

    if (!originalLead || !movedLead) return;

    if (movedLead.coluna !== originalLead.coluna) {
      // Toca som quando move para Venda realizada
      if (movedLead.coluna === 'venda-realizada') {
        playCashRegisterSound();
      }

      // Adiciona tag "aluno-perpetuo" ao mover para Venda realizada
      const merged = originalLead.tags.includes('aluno-perpetuo')
        ? originalLead.tags
        : [...originalLead.tags, 'aluno-perpetuo' as Tag];
      const newTags: Tag[] =
        movedLead.coluna === 'venda-realizada' ? merged : originalLead.tags;

      onLeadMove(activeId, movedLead.coluna, newTags);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete || !onLeadDelete) return;
    try {
      await onLeadDelete(pendingDelete);
      setLocalLeads(prev => prev.filter(l => l.id !== pendingDelete));
    } finally {
      setPendingDelete(null);
    }
  };

  const activeLead = activeId ? localLeads.find(l => l.id === activeId) : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full overflow-x-auto pb-2">
          {columns.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              leads={getColumnLeads(col.id)}
              onLeadClick={onLeadClick}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
          {activeLead ? (
            <LeadCard lead={activeLead} onClick={() => {}} overlay isBeingDragged />
          ) : null}
        </DragOverlay>

        {activeId && <DeleteZone />}
      </DndContext>

      {/* Modal de confirmação de exclusão */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="bg-[#131316] border border-[#2a2a30] rounded-2xl p-6 w-full max-w-xs shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[#e4e4e7] mb-2">
              Excluir lead?
            </h3>
            <p className="text-sm text-[#a1a1aa] mb-6">
              Esta ação não pode ser desfeita. O lead será permanentemente removido.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 px-4 py-2 rounded-lg text-sm text-[#71717a] hover:text-[#e4e4e7] hover:bg-[#1e1e24] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-[#ef4444] hover:bg-red-600 text-white transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
