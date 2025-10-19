'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LaptopMinimal, MoonStar, SunMedium } from 'lucide-react';

const MODES = [
  { value: 'light', label: 'Light', icon: SunMedium },
  { value: 'dark', label: 'Dark', icon: MoonStar },
  { value: 'system', label: 'Auto', icon: LaptopMinimal }
] as const;

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted ? (
    <div className="inline-flex items-center justify-center gap-1 rounded-full border border-[--color-border] bg-[hsl(var(--color-card)/0.75)] px-1 py-1 backdrop-blur-md">
      {MODES.map(({ value, label, icon: Icon }) => {
        const isActive =
          value === 'system'
            ? theme === 'system'
            : resolvedTheme === value;
        return (
          <Button
            key={value}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'px-3 py-2 text-xs font-medium transition-all',
              isActive
                ? 'bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary))] shadow-[0_10px_25px_-15px_hsl(var(--color-primary))]'
                : 'text-[hsl(var(--color-muted-foreground))]'
            )}
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
          >
            <Icon className="mr-1.5 size-4" />
            {label}
          </Button>
        );
      })}
    </div>
  ) : (
    <div className="h-9 w-[180px] animate-pulse rounded-full bg-[hsl(var(--color-muted)/0.6)]" />
  );
}
