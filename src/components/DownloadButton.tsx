'use client';

import { Download, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { downloadText } from '@/lib/utils';

export default function DownloadButton({ filename, content }: { filename: string; content: string }) {
  function handleClick() {
    downloadText(filename, content);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          onClick={handleClick}
          className="group relative overflow-hidden rounded-full border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.7)] px-4 py-2 text-sm font-semibold text-[hsl(var(--color-foreground))] shadow-[0_15px_30px_-20px_hsl(var(--color-ring))] transition-all hover:border-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary)/0.15)]"
        >
          <span className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(var(--color-primary)/0.25),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <Download className="mr-2 size-4 text-[hsl(var(--color-primary))]" aria-hidden="true" />
          Save {filename}
          <Sparkles className="ml-2 size-3 text-[hsl(var(--color-primary))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        Exports the generated markdown locally — no server roundtrip.
      </TooltipContent>
    </Tooltip>
  );
}
