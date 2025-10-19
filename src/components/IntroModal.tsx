'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, ShieldCheck } from 'lucide-react';

export function IntroModal() {
  const [open, setOpen] = useState(true);

  function handleClose() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : handleClose())}>
      <DialogContent className="w-full max-w-md border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.96)] shadow-[0_30px_80px_-45px_hsl(var(--color-ring-soft))] backdrop-blur-2xl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-[hsl(var(--color-ring-soft)/0.6)] bg-[hsl(var(--color-surface-soft)/0.6)] shadow-[0_18px_36px_-28px_hsl(var(--color-ring-soft))]">
            <ShieldCheck className="size-7 text-[hsl(var(--color-primary))]" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold text-[hsl(var(--color-foreground))]">
            Open project, powered by your Gateway key
          </DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed text-[hsl(var(--color-muted-foreground))]">
            This playground is fully open source and routes AI traffic through{' '}
            <Link
              href="https://vercel.com/ai-gateway"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[hsl(var(--color-primary))] underline-offset-4 hover:underline"
            >
              Vercel AI Gateway
            </Link>
            . Plug in your own Gateway API key to keep requests secure and to monitor usage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-2xl border border-[hsl(var(--color-border)/0.55)] bg-[hsl(var(--color-card)/0.8)] p-4">
            <Link
              href="https://github.com/AlexCo888/app-documentation-ai-builder"
              target="_blank"
              rel="noreferrer"
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-transparent px-3 py-2 transition-colors hover:border-[hsl(var(--color-ring-soft)/0.5)] hover:bg-[hsl(var(--color-surface-soft)/0.7)]"
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex size-9 items-center justify-center rounded-full bg-[hsl(var(--color-surface-soft)/0.75)]">
                  <Github className="size-5" aria-hidden="true" />
                </span>
                GitHub Repository
              </span>
              <ExternalLink className="size-4 opacity-70 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </Link>

            <Link
              href="https://vercel.com/ai-gateway"
              target="_blank"
              rel="noreferrer"
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-transparent px-3 py-2 transition-colors hover:border-[hsl(var(--color-ring-soft)/0.5)] hover:bg-[hsl(var(--color-surface-soft)/0.7)]"
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex size-9 items-center justify-center rounded-full bg-[hsl(var(--color-surface-soft)/0.75)]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 256 221"
                    className="h-5 w-5 text-[hsl(var(--color-foreground))]"
                    fill="currentColor"
                  >
                    <path d="M128 0l128 221.702H0z" />
                  </svg>
                </span>
                Vercel AI Gateway
              </span>
              <ExternalLink className="size-4 opacity-70 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </Link>
          </div>

          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
            Tip: set <code className="rounded-sm bg-[hsl(var(--color-muted)/0.4)] px-1 py-0.5 text-[hsl(var(--color-foreground))]">AI_GATEWAY_API_KEY</code>{' '}
            in <code className="rounded-sm bg-[hsl(var(--color-muted)/0.4)] px-1 py-0.5 text-[hsl(var(--color-foreground))]">.env.local</code> before generating documents.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={handleClose}
            className="rounded-full bg-[hsl(var(--color-primary))] px-6 text-[hsl(var(--color-primary-foreground))] shadow-[0_20px_45px_-32px_hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary)/0.85)]"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
