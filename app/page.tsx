'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead, ColumnId, Tag } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import KanbanBoard from '@/components/KanbanBoard';
import CreateLeadModal from '@/components/CreateLeadModal';

export default function Home() {
  const [allLeads,        setAllLeads]        = useState<Lead[]>([]);
  const [search,          setSearch]          = useState('');
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [selectedLead,    setSelectedLead]    = useState<Lead | null>(null);
  const [loading,         setLoading]         = useState(true);

  // Buscar leads
  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);

    const res  = await fetch(`/api/leads?${params}`);
    const data = await res.json();
    setAllLeads(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

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
    // Atualizar local imediatamente (otimista)
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
      // Editar
      await fetch(`/api/leads/${selectedLead.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
    } else {
      // Criar
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

  // Deletar lead
  const handleDeleteLead = async (id: string) => {
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    setIsModalOpen(false);
    setSelectedLead(null);
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
    <div className="h-screen flex flex-col overflow-hidden bg-[#0d0d0f]">
      <Header search={search} onSearchChange={setSearch} onCreateLead={openCreate} onRefresh={fetchLeads} />

      <main className="flex-1 px-6 pt-5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-[#52525b] animate-pulse">Carregando leads...</div>
          </div>
        ) : (
          <KanbanBoard
            leads={allLeads}
            onLeadMove={handleLeadMove}
            onLeadClick={openEdit}
          />
        )}
      </main>

      {isModalOpen && (
        <CreateLeadModal
          lead={selectedLead}
          onClose={() => { setIsModalOpen(false); setSelectedLead(null); }}
          onSave={handleSaveLead}
          onDelete={handleDeleteLead}
          onRefresh={fetchLeads}
        />
      )}
    </div>
  );
}
