export type IDECopilot =
  | 'windsurf'
  | 'cursor'
  | 'vscode_copilot'
  | 'claude_code'
  | 'cline'
  | 'other'
  | 'none';

export type DBChoice = 'none' | 'supabase' | 'firebase' | 'planetscale' | 'neon' | 'sqlite' | 'other';

export type FrameworkChoice =
  | 'nextjs_app'
  | 'remix'
  | 'sveltekit'
  | 'astro'
  | 'express'
  | 'other';

export interface Answers {
  idea: string;
  framework: FrameworkChoice;
  wantsNextStructure: boolean; // always true by default for Next.js structure output
  styling: {
    tailwind: boolean;
    shadcn: boolean;
    other?: string;
  };
  backend: {
    useVercel: boolean;
    db: DBChoice;
    auth: 'none' | 'supabase_auth' | 'authjs' | 'clerk' | 'other';
  };
  ai: {
    vercelAISDK: boolean;
    agents: {
      qa: boolean;
      architecture: boolean;
      ideOptimization: boolean;
    };
    copilot: IDECopilot;
  };
  testing: {
    enabled: boolean;
    unit: 'jest' | 'vitest' | 'none';
    e2e: 'cypress' | 'playwright' | 'none';
  };
  constraints?: string; // perf, accessibility, compliance, etc.
  model?: string; // override default model
}
