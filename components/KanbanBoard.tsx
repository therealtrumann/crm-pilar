'use client';

import { useState, useEffect } from 'react';
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
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';
import { Lead, ColumnId, COLUMNS, Tag } from '@/lib/types';

interface KanbanBoardProps {
  leads: Lead[];
  onLeadMove: (leadId: string, newColumn: ColumnId, tags: Tag[]) => void;
  onLeadClick: (lead: Lead) => void;
}

export default function KanbanBoard({ leads, onLeadMove, onLeadClick }: KanbanBoardProps) {
  const [localLeads, setLocalLeads] = useState<Lead[]>(leads);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sincroniza quando as props mudam (ex: webhook chega)
  useEffect(() => {
    setLocalLeads(leads);
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
    const isOverColumn = COLUMNS.some(c => c.id === overId);
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

    const activeId     = active.id as string;
    const originalLead = leads.find(l => l.id === activeId);
    const movedLead    = localLeads.find(l => l.id === activeId);

    if (!originalLead || !movedLead) return;

    if (movedLead.coluna !== originalLead.coluna) {
      // Adiciona tag "aluno-perpetuo" ao mover para Venda realizada
      const merged = originalLead.tags.includes('aluno-perpetuo')
        ? originalLead.tags
        : [...originalLead.tags, 'aluno-perpetuo' as Tag];
      const newTags: Tag[] =
        movedLead.coluna === 'venda-realizada' ? merged : originalLead.tags;

      onLeadMove(activeId, movedLead.coluna, newTags);
    }
  };

  const activeLead = activeId ? localLeads.find(l => l.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-2">
        {COLUMNS.map(col => (
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
          <LeadCard lead={activeLead} onClick={() => {}} overlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
