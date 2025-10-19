import './globals.css';
import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'AI Project Docs Generator',
  description: 'Generate PRD, AGENTS.md, and an implementation plan from your idea.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <div className="app-shell">
            <nav className="glass-panel relative flex flex-col gap-6 overflow-hidden p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(var(--color-primary)/0.28),transparent_55%)] opacity-80 blur-2xl" />
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.55)] shadow-[0_20px_40px_-30px_hsl(var(--color-ring))] backdrop-blur-xl">
                  <Sparkles className="size-5 text-[hsl(var(--color-primary))]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[hsl(var(--color-muted-foreground))]">
                    hyperdocs studio
                  </p>
                  <h1 className="text-2xl font-semibold leading-tight text-[hsl(var(--color-foreground))] md:text-3xl">
                    AI Project Docs Generator
                  </h1>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-[hsl(var(--color-muted-foreground))] md:text-right">
                  Next.js 15 · Tailwind 4 · shadcn/ui · Vercel AI SDK 5
                </p>
                <ThemeToggle />
              </div>
            </nav>

            <main className={cn('relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10')}>
              {children}
            </main>

            <footer className="mx-auto w-full max-w-4xl text-sm text-[hsl(var(--color-muted-foreground))]">
              <div className="glass-panel flex flex-col gap-4 rounded-[calc(var(--radius-lg)+0.8rem)] p-6 md:flex-row md:items-center md:justify-between md:p-8">
                <p>
                  Crafted to turn fuzzy AI ideas into production-ready documentation ecosystems.
                </p>
                <p className="text-xs uppercase tracking-[0.24em] text-[hsl(var(--color-muted-foreground))]">
                  Routed via Vercel AI Gateway · Models selectable in the wizard
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
