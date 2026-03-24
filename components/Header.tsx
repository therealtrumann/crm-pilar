'use client';

import { Search, Plus, Webhook, X, RotateCcw, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { FUNNELS } from '@/lib/types';
import { useTheme } from '@/lib/theme-context';

interface HeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  onCreateLead: () => void;
  onRefresh?: () => void;
}

export default function Header({ search, onSearchChange, onCreateLead, onRefresh }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showWebhooks, setShowWebhooks] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') return window.location.origin;
    return 'https://SEU-DOMINIO.vercel.app';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) await onRefresh();
    setRefreshing(false);
  };

  return (
    <>
      <header className={`flex items-center gap-4 px-6 py-4 shrink-0 ${
        theme === 'dark'
          ? 'border-[#1e1e24] bg-[#0d0d0f]'
          : 'border-[#e4e4e7] bg-white'
      }`}>
        {/* Logo SVG */}
        <div className="flex items-center gap-2 mr-2">
          <svg width="32" height="32" viewBox="0 0 32 32" className="flex-shrink-0">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff1493" />
                <stop offset="100%" stopColor="#ff69b4" />
              </linearGradient>
            </defs>
            <path d="M 4 8 Q 4 4 8 4 L 24 4 Q 28 4 28 8 L 28 24 Q 28 28 24 28 L 8 28 Q 4 28 4 24 Z"
                  fill="url(#logoGradient)" opacity="0.2"/>
            <text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ff1493">P</text>
          </svg>
          <span className={`font-semibold text-sm whitespace-nowrap ${
            theme === 'dark' ? 'text-[#e4e4e7]' : 'text-[#18181b]'
          }`}>
            CRM Pilar del Espanhol
          </span>
        </div>

        {/* Busca */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            theme === 'dark' ? 'text-[#52525b]' : 'text-[#a1a1aa]'
          }`} />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className={`w-full rounded-lg pl-9 pr-3 py-2 text-sm transition-colors focus:border-[#7c3aed] ${
              theme === 'dark'
                ? 'bg-[#131316] border border-[#2a2a30] text-[#e4e4e7] placeholder-[#52525b]'
                : 'bg-[#f8f8f9] border border-[#d4d4d8] text-[#18181b] placeholder-[#a1a1aa]'
            }`}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                theme === 'dark'
                  ? 'text-[#52525b] hover:text-[#a1a1aa]'
                  : 'text-[#a1a1aa] hover:text-[#52525b]'
              }`}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Recarregar */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm disabled:opacity-50 ${
              theme === 'dark'
                ? 'border-[#2a2a30] text-[#a1a1aa] hover:border-[#3d3d46] hover:text-[#e4e4e7]'
                : 'border-[#d4d4d8] text-[#52525b] hover:border-[#a1a1aa] hover:text-[#18181b]'
            }`}
            title="Recarregar leads"
          >
            <RotateCcw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {/* Tema */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm ${
              theme === 'dark'
                ? 'border-[#2a2a30] text-[#a1a1aa] hover:border-[#3d3d46] hover:text-[#e4e4e7]'
                : 'border-[#d4d4d8] text-[#52525b] hover:border-[#a1a1aa] hover:text-[#18181b]'
            }`}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Webhooks */}
          <button
            onClick={() => setShowWebhooks(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm ${
              theme === 'dark'
                ? 'border-[#2a2a30] text-[#a1a1aa] hover:border-[#3d3d46] hover:text-[#e4e4e7]'
                : 'border-[#d4d4d8] text-[#52525b] hover:border-[#a1a1aa] hover:text-[#18181b]'
            }`}
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
              {/* Webhook Hotmart */}
              <div className="rounded-xl border border-[#2a2a30] p-4 bg-[#0d0d0f]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#10b981] bg-[#10b98115] border border-[#10b98130] px-2 py-0.5 rounded-full">
                    hotmart
                  </span>
                  <span className="text-xs text-[#71717a]">Vendas Low Ticket</span>
                </div>
                <code className="block text-xs text-[#a1a1aa] bg-[#131316] rounded-lg p-3 border border-[#1e1e24] break-all">
                  {getBaseUrl()}/api/webhook/hotmart
                </code>
                <p className="text-xs text-[#52525b] mt-2">
                  Configure este URL na Hotmart para receber notificações de vendas. Leads recebem automaticamente a tag{' '}
                  <strong className="text-[#71717a]">low1 express</strong>.
                </p>
              </div>

              {/* Webhook Low Ticket */}
              <div className="rounded-xl border border-[#2a2a30] p-4 bg-[#0d0d0f]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#f59e0b] bg-[#f59e0b15] border border-[#f59e0b30] px-2 py-0.5 rounded-full">
                    low1 express
                  </span>
                  <span className="text-xs text-[#71717a]">Funil Low Ticket (Genérico)</span>
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
