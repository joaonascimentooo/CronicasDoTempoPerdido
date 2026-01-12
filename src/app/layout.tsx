import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crônicas do Tempo - RPG',
  description: 'Sistema de gerenciamento de personagens RPG',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gradient-to-b from-gray-900 to-gray-800 text-white m-0 p-0">
        <Navbar />
        <main className="w-full m-0 p-0">
          {children}
        </main>
      </body>
    </html>
  );
}
