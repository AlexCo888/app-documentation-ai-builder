'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, inferSelectionsFromIdea } from '@/lib/utils';
import type { Answers, FrameworkChoice, DBChoice, IDECopilot } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, CircuitBoard, Cpu, Database, Rocket, Sparkles, Workflow, Check } from 'lucide-react';

type AuthChoice = 'none' | 'supabase_auth' | 'authjs' | 'clerk' | 'other';

type Step = {
  id: number;
  label: string;
  blurb: string;
  icon: LucideIcon;
};

const steps: Step[] = [
  { id: 1, label: 'Vision Brief', blurb: 'Describe the product spark and key constraints.', icon: Sparkles },
  { id: 2, label: 'Stack Blueprint', blurb: 'Lock in framework, styling, and hosting.', icon: CircuitBoard },
  { id: 3, label: 'AI Ensemble', blurb: 'Pick Gateway models, copilots, and checks.', icon: Workflow },
  { id: 4, label: 'Launch Prep', blurb: 'Verify the recipe, then generate docs.', icon: Rocket }
];

const frameworkOptions: Array<{ value: FrameworkChoice; label: string; note: string }> = [
  { value: 'nextjs_app', label: 'Next.js 15', note: 'Edge-first App Router' },
  { value: 'remix', label: 'Remix', note: 'Nested data loaders' },
  { value: 'sveltekit', label: 'SvelteKit', note: 'Islands + SSR' },
  { value: 'astro', label: 'Astro', note: 'Content-focused islands' },
  { value: 'express', label: 'Express + Vite', note: 'Node classic + Vite DX' },
  { value: 'other', label: 'Other', note: 'Roll your own' }
];

const dbOptions: Array<{ value: DBChoice; label: string }> = [
  { value: 'none', label: 'No database yet' },
  { value: 'supabase', label: 'Supabase (Postgres)' },
  { value: 'neon', label: 'Neon (Postgres)' },
  { value: 'planetscale', label: 'PlanetScale (MySQL)' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'firebase', label: 'Firebase' },
  { value: 'other', label: 'Other' }
];

const authOptions: Array<{ value: AuthChoice; label: string }> = [
  { value: 'none', label: 'No auth right now' },
  { value: 'supabase_auth', label: 'Supabase Auth' },
  { value: 'authjs', label: 'Auth.js' },
  { value: 'clerk', label: 'Clerk' },
  { value: 'other', label: 'Other' }
];

const copilotOptions: Array<{ value: IDECopilot; label: string }> = [
  { value: 'windsurf', label: 'Windsurf' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'vscode_copilot', label: 'VS Code + Copilot' },
  { value: 'claude_code', label: 'Claude Code' },
  { value: 'cline', label: 'Cline' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'None' }
];

const unitOptions: Array<'jest' | 'vitest' | 'none'> = ['jest', 'vitest', 'none'];
const e2eOptions: Array<'cypress' | 'playwright' | 'none'> = ['cypress', 'playwright', 'none'];

