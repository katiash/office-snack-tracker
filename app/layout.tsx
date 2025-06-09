import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Snack/Drink and Copy/Print Tracker',
  description:
    'Track office snacks, drinks, and copy/print usage in one clean interface.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[--bg-base] text-[--text-base] min-h-screen`}
      >
        <NavBar />
        <main className="px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl mx-auto pt-4 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}