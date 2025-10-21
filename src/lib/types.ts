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

export type DesignPattern = 
  | 'minimal-modern'
  | 'glassmorphism'
  | 'neumorphism'
  | 'brutalist'
  | 'gradient-vibrant'
  | 'soft-shadows'
  | 'flat-minimal'
  | 'tech-dark'
  | 'elegant-light'
  | 'playful-rounded'
  | 'sharp-corporate'
  | 'artistic-bold'
  | 'nature-organic'
  | 'neon-cyber'
  | 'luxury-premium';

export type ColorScheme = 'vibrant' | 'muted' | 'monochrome' | 'pastel' | 'dark' | 'custom';
export type BorderRadius = 'sharp' | 'rounded' | 'pill';
export type ShadowStyle = 'none' | 'soft' | 'medium' | 'dramatic';
export type AnimationStyle = 'none' | 'subtle' | 'smooth' | 'playful';
export type TypographyStyle = 'modern-sans' | 'classic-serif' | 'tech-mono' | 'humanist';

export interface DesignCustomization {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadiusValue: number; // in rem
  shadowXOffset: number; // in px
  shadowYOffset: number; // in px
  shadowBlur: number; // in px
  shadowSpread: number; // in px
  shadowColor: string;
}

export interface Answers {
  idea: string;
  framework: FrameworkChoice;
  frameworkOther?: string; // Custom framework description when "other" is selected
  wantsNextStructure: boolean; // always true by default for Next.js structure output
  styling: {
    tailwind: boolean;
    shadcn: boolean;
    designPattern?: DesignPattern; // User-selected visual design pattern
    customization?: DesignCustomization; // Custom design values when pattern is selected
    darkMode: boolean; // Whether to implement dark mode
    colorScheme: ColorScheme;
    borderRadius: BorderRadius;
    shadowStyle: ShadowStyle;
    animationStyle: AnimationStyle;
    typography: TypographyStyle;
    spacing: 'compact' | 'comfortable' | 'spacious';
    other?: string; // Additional custom styling notes
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
