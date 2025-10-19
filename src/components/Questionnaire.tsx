'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { inferSelectionsFromIdea } from '@/lib/utils';
import type { Answers, FrameworkChoice, DBChoice, IDECopilot } from '@/lib/types';

const frameworks: { value: FrameworkChoice; label: string }[] = [
  { value: 'nextjs_app', label: 'Next.js 15 (App Router)' },
  { value: 'remix', label: 'Remix' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'astro', label: 'Astro' },
  { value: 'express', label: 'Express + Vite' },
  { value: 'other', label: 'Other' }
];

const dbs: { value: DBChoice; label: string }[] = [
  { value: 'none', label: 'No database for now' },
  { value: 'supabase', label: 'Supabase (Postgres + Auth + Storage)' },
  { value: 'neon', label: 'Neon (Postgres)' },
  { value: 'planetscale', label: 'PlanetScale (MySQL)' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'firebase', label: 'Firebase' },
  { value: 'other', label: 'Other' }
];

const copilot: { value: IDECopilot; label: string }[] = [
  { value: 'windsurf', label: 'Windsurf' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'vscode_copilot', label: 'VS Code + Copilot' },
  { value: 'claude_code', label: 'Claude Code' },
  { value: 'cline', label: 'Cline' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'None' }
];

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

  // core state
  const [framework, setFramework] = useState<FrameworkChoice>('nextjs_app');
  const [tailwind, setTailwind] = useState<boolean>(true);
  const [shadcn, setShadcn] = useState<boolean>(true);
  const [stylingOther, setStylingOther] = useState<string>('');

  const [useVercel, setUseVercel] = useState<boolean>(true);
  const [db, setDb] = useState<DBChoice>('none');
  const [auth, setAuth] = useState<'none'|'supabase_auth'|'authjs'|'clerk'|'other'>('none');

  const [useAISDK, setUseAISDK] = useState<boolean>(true);
  const [qaAgent, setQaAgent] = useState<boolean>(true);
  const [archAgent, setArchAgent] = useState<boolean>(true);
  const [ideAgent, setIdeAgent] = useState<boolean>(true);
  const [ide, setIde] = useState<IDECopilot>('vscode_copilot');

  const [testing, setTesting] = useState<boolean>(true);
  const [unit, setUnit] = useState<'jest'|'vitest'|'none'>('jest');
  const [e2e, setE2e] = useState<'cypress'|'playwright'|'none'>('cypress');

  const [constraints, setConstraints] = useState('');
  const [model, setModel] = useState(defaultModel);

  // Dynamically adapt from natural language idea.
  useEffect(() => {
    if (!idea.trim()) return;
    setFramework(inferred.framework);
    setTailwind(inferred.tailwind || tailwind);
    setShadcn(inferred.shadcn || shadcn);
    setUseAISDK(inferred.vercelAISDK || useAISDK);
    setIde(inferred.copilot);
    if (db === 'none' && inferred.db !== 'none') setDb(inferred.db as DBChoice);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea]);

  function next() { setStep(s => Math.min(4, s + 1)); }
  function back() { setStep(s => Math.max(1, s - 1)); }

  function finish() {
    const answers: Answers = {
      idea,
      framework,
      wantsNextStructure: true, // always include Next structure section as requested
      styling: { tailwind, shadcn, other: stylingOther || undefined },
      backend: { useVercel: useVercel, db, auth },
      ai: {
        vercelAISDK: useAISDK,
        agents: { qa: qaAgent, architecture: archAgent, ideOptimization: ideAgent },
        copilot: ide
      },
      testing: { enabled: testing, unit, e2e },
      constraints: constraints || undefined,
      model
    };
    onComplete(answers);
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2 text-sm">
        {[1,2,3,4].map(i => (
          <div key={i} className={`px-2 py-1 rounded ${step === i ? 'bg-[--color-primary] text-white' : 'bg-[--color-muted]'}`}>Step {i}</div>
        ))}
      </div>

      {step === 1 && (
        <section className="space-y-3">
          <Label htmlFor="idea">Describe your project idea *</Label>
          <Textarea id="idea" placeholder="What are you building? Target users? Key features?"
            value={idea} onChange={e => setIdea(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Framework</Label>
              <Select value={framework} onValueChange={value => setFramework(value as FrameworkChoice)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map(f => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs opacity-70 mt-1">
                We’ll still output a canonical Next.js App Router structure to follow.
              </p>
            </div>
            <div>
              <Label>Default Model (Gateway id)</Label>
              <Input placeholder="openai/gpt-4o, anthropic/claude-3.5-sonnet, ..."
                     value={model} onChange={e => setModel(e.target.value)} />
              <p className="text-xs opacity-70 mt-1">
                Routed via Vercel AI Gateway (works automatically on Vercel).
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span />
            <Button onClick={next}>Next</Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Styling</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={tailwind}
                  onCheckedChange={checked => setTailwind(checked === true)}
                  id="tailwind"
                />
                <Label htmlFor="tailwind">Tailwind CSS v4</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={shadcn}
                  onCheckedChange={checked => setShadcn(checked === true)}
                  id="shadcn"
                />
                <Label htmlFor="shadcn">shadcn/ui</Label>
              </div>
              <Input placeholder="Other styling (optional)" value={stylingOther} onChange={e => setStylingOther(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Database / Backend</Label>
              <Select value={db} onValueChange={value => setDb(value as DBChoice)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dbs.map(d => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label className="mt-2">Auth</Label>
              <Select value={auth} onValueChange={value => setAuth(value as typeof auth)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="supabase_auth">Supabase Auth</SelectItem>
                  <SelectItem value="authjs">Auth.js</SelectItem>
                  <SelectItem value="clerk">Clerk</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  checked={useVercel}
                  onCheckedChange={checked => setUseVercel(checked === true)}
                  id="vercel"
                />
                <Label htmlFor="vercel">Deploy on Vercel</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>AI & Tooling</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={useAISDK}
                  onCheckedChange={checked => setUseAISDK(checked === true)}
                  id="aisdk"
                />
                <Label htmlFor="aisdk">Use Vercel AI SDK 5 + Gateway</Label>
              </div>
              <Label className="mt-2">IDE / AI Copilot</Label>
              <Select value={ide} onValueChange={value => setIde(value as IDECopilot)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {copilot.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={back}>Back</Button>
            <Button onClick={next}>Next</Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4">
          <Label>Agents (our app will run these roles when generating)</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={qaAgent}
                onCheckedChange={checked => setQaAgent(checked === true)}
                id="qa"
              />
              <Label htmlFor="qa">QA AI Engineer (tests/tools recommendations)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={archAgent}
                onCheckedChange={checked => setArchAgent(checked === true)}
                id="arch"
              />
              <Label htmlFor="arch">Architecture Advisor</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={ideAgent}
                onCheckedChange={checked => setIdeAgent(checked === true)}
                id="ide"
              />
              <Label htmlFor="ide">IDE Optimization Advisor</Label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={testing}
                  onCheckedChange={checked => setTesting(checked === true)}
                  id="testing"
                />
                <Label htmlFor="testing">Include testing setup</Label>
              </div>
              {testing && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <Label>Unit</Label>
                    <Select value={unit} onValueChange={value => setUnit(value as typeof unit)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jest">Jest</SelectItem>
                        <SelectItem value="vitest">Vitest</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>E2E</Label>
                    <Select value={e2e} onValueChange={value => setE2e(value as typeof e2e)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cypress">Cypress</SelectItem>
                        <SelectItem value="playwright">Playwright</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label>Constraints / priorities (optional)</Label>
              <Textarea placeholder="e.g., fast LCP, WCAG AA, GDPR, zero PII, < 100ms TTFB"
                        value={constraints} onChange={e => setConstraints(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={back}>Back</Button>
            <Button onClick={next}>Next</Button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-4">
          <p className="text-sm opacity-80">
            Review and generate. We’ll ask the LLM to produce: <b>PRD.md</b>, <b>AGENTS.md</b>, <b>IMPLEMENTATION.md</b>, and <b>MCP.md</b>.
          </p>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={back}>Back</Button>
            <Button onClick={finish}>Generate Documents</Button>
          </div>
        </section>
      )}
    </div>
  );
}
