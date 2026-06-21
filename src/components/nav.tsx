'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Dumbbell } from 'lucide-react';

const navItems = [
  { href: '/today', label: 'Today' },
  { href: '/status', label: 'Status' },
  { href: '/history', label: 'History' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-6 flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          <span className="font-semibold text-sm">SBS Novice</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === item.href ? 'text-foreground font-medium' : 'text-foreground/60',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