export default function Questionnaire({
  defaultModel,
  onComplete
}: {
  defaultModel: string;
  onComplete: (answers: Answers) => void;
}) {
  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState('');
  const inferred = useMemo(() => inferSelectionsFromIdea(idea), [idea]);

  const [framework, setFramework] = useState<FrameworkChoice>('nextjs_app');
  const [tailwind, setTailwind] = useState(true);
  const [shadcn, setShadcn] = useState(true);
  const [stylingOther, setStylingOther] = useState('');

  const [useVercel, setUseVercel] = useState(true);
  const [db, setDb] = useState<DBChoice>('none');
  const [auth, setAuth] = useState<AuthChoice>('none');

  const [useAISDK, setUseAISDK] = useState(true);
  const [qaAgent, setQaAgent] = useState(true);
  const [archAgent, setArchAgent] = useState(true);
  const [ideAgent, setIdeAgent] = useState(true);
  const [ide, setIde] = useState<IDECopilot>('vscode_copilot');

  const [testing, setTesting] = useState(true);
  const [unit, setUnit] = useState<'jest' | 'vitest' | 'none'>('jest');
  const [e2e, setE2e] = useState<'cypress' | 'playwright' | 'none'>('cypress');

  const [constraints, setConstraints] = useState('');
  const [model, setModel] = useState<string>(defaultModel);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, string[]>>({});
  const [modelFetchError, setModelFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!idea.trim()) return;
    setFramework(inferred.framework);
    setTailwind((prev) => inferred.tailwind || prev);
    setShadcn((prev) => inferred.shadcn || prev);
    setUseAISDK((prev) => inferred.vercelAISDK || prev);
    setIde(inferred.copilot);
    if (db === 'none' && inferred.db !== 'none') setDb(inferred.db as DBChoice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea]);

  useEffect(() => {
    let cancelled = false;
    async function fetchModels() {
      try {
        const response = await fetch('https://ai-sdk.dev/llms.txt');
        const text = await response.text();
        if (cancelled) return;
        const lines = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'));
        if (!lines.length) throw new Error('no-models');
        const grouped: Record<string, string[]> = {};
        for (const id of lines) {
          const [provider = 'other'] = id.split('/');
          (grouped[provider] ||= []).push(id);
        }
        if (defaultModel && !lines.includes(defaultModel)) {
          const [pv = 'custom'] = defaultModel.split('/');
          grouped[pv] = [defaultModel, ...(grouped[pv] ?? [])];
        }
        setModelsByProvider(
          Object.fromEntries(
            Object.entries(grouped).map(([provider, ids]) => [provider, Array.from(new Set(ids))])
          )
        );
        setModelFetchError(null);
      } catch {
        if (cancelled) return;
        setModelFetchError('Could not load model catalog. Paste your Gateway identifier below.');
        setModelsByProvider({ recommended: [defaultModel || 'openai/gpt-5'] });
      }
    }
    fetchModels();
    return () => {
      cancelled = true;
    };
  }, [defaultModel]);

  const ideaSignals = useMemo(() => {
    const signals = new Set<string>();
    signals.add(
      frameworkOptions.find((entry) => entry.value === inferred.framework)?.label ?? 'Next.js 15'
    );
    if (inferred.tailwind) signals.add('Tailwind');
    if (inferred.shadcn) signals.add('shadcn/ui');
    if (inferred.vercelAISDK) signals.add('AI SDK 5');
    if (inferred.db && inferred.db !== 'none') {
      const label = dbOptions.find((entry) => entry.value === inferred.db)?.label;
      if (label) signals.add(label);
    }
    if (inferred.copilot && inferred.copilot !== 'none') {
      const label = copilotOptions.find((entry) => entry.value === inferred.copilot)?.label;
      if (label) signals.add(label);
    }
    return Array.from(signals);
  }, [inferred]);

  const providerEntries = useMemo(
    () => Object.entries(modelsByProvider).sort(([a], [b]) => a.localeCompare(b)),
    [modelsByProvider]
  );

  function next() {
    setStep((current) => Math.min(4, current + 1));
  }

  function back() {
    setStep((current) => Math.max(1, current - 1));
  }

  function finish() {
    const answers: Answers = {
      idea,
      framework,
      wantsNextStructure: true,
      styling: { tailwind, shadcn, other: stylingOther || undefined },
      backend: { useVercel, db, auth },
      ai: {
        vercelAISDK: useAISDK,
        agents: { qa: qaAgent, architecture: archAgent, ideOptimization: ideAgent },
        copilot: ide
      },
      testing: { enabled: testing, unit, e2e },
      constraints: constraints || undefined,
      model: model || defaultModel
    };
    onComplete(answers);
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === step;
          const isDone = item.id < step;
          return (
            <div
              key={item.id}
              className={cn(
                'rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.75)] p-5 transition-all',
                isActive && 'ring-2 ring-[hsl(var(--color-primary)/0.35)]',
                isDone && 'opacity-75'
              )}
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    'border-transparent text-[0.65rem] uppercase tracking-[0.3em]',
                    isActive
                      ? 'bg-[hsl(var(--color-primary)/0.18)] text-[hsl(var(--color-primary))]'
                      : 'bg-[hsl(var(--color-muted)/0.45)] text-[hsl(var(--color-muted-foreground))]'
                  )}
                >
                  {item.label}
                </Badge>
                <Icon className={cn('size-6 opacity-60', isActive && 'text-[hsl(var(--color-primary))]')} />
              </div>
              <p className="mt-3 text-sm text-[hsl(var(--color-muted-foreground))]">{item.blurb}</p>
            </div>
          );
        })}
      </header>

      {step === 1 && (
        <section className="space-y-4 rounded-[calc(var(--radius-lg)+0.75rem)] border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.8)] p-8 shadow-[0_25px_60px_-40px_hsl(var(--shadow))] backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">Project vision</h2>
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
              Write the pitch, target audience, MVP scope, or anything the AI should know.
            </p>
          </div>
          <Textarea
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder="Example: Build a compliance-ready founder dashboard with SOC2 auth, AI changelog summaries, and Neon-backed analytics."
            className="min-h-[160px] resize-none rounded-3xl border-none bg-[hsl(var(--color-muted)/0.4)] p-6 text-base text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-muted-foreground))] focus-visible:ring-[hsl(var(--color-primary)/0.25)]"
          />
          {ideaSignals.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {ideaSignals.map((signal) => (
                <Badge
                  key={signal}
                  variant="outline"
                  className="border-[hsl(var(--color-primary)/0.35)] bg-[hsl(var(--color-primary)/0.12)] text-[hsl(var(--color-primary))]"
                >
                  {signal}
                </Badge>
              ))}
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="space-y-8 rounded-[calc(var(--radius-lg)+0.75rem)] border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.8)] p-8 shadow-[0_25px_60px_-40px_hsl(var(--shadow))] backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-3">
            {frameworkOptions.map((option) => {
              const isActive = framework === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFramework(option.value)}
                  className={cn(
                    'flex h-full cursor-pointer flex-col justify-between rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--color-ring-soft)/0.5)] hover:shadow-[0_26px_48px_-30px_hsl(var(--color-ring-soft))]',
                    isActive
                      ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.16)] text-[hsl(var(--color-foreground))] shadow-[0_30px_55px_-35px_hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border)/0.45)] bg-[hsl(var(--color-card)/0.7)] text-[hsl(var(--color-foreground))]'
                  )}
                >
                  <span className="text-base font-semibold">{option.label}</span>
                  <span className="mt-3 text-xs text-[hsl(var(--color-muted-foreground))]">{option.note}</span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
            <div className="space-y-4 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] p-6">
              <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">Styling DNA</Label>
              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setTailwind((prev) => !prev)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    tailwind
                      ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.18)] text-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border)/0.6)] text-[hsl(var(--color-muted-foreground))] hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:text-[hsl(var(--color-foreground))]'
                  )}
                >
                  Tailwind
                </button>
                <button
                  type="button"
                  onClick={() => setShadcn((prev) => !prev)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    shadcn
                      ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.18)] text-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border)/0.6)] text-[hsl(var(--color-muted-foreground))] hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:text-[hsl(var(--color-foreground))]'
                  )}
                >
                  shadcn/ui
                </button>
              </div>
              <Input
                value={stylingOther}
                onChange={(event) => setStylingOther(event.target.value)}
                placeholder="Extra styling notes (tokens, theming, etc.)"
                className="rounded-2xl border-none bg-[hsl(var(--color-muted)/0.4)]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] p-5">
                <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">Database</Label>
                <Select value={db} onValueChange={(value) => setDb(value as DBChoice)}>
                  <SelectTrigger className="w-full rounded-2xl">
                    <SelectValue placeholder="Pick one" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] p-5">
                <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">Auth</Label>
                <Select value={auth} onValueChange={(value) => setAuth(value as AuthChoice)}>
                  <SelectTrigger className="w-full rounded-2xl">
                    <SelectValue placeholder="Auth option" />
                  </SelectTrigger>
                  <SelectContent>
                    {authOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                onClick={() => setUseVercel((prev) => !prev)}
                aria-pressed={useVercel}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-3xl border px-5 py-4 text-left transition-all duration-300 sm:col-span-2 hover:-translate-y-0.5 hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:shadow-[0_22px_42px_-30px_hsl(var(--color-ring-soft))]',
                  useVercel
                    ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.16)] text-[hsl(var(--color-primary))]'
                    : 'border-[hsl(var(--color-border)/0.55)] bg-[hsl(var(--color-card)/0.65)] text-[hsl(var(--color-muted-foreground))]'
                )}
              >
                <div>
                  <p className="text-sm font-semibold tracking-wide">Deploy on Vercel</p>
                  <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                    Toggle to include Edge config, env matrix, and preview strategy.
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em]',
                    useVercel
                      ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.25)] text-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border)/0.7)] bg-[hsl(var(--color-muted)/0.4)] text-[hsl(var(--color-muted-foreground))]'
                  )}
                >
                  {useVercel ? 'Enabled' : 'Optional'}
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-8 rounded-[calc(var(--radius-lg)+0.75rem)] border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.82)] p-8 shadow-[0_25px_60px_-40px_hsl(var(--shadow))] backdrop-blur-xl">
          <div className="space-y-4 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.75)] p-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">
                Vercel AI Gateway model
              </Label>
              <Badge variant="outline" className="bg-[hsl(var(--color-primary)/0.18)] text-[hsl(var(--color-primary))]">
                {model || defaultModel}
              </Badge>
            </div>
            <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
              Choose from the live Gateway catalog or paste a custom identifier.
            </p>
            <ScrollArea className="max-h-[220px] rounded-2xl border border-[hsl(var(--color-border)/0.4)] bg-[hsl(var(--color-card)/0.6)] p-4">
              <div className="space-y-3">
                {providerEntries.map(([provider, ids]) => (
                  <div key={provider} className="space-y-2">
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--color-muted-foreground))]">
                      {provider}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ids.slice(0, 5).map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setModel(id)}
                          className={cn(
                            'rounded-full border px-4 py-1.5 text-xs font-semibold',
                            model === id
                              ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.2)] text-[hsl(var(--color-primary))]'
                              : 'border-[hsl(var(--color-border)/0.4)] text-[hsl(var(--color-muted-foreground))]'
                          )}
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="openai/gpt-5, anthropic/claude-4.5-sonnet, ..."
              className="rounded-2xl border-none bg-[hsl(var(--color-muted)/0.35)]"
            />
            {modelFetchError && <p className="text-xs text-red-400">{modelFetchError}</p>}
            <button
              type="button"
              onClick={() => setUseAISDK((prev) => !prev)}
              className={cn(
                'w-fit cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] transition-colors duration-200',
                useAISDK
                  ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.18)] text-[hsl(var(--color-primary))]'
                  : 'border-[hsl(var(--color-border)/0.6)] text-[hsl(var(--color-muted-foreground))] hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:text-[hsl(var(--color-foreground))]'
              )}
            >
              {useAISDK ? 'AI SDK enabled' : 'Skip AI SDK'}
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.75)] p-6">
              <div className="flex items-center gap-3">
                <Cpu className="size-5 text-[hsl(var(--color-primary))]" />
                <p className="text-sm font-semibold text-[hsl(var(--color-foreground))]">Companion agents</p>
              </div>
              {[
                {
                  label: 'QA engineer',
                  detail: 'Recommends coverage, linting, and regression tooling.',
                  active: qaAgent,
                  toggle: () => setQaAgent((prev) => !prev)
                },
                {
                  label: 'Architecture coach',
                  detail: 'Suggests folder topologies, scaling patterns, and guardrails.',
                  active: archAgent,
                  toggle: () => setArchAgent((prev) => !prev)
                },
                {
                  label: 'IDE optimizer',
                  detail: 'Configs extensions, keymaps, and CLI ergonomics.',
                  active: ideAgent,
                  toggle: () => setIdeAgent((prev) => !prev)
                }
              ].map((agent) => (
                <button
                  key={agent.label}
                  type="button"
                  onClick={agent.toggle}
                  aria-pressed={agent.active}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:shadow-[0_26px_48px_-32px_hsl(var(--color-ring-soft))]',
                    agent.active
                      ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] text-[hsl(var(--color-muted-foreground))]'
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-[hsl(var(--color-foreground))]">{agent.label}</span>
                    <span className="text-[0.7rem] text-[hsl(var(--color-muted-foreground))]">
                      {agent.detail}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'grid size-8 place-items-center rounded-full border transition-colors',
                      agent.active
                        ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.2)] text-[hsl(var(--color-primary))]'
                        : 'border-[hsl(var(--color-border)/0.7)] text-[hsl(var(--color-muted-foreground))]'
                    )}
                    aria-hidden="true"
                  >
                    {agent.active && <Check className="size-4" />}
                  </span>
                </button>
              ))}
              <Select value={ide} onValueChange={(value) => setIde(value as IDECopilot)}>
                <SelectTrigger className="w-full rounded-2xl">
                  <SelectValue placeholder="IDE / copilot" />
                </SelectTrigger>
                <SelectContent>
                  {copilotOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.75)] p-6">
              <div className="flex items-center gap-3">
                <Database className="size-5 text-[hsl(var(--color-primary))]" />
                <p className="text-sm font-semibold text-[hsl(var(--color-foreground))]">Quality gates</p>
              </div>
              <button
                type="button"
                onClick={() => setTesting((prev) => !prev)}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:shadow-[0_22px_44px_-30px_hsl(var(--color-ring-soft))]',
                  testing
                    ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary))]'
                    : 'border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] text-[hsl(var(--color-muted-foreground))]'
                )}
              >
                {testing ? 'Testing enabled' : 'Skip testing setup'}
              </button>
              {testing && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select value={unit} onValueChange={(value) => setUnit(value as typeof unit)}>
                  <SelectTrigger className="w-full rounded-2xl">
                    <SelectValue placeholder="Unit testing" />
                  </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={e2e} onValueChange={(value) => setE2e(value as typeof e2e)}>
                  <SelectTrigger className="w-full rounded-2xl">
                    <SelectValue placeholder="E2E testing" />
                  </SelectTrigger>
                    <SelectContent>
                      {e2eOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-6 rounded-[calc(var(--radius-lg)+0.75rem)] border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.85)] p-8 shadow-[0_25px_60px_-40px_hsl(var(--shadow))] backdrop-blur-xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Framework', value: frameworkOptions.find((f) => f.value === framework)?.label ?? framework },
              {
                label: 'Styling',
                value: [tailwind && 'Tailwind', shadcn && 'shadcn/ui', stylingOther || null]
                  .filter(Boolean)
                  .join(' · ') || 'Minimal'
              },
              { label: 'Hosting', value: useVercel ? 'Vercel' : 'Custom' },
              { label: 'Database', value: dbOptions.find((entry) => entry.value === db)?.label ?? db },
              { label: 'Auth', value: authOptions.find((entry) => entry.value === auth)?.label ?? auth },
              { label: 'Gateway model', value: model || defaultModel },
              {
                label: 'Agents',
                value: [
                  qaAgent && 'QA',
                  archAgent && 'Architecture',
                  ideAgent && 'IDE'
                ]
                  .filter(Boolean)
                  .join(', ') || 'None'
              },
              {
                label: 'Testing',
                value: testing ? `${unit.toUpperCase()} + ${e2e.toUpperCase()}` : 'Deferred'
              },
              {
                label: 'Copilot',
                value: copilotOptions.find((entry) => entry.value === ide)?.label ?? ide
              }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.7)] p-5"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--color-muted-foreground))]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-[hsl(var(--color-foreground))]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">
              Constraints, success metrics & other notes (optional)
            </Label>
            <Textarea
              value={constraints}
              onChange={(event) => setConstraints(event.target.value)}
              placeholder="Performance budgets, compliance requirements, roll-out strategy..."
              className="min-h-[110px] resize-none rounded-3xl border-none bg-[hsl(var(--color-muted)/0.35)] p-5 text-sm focus-visible:ring-[hsl(var(--color-primary)/0.25)]"
            />
          </div>
        </section>
      )}

      <footer className="flex flex-col gap-4 border-t border-[hsl(var(--color-border)/0.4)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          onClick={back}
          disabled={step === 1}
          className="w-full justify-center gap-2 rounded-full border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] sm:w-auto"
        >
          Back
        </Button>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {step < 4 && (
            <Button
              onClick={next}
              className="w-full justify-center gap-2 rounded-full bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] hover:bg-[hsl(var(--color-primary)/0.9)] sm:w-auto"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          )}
          {step === 4 && (
            <Button
              onClick={finish}
              className="w-full justify-center gap-2 rounded-full bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] hover:bg-[hsl(var(--color-primary)/0.9)] sm:w-auto"
            >
              Generate documents
              <Rocket className="size-4" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
