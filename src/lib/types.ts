export type IDECopilot =
  | 'windsurf'
  | 'cursor'
  | 'vscode_copilot'
  | 'claude_code'
  | 'cline'
  | 'other'
  | 'none';

export type DBChoice = 'none' | 'you-choose' | 'supabase' | 'firebase' | 'planetscale' | 'neon' | 'sqlite' | 'other';

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
    auth: 'none' | 'you-choose' | 'supabase_auth' | 'authjs' | 'clerk' | 'other' | 'better-auth';
  };
  ai: {
    vercelAISDK: boolean;
    appModels?: string[]; // AI models for the app (if using AI SDK)
    copilot: IDECopilot;
  };
  prdAgents?: {
    marketAnalyst: boolean;
    scopePlanner: boolean;
    nextjsArchitect: boolean;
    aiDesigner: boolean;
    dataApiDesigner: boolean;
    securityOfficer: boolean;
    performanceEngineer: boolean;
    qualityLead: boolean;
  };
  testing: {
    enabled: boolean;
    unit: 'jest' | 'vitest' | 'none';
    e2e: 'cypress' | 'playwright' | 'none';
  };
  constraints?: string; // perf, accessibility, compliance, etc.
  docGenerationModel?: string; // model used to generate documentation
}
