'use client';

import { Response } from '@/components/ai-elements/response';

export function Markdown({ content }: { content: string }) {
  return (
    <article className="group relative overflow-hidden rounded-[calc(var(--radius-lg)+0.6rem)] border border-[hsl(var(--color-ring-soft)/0.35)] bg-[hsl(var(--color-card)/0.92)] shadow-[0_35px_90px_-45px_hsl(var(--shadow))] transition-colors backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-x-0 -top-40 h-72 bg-[radial-gradient(circle_at_top,hsl(var(--color-primary)/0.22),transparent_65%)]" />
        <div className="absolute inset-y-0 right-[-30%] w-1/2 rotate-12 bg-[radial-gradient(circle,hsl(var(--color-ring-soft)/0.18),transparent_65%)] blur-3xl" />
      </div>
      <div className="relative flex flex-col gap-6 px-6 py-7 md:px-10 md:py-10">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-[hsl(var(--color-muted-foreground))]">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--color-primary))]" />
          Generated narrative
        </div>
        <Response
          className="prose prose-sm max-w-none leading-relaxed text-[hsl(var(--color-foreground))] dark:prose-invert md:prose-base [&_pre]:scrollbar-slim [&_pre]:bg-[hsl(var(--color-surface-strong)/0.95)] [&_pre]:border [&_pre]:border-[hsl(var(--color-ring-soft)/0.35)] [&_pre]:px-5 [&_pre]:py-4 [&_pre]:shadow-[0_25px_60px_-40px_hsl(var(--color-ring-soft)/0.6)] [&_pre]:rounded-[calc(var(--radius-md)+0.3rem)] [&_pre]:backdrop-blur-xl [&_pre]:text-[0.78rem] md:[&_pre]:text-sm [&_table]:overflow-hidden [&_table]:rounded-xl [&_table]:border [&_table]:border-[hsl(var(--color-ring-soft)/0.25)] [&_th]:bg-[hsl(var(--color-surface-soft)/0.55)] [&_th]:font-semibold [&_code]:font-medium"
        >
          {content}
        </Response>
      </div>
    </article>
  );
}
