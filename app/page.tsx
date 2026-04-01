'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead, ColumnId, Tag, BoardId, BOARDS } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import KanbanBoard from '@/components/KanbanBoard';
import CreateLeadModal from '@/components/CreateLeadModal';
import { useTheme } from '@/lib/theme-context';

export default function Home() {
  const { theme } = useTheme();
  const [allLeads,        setAllLeads]        = useState<Lead[]>([]);
  const [search,          setSearch]          = useState('');
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [selectedLead,    setSelectedLead]    = useState<Lead | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [selectedBoard,   setSelectedBoard]   = useState<BoardId>('pilar');

  const currentBoard = BOARDS.find(b => b.id === selectedBoard)!;

  // Ao trocar de aba, mostra loading enquanto carrega os leads do novo board
  const handleBoardChange = (id: BoardId) => {
    setSelectedBoard(id);
    setLoading(true);
  };

  // Buscar leads — filtragem por board feita no servidor (mais confiável)
  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('board', selectedBoard);
    if (search) params.set('search', search);

    const res  = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    setAllLeads(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, selectedBoard]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Realtime — atualiza quando webhook cria lead
  useEffect(() => {
    const channel = supabase
      .channel('leads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchLeads]);

  // Mover card entre colunas
  const handleLeadMove = async (leadId: string, newColumn: ColumnId, tags: Tag[]) => {
    setAllLeads(prev =>
      prev.map(l =>
        l.id === leadId ? { ...l, coluna: newColumn, tags } : l
      )
    );

    await fetch(`/api/leads/${leadId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ coluna: newColumn, tags }),
    });
  };

  // Criar ou editar lead
  const handleSaveLead = async (formData: Partial<Lead>) => {
    if (selectedLead) {
      await fetch(`/api/leads/${selectedLead.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
    } else {
      await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
    }

    setIsModalOpen(false);
    setSelectedLead(null);
    await fetchLeads();
  };

  const handleDeleteLead = async (id: string) => {
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    setIsModalOpen(false);
    setSelectedLead(null);
    await fetchLeads();
  };

  const handleDeleteFromDrag = async (id: string) => {
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    await fetchLeads();
  };

  const openCreate = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${
      theme === 'dark' ? 'bg-[#0d0d0f]' : 'bg-[#f4f4f5]'
    }`}>
      <Header
        search={search}
        onSearchChange={setSearch}
        onCreateLead={openCreate}
        onRefresh={fetchLeads}
        selectedBoard={selectedBoard}
      />

      {/* Abas de board */}
      <div className={`flex items-end gap-0 px-6 shrink-0 border-b ${
        theme === 'dark' ? 'border-[#1e1e24]' : 'border-[#e4e4e7]'
      }`}>
        {BOARDS.map(board => (
          <button
            key={board.id}
            onClick={() => handleBoardChange(board.id)}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              selectedBoard === board.id
                ? theme === 'dark'
                  ? 'text-[#e4e4e7] border-[#7c3aed]'
                  : 'text-[#18181b] border-[#7c3aed]'
                : theme === 'dark'
                  ? 'text-[#52525b] border-transparent hover:text-[#a1a1aa]'
                  : 'text-[#a1a1aa] border-transparent hover:text-[#52525b]'
            }`}
          >
            {board.label}
          </button>
        ))}
      </div>

      <main className="flex-1 px-6 pt-5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className={`text-sm animate-pulse ${
              theme === 'dark' ? 'text-[#52525b]' : 'text-[#a1a1aa]'
            }`}>Carregando leads...</div>
          </div>
        ) : (
          <KanbanBoard
            key={selectedBoard}
            leads={allLeads}
            columns={currentBoard.columns}
            onLeadMove={handleLeadMove}
            onLeadClick={openEdit}
            onLeadDelete={handleDeleteFromDrag}
          />
        )}
      </main>

      {isModalOpen && (
        <CreateLeadModal
          lead={selectedLead}
          boardColumns={currentBoard.columns}
          defaultFunnel={currentBoard.defaultFunnel}
          defaultColuna={currentBoard.defaultColuna}
          onClose={() => { setIsModalOpen(false); setSelectedLead(null); }}
          onSave={handleSaveLead}
          onDelete={handleDeleteLead}
          onRefresh={fetchLeads}
        />
      )}
    </div>
  );
}
