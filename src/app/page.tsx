'use client';

import { useMemo, useState } from 'react';
import Questionnaire from '@/components/Questionnaire';
import { Markdown } from '@/components/Markdown';
import DownloadButton from '@/components/DownloadButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ArrowRight, Loader2, RefreshCw, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { Answers } from '@/lib/types';
import { IntroModal } from '@/components/IntroModal';

const DEFAULT_MODEL = process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'openai/gpt-5';

type FileOut = { name: string; content: string };
type GenerateResponse = { ok: boolean; files?: FileOut[]; error?: string };

export default function Page() {
  const [files, setFiles] = useState<FileOut[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');

  async function handleComplete(answers: Answers) {
    setLoading(true);
    setError(null);
    setFiles(null);
    setSelectedFile(null);
    setProgressMessage('Starting generation...');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ answers }),
        headers: { 'content-type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error('Failed to start generation');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event: (.+)$/m);
          const dataMatch = line.match(/^data: (.+)$/m);

          if (eventMatch && dataMatch) {
            const event = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (event === 'progress') {
              setProgressMessage(data.message || 'Processing...');
            } else if (event === 'complete') {
              if (data.ok && data.files) {
                setFiles(data.files);
                setSelectedFile(data.files[0]);
                setProgressMessage('');
              } else {
                throw new Error('Invalid response format');
              }
            } else if (event === 'error') {
              throw new Error(data.error || 'Generation failed');
            }
          }
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(message);
      setProgressMessage('');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFiles(null);
    setError(null);
    setSelectedFile(null);
  }

  const stepLabels = useMemo(
    () => [
      { title: 'Define', description: 'Describe your product requirements and constraints.' },
      { title: 'Configure', description: 'Choose your tech stack, hosting, database, and authentication.' },
      { title: 'Select Models', description: 'Pick AI models from Vercel AI Gateway for generation.' },
      { title: 'Generate', description: 'Create PRD documentation, MCP manifest, and implementation plan.' }
    ],
    []
  );

  const highlightTone = {
    primary: 'text-[hsl(var(--color-primary))]',
    accent: 'text-[hsl(var(--color-accent))]',
    foreground: 'text-[hsl(var(--color-foreground))]'
  } as const;

  return (
    <div className="flex flex-1 flex-col gap-12 pb-16">
      <IntroModal />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="glass-panel relative overflow-hidden rounded-[calc(var(--radius-lg)+0.8rem)] p-8 md:p-10">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--color-primary)/0.22),transparent_55%)] opacity-70 blur-2xl" />
          <Badge variant="outline" className="bg-[hsl(var(--color-primary)/0.12)] text-[hsl(var(--color-primary))]">
            Generative Docs Lab
          </Badge>
          <h2 className="mt-8 max-w-xl text-3xl font-semibold leading-snug md:text-4xl">
            Generate complete product documentation from your requirements in a single workflow.
          </h2>
          <p className="mt-5 max-w-2xl text-base text-[hsl(var(--color-muted-foreground))] md:text-lg">
            An AI-powered pipeline that generates PRDs, agent manifests, and implementation guides.
            Configure your settings, preview the results, and export as markdown files.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Quality Scoring', value: 'Real-time validation', tone: 'primary' as const },
              { label: 'Model Selection', value: 'Choose any AI Gateway model', tone: 'accent' as const },
              { label: 'Document Export', value: 'Download as markdown', tone: 'foreground' as const }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[hsl(var(--color-border)/0.7)] bg-[hsl(var(--color-card)/0.7)] p-4 shadow-[0_18px_32px_-28px_hsl(var(--color-ring))] backdrop-blur-lg"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-[hsl(var(--color-muted-foreground))]">
                  {item.label}
                </p>
                <p className={cn('mt-2 text-sm font-medium', highlightTone[item.tone])}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel flex h-full flex-col gap-6 rounded-[calc(var(--radius-lg)+0.8rem)] p-8">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-[hsl(var(--color-muted-foreground))]">
            <Wand2 className="size-5 text-[hsl(var(--color-primary))]" />
            Generation Steps
          </div>
          <ol className="space-y-4">
            {stepLabels.map((step, index) => (
              <li
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-[hsl(var(--color-border)/0.7)] bg-[hsl(var(--color-card)/0.65)] p-4 backdrop-blur-lg"
              >
                <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-[hsl(var(--color-primary)/0.1)] to-[hsl(var(--color-ring)/0.25)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="text-xs uppercase tracking-[0.32em] text-[hsl(var(--color-muted-foreground))]">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-lg font-semibold text-[hsl(var(--color-foreground))]">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {!files && !loading && (
        <Card className="glass-panel border-none bg-[hsl(var(--color-card)/0.82)] p-0 shadow-[var(--shadow-floating)]">
          <CardHeader className="border-b border-[hsl(var(--color-border)/0.7)] pb-8">
            <CardTitle className="text-2xl font-semibold">Project Configuration</CardTitle>
            <CardDescription className="text-base">
              Configure your frameworks, tech stack, requirements, and AI models. Your inputs are used to generate
              tailored documentation via Vercel AI SDK 5.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10 pt-8">
            <Questionnaire defaultModel={DEFAULT_MODEL} onComplete={handleComplete} />
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="glass-panel border-none bg-[hsl(var(--color-card)/0.82)] p-0 text-[hsl(var(--color-muted-foreground))] shadow-[var(--shadow-floating)]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[hsl(var(--color-border)/0.7)] pb-6">
            <div>
              <CardTitle className="text-xl font-semibold text-[hsl(var(--color-foreground))]">
                Generating documentation
              </CardTitle>
              <CardDescription>
                {progressMessage || 'Running AI agents, streaming responses, and creating documentation.'}
              </CardDescription>
            </div>
            <Loader2 className="size-8 animate-spin text-[hsl(var(--color-primary))]" aria-hidden="true" />
          </CardHeader>
          <CardContent className="px-8 py-10">
            <div className="rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-muted)/0.35)] p-6">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="size-5 animate-spin text-[hsl(var(--color-primary))]" />
                <p className="text-sm font-medium tracking-wide text-[hsl(var(--color-foreground))]">
                  {progressMessage || 'Processing...'}
                </p>
              </div>
              <p className="mt-4 text-center text-xs text-[hsl(var(--color-muted-foreground))]">
                This may take 5-10 minutes for complex projects. Real-time updates will appear above.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="glass-panel border-none bg-[hsl(var(--color-card)/0.88)] p-0 text-[hsl(var(--color-muted-foreground))] shadow-[var(--shadow-floating)]">
          <CardContent className="flex flex-col gap-4 px-8 py-6">
            <p className="text-base text-red-500">Error: {error}</p>
            <Button onClick={reset} className="w-fit">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {files && selectedFile && (
        <section className="grid gap-8 lg:grid-cols-[minmax(260px,320px)_1fr]">
          <Card className="glass-panel border-none bg-[hsl(var(--color-card)/0.85)] p-0 shadow-[var(--shadow-floating)]">
            <CardHeader className="border-b border-[hsl(var(--color-border)/0.6)] pb-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                Generated Files
              </CardTitle>
              <CardDescription>
                Browse generated documents and export them as markdown files.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-6">
              <div className="flex flex-col gap-3">
                {files.map((file) => {
                  const isActive = selectedFile.name === file.name;
                  return (
                    <Button
                      key={file.name}
                      variant="ghost"
                      className={cn(
                        'group flex w-full cursor-pointer justify-between rounded-xl border px-4 py-4 text-left text-sm font-semibold transition-all duration-300',
                        'bg-[hsl(var(--color-card)/0.85)] border-[hsl(var(--color-border)/0.45)] text-[hsl(var(--color-foreground))] hover:border-[hsl(var(--color-ring-soft)/0.6)] hover:bg-[hsl(var(--color-surface-soft)/0.55)] hover:text-[hsl(var(--color-foreground))] hover:shadow-[0_18px_42px_-28px_hsl(var(--color-ring-soft))]',
                        isActive &&
                          'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.18)] text-[hsl(var(--color-primary-foreground))] shadow-[0_24px_55px_-30px_hsl(var(--color-primary))]'
                      )}
                      onClick={() => setSelectedFile(file)}
                    >
                      <span className="truncate">{file.name}</span>
                      <ArrowRight
                        className={cn(
                          'size-4 transition-transform duration-300',
                          isActive
                            ? 'text-[hsl(var(--color-primary-foreground))]'
                            : 'text-[hsl(var(--color-muted-foreground))]',
                          'group-hover:translate-x-1'
                        )}
                        aria-hidden="true"
                      />
                    </Button>
                  );
                })}
              </div>
            </CardContent>
            <CardContent className="border-t border-[hsl(var(--color-border)/0.6)] px-4 py-6">
              <Button
                variant="ghost"
                className="w-full cursor-pointer justify-center gap-2 rounded-xl border border-[hsl(var(--color-border)/0.4)] bg-[hsl(var(--color-card)/0.85)] py-4 text-sm font-semibold text-[hsl(var(--color-foreground))] transition-all hover:border-[hsl(var(--color-ring-soft)/0.55)] hover:bg-[hsl(var(--color-surface-soft)/0.6)] hover:text-[hsl(var(--color-foreground))]"
                onClick={reset}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Start a new project
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-panel border-none bg-[hsl(var(--color-card)/0.9)] p-0 shadow-[0_30px_80px_-45px_hsl(var(--shadow))]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[hsl(var(--color-border)/0.6)] pb-6">
              <div>
                <CardTitle className="text-xl font-semibold text-[hsl(var(--color-foreground))]">
                  {selectedFile.name}
                </CardTitle>
                <CardDescription>
                  Preview the generated markdown and download the file.
                </CardDescription>
              </div>
              <DownloadButton filename={selectedFile.name} content={selectedFile.content} />
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto px-6 py-6 md:px-8 md:py-8 scrollbar-slim">
              <Markdown content={selectedFile.content} />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
