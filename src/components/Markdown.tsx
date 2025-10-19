'use client';

import { Response } from '@/components/ai-elements/response';

export function Markdown({ content }: { content: string }) {
  return (
    <div className="relative overflow-hidden rounded-[calc(var(--radius-lg)+0.5rem)] border border-[hsl(var(--color-border)/0.5)] bg-[hsl(var(--color-card)/0.85)] p-6 shadow-[0_35px_80px_-45px_hsl(var(--shadow))]">
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(circle_at_top,hsl(var(--color-primary)/0.16),transparent_65%)]" />
      <div className="relative grid gap-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-primary))]" />
          <p className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--color-muted-foreground))]">
            Generated narrative
          </p>
        </div>
        <div className="prose prose-sm max-w-none text-[hsl(var(--color-foreground))] prose-headings:tracking-tight prose-pre:bg-[hsl(var(--color-muted)/0.4)] prose-pre:backdrop-blur-lg prose-code:rounded prose-code:bg-[hsl(var(--color-muted)/0.5)] prose-code:px-1.5 prose-code:py-0.5 dark:prose-invert">
          <Response>{content}</Response>
        </div>
      </div>
    </div>
  );
}
