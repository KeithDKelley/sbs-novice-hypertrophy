import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SBS Novice Hypertrophy Planner',
  description: 'Track your SBS Novice Hypertrophy program progression',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Nav />
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
