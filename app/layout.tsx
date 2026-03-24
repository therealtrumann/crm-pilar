import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRM Pilar del Espanhol',
  description: 'CRM interno — Pilar del Espanhol',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0d0d0f] text-[#e4e4e7] h-screen flex flex-col overflow-hidden">
        {children}
      </body>
    </html>
  );
}
