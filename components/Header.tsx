'use client';

import { Search, Plus, Webhook, X } from 'lucide-react';
import { useState } from 'react';
import { FUNNELS } from '@/lib/types';

interface HeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  onCreateLead: () => void;
}

export default function Header({ search, onSearchChange, onCreateLead }: HeaderProps) {
  const [showWebhooks, setShowWebhooks] = useState(false);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') return window.location.origin;
    return 'https://SEU-DOMINIO.vercel.app';
  };

  return (
    <>
      <header className="flex items-center gap-4 px-6 py-4 border-b border-[#1e1e24] bg-[#0d0d0f] shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <span className="font-semibold text-[#e4e4e7] text-sm whitespace-nowrap">
            CRM Pilar del Espanhol
          </span>
        </div>

        {/* Busca */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full bg-[#131316] border border-[#2a2a30] rounded-lg pl-9 pr-3 py-2 text-sm text-[#e4e4e7] placeholder-[#52525b] focus:border-[#7c3aed] transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa]"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Webhooks */}
          <button
            onClick={() => setShowWebhooks(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2a2a30] text-[#a1a1aa] hover:border-[#3d3d46] hover:text-[#e4e4e7] transition-all text-sm"
          >
            <Webhook size={14} />
            <span className="hidden sm:inline">Webhooks</span>
          </button>

          {/* Criar Lead */}
          <button
            onClick={onCreateLead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            <span>Novo Lead</span>
          </button>
        </div>
      </header>

      {/* Modal de webhooks */}
      {showWebhooks && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowWebhooks(false)}
        >
          <div
            className="modal-enter bg-[#131316] border border-[#2a2a30] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Webhook size={18} className="text-[#7c3aed]" />
                <h2 className="text-base font-semibold text-[#e4e4e7]">Endpoints de Webhook</h2>
              </div>
              <button onClick={() => setShowWebhooks(false)} className="text-[#71717a] hover:text-[#e4e4e7]">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#71717a] mb-4">
              Configure estes URLs nas plataformas para receber leads automaticamente.
            </p>

            <div className="space-y-4">
              {/* Webhook Low Ticket */}
              <div className="rounded-xl border border-[#2a2a30] p-4 bg-[#0d0d0f]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#f59e0b] bg-[#f59e0b15] border border-[#f59e0b30] px-2 py-0.5 rounded-full">
                    low1 express
                  </span>
                  <span className="text-xs text-[#71717a]">Funil Low Ticket</span>
                </div>
                <code className="block text-xs text-[#a1a1aa] bg-[#131316] rounded-lg p-3 border border-[#1e1e24] break-all">
                  {getBaseUrl()}/api/webhook/low-ticket
                </code>
                <p className="text-xs text-[#52525b] mt-2">
                  Leads recebem automaticamente a tag <strong className="text-[#71717a]">low1 express</strong> e vão para o funil Low Ticket.
                </p>
              </div>

              {/* Webhook Perpétuo */}
              <div className="rounded-xl border border-[#2a2a30] p-4 bg-[#0d0d0f]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#8b5cf6] bg-[#8b5cf615] border border-[#8b5cf630] px-2 py-0.5 rounded-full">
                    lead perpétuo
                  </span>
                  <span className="text-xs text-[#71717a]">Funil Perpétuo — PlugLead</span>
                </div>
                <code className="block text-xs text-[#a1a1aa] bg-[#131316] rounded-lg p-3 border border-[#1e1e24] break-all">
                  {getBaseUrl()}/api/webhook/perpetuo
                </code>
                <p className="text-xs text-[#52525b] mt-2">
                  Configure este URL como destino no PlugLead. Leads recebem a tag{' '}
                  <strong className="text-[#71717a]">lead perpétuo</strong> e vão para o funil Perpétuo.
                </p>
                <div className="mt-2 p-2 rounded-lg bg-[#8b5cf610] border border-[#8b5cf620]">
                  <p className="text-xs text-[#8b5cf6]">
                    Origem PlugLead:{' '}
                    <span className="opacity-70 break-all">
                      webhook.pluglead.com/webhook/a40dc6fa-aa9d-46e9-a267-ddc8ae8ee982
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#52525b] mt-4">
              Método: <strong>POST</strong> · Content-Type: <strong>application/json</strong> ·
              Campos aceitos: <strong>nome</strong>, <strong>name</strong>, <strong>telefone</strong>, <strong>phone</strong>, <strong>whatsapp</strong>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
