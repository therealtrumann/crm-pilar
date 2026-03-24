'use client';

import { FUNNELS, FunnelId } from '@/lib/types';

interface FunnelTabsProps {
  funnel: FunnelId;
  counts: Record<FunnelId, number>;
  onFunnelChange: (f: FunnelId) => void;
}

export default function FunnelTabs({ funnel, counts, onFunnelChange }: FunnelTabsProps) {
  return (
    <div className="flex items-center gap-1 px-6 pt-4 pb-0 border-b border-[#1e1e24] shrink-0">
      {FUNNELS.map(f => (
        <button
          key={f.id}
          onClick={() => onFunnelChange(f.id)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px ${
            funnel === f.id
              ? 'text-[#e4e4e7] border-[#7c3aed] bg-[#7c3aed10]'
              : 'text-[#71717a] border-transparent hover:text-[#a1a1aa] hover:bg-[#131316]'
          }`}
        >
          {f.label}
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
              funnel === f.id
                ? 'bg-[#7c3aed] text-white'
                : 'bg-[#1e1e24] text-[#52525b]'
            }`}
          >
            {counts[f.id] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
