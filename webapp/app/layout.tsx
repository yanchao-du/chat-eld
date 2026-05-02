import type { Metadata } from 'next';
import './globals.css';
import ELDHeader from '@/components/ELDHeader';
import ELDFooter from '@/components/ELDFooter';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: 'Elections Department Singapore',
  description: 'Official Election Information',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-800">
        <ELDHeader />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <ELDFooter />
        <ChatWidget />
      </body>
    </html>
  );
}
