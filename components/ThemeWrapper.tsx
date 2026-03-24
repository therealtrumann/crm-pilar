'use client';

import { useTheme } from '@/lib/theme-context';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div
      className={`flex flex-col h-screen ${
        theme === 'dark'
          ? 'bg-[#0d0d0f] text-[#e4e4e7]'
          : 'bg-white text-[#18181b]'
      }`}
    >
      {children}
    </div>
  );
}
