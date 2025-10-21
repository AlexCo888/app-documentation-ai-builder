import { z } from 'zod';
import type { Answers } from '@/lib/types';

/**
 * Agent roles in the PRD generation swarm
 */
export type AgentRole =
  | 'orchestrator'
  | 'market-analyst'
  | 'scope-planner'
  | 'nextjs-architect'
  | 'ai-designer'
  | 'data-api-designer'
  | 'security-officer'
  | 'performance-engineer'
  | 'quality-lead';

/**
 * Agent state for tracking progress
 */
export interface AgentState {
  role: AgentRole;
  status: 'idle' | 'thinking' | 'working' | 'completed' | 'error';
  currentTask?: string;
  output?: string;
  artifacts?: Record<string, unknown>;
  error?: string;
}

/**
 * Message format for agent communication
 */
export interface AgentMessage {
  from: AgentRole;
  to: AgentRole | 'all';
  type: 'request' | 'response' | 'handoff' | 'error';
  content: string;
  artifacts?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Context shared across all agents
 */
export interface SwarmContext {
  answers: Answers;
  userId?: string;
  model?: string;
  prdOutline?: string;
  sections: Record<string, string>;
  dependencies: Record<string, string[]>;
  messages: AgentMessage[];
  agentStates: Record<AgentRole, AgentState>;
}

/**
 * Tool result schemas
 */
export const ResearchResultSchema = z.object({
  section: z.string().describe('PRD section name'),
  content: z.string().describe('Markdown content for this section'),
  dependencies: z.array(z.string()).optional().describe('Other sections this depends on'),
  metadata: z.record(z.string(), z.unknown()).optional().describe('Additional metadata')
});

export const HandoffSchema = z.object({
  toAgent: z.enum([
    'orchestrator',
    'market-analyst',
    'scope-planner',
    'nextjs-architect',
    'ai-designer',
    'data-api-designer',
    'security-officer',
    'performance-engineer',
    'quality-lead'
  ]).describe('Target agent to hand off to'),
  message: z.string().describe('Message for the target agent'),
  artifacts: z.record(z.string(), z.unknown()).optional().describe('Data to pass to next agent')
});

export const ValidationResultSchema = z.object({
  valid: z.boolean().describe('Whether the section is valid'),
  issues: z.array(z.string()).optional().describe('List of issues found'),
  suggestions: z.array(z.string()).optional().describe('Improvement suggestions')
});

export type ResearchResult = z.infer<typeof ResearchResultSchema>;
export type HandoffData = z.infer<typeof HandoffSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;

/**
 * Agent capability definition
 */
export interface AgentCapability {
  role: AgentRole;
  name: string;
  description: string;
  responsibilities: string[];
  outputs: string[];
  dependencies: AgentRole[];
  tools: string[];
}

/**
 * Complete agent swarm configuration
 */
export const AGENT_CAPABILITIES: Record<AgentRole, AgentCapability> = {
  'orchestrator': {
    role: 'orchestrator',
    name: 'PRD Orchestrator',
    description: 'Editor-in-Chief that aligns the swarm and compiles the final PRD',
    responsibilities: [
      'Create PRD outline and structure',
      'Coordinate agent execution order',
      'Resolve conflicts between agents',
      'Enforce scope boundaries',
      'Compile final PRD document'
    ],
    outputs: ['PRD outline', 'Final PRD', 'Conflict resolutions'],
    dependencies: [],
    tools: ['createOutline', 'validateSection', 'mergeContent', 'resolveConflict']
  },
  'market-analyst': {
    role: 'market-analyst',
    name: 'Dev Market & Persona Analyst',
    description: 'Builds the who/why for a dev audience',
    responsibilities: [
      'Segment developer personas',
      'Map pains and jobs-to-be-done',
      'Competitive analysis',
      'Value proposition',
      'TAM/SAM/SOM estimates'
    ],
    outputs: ['Personas', 'Problem statement', 'Value prop', 'Competitive analysis', 'Market sizing'],
    dependencies: ['orchestrator'],
    tools: ['researchMarket', 'analyzeCompetitors', 'definePersonas']
  },
  'scope-planner': {
    role: 'scope-planner',
    name: 'Use-Case & Scope Planner',
    description: 'Turns insights into prioritized work using JTBD methodology',
    responsibilities: [
      'Write job stories',
      'Define user journeys',
      'Set success criteria',
      'Prioritize with RICE/MoSCoW',
      'Define MVP vs v1/vNext',
      'Document anti-goals'
    ],
    outputs: ['Job stories', 'Feature list', 'Acceptance criteria', 'Priorities', 'Risks'],
    dependencies: ['orchestrator', 'market-analyst'],
    tools: ['createJobStories', 'prioritizeFeatures', 'defineAcceptanceCriteria']
  },
  'nextjs-architect': {
    role: 'nextjs-architect',
    name: 'Next.js 15 System Architect',
    description: 'Owns the technical spine for Next.js applications',
    responsibilities: [
      'Choose rendering strategies per route',
      'Define Server Actions usage',
      'Select Edge vs Node runtimes',
      'Design folder topology',
      'Plan caching and invalidation',
      'Set bundling strategy',
      'Define env & secrets management'
    ],
    outputs: ['Architecture diagram', 'Route tree', 'Performance budgets', 'Dependency list'],
    dependencies: ['orchestrator', 'scope-planner'],
    tools: ['designArchitecture', 'defineRoutes', 'selectRendering', 'planCaching']
  },
  'ai-designer': {
    role: 'ai-designer',
    name: 'AI Interaction Designer',
    description: 'Designs AI features and agent UX with Vercel AI SDK',
    responsibilities: [
      'Define conversation patterns',
      'Design tool/command schemas',
      'Plan retrieval/memory approach',
      'Specify streaming UX',
      'Handle error states',
      'Set model policies',
      'Define token/latency budgets',
      'Create safety prompts',
      'Design eval goals'
    ],
    outputs: ['Interaction flows', 'Tool specs', 'Eval goals', 'Telemetry requirements'],
    dependencies: ['orchestrator', 'scope-planner', 'nextjs-architect'],
    tools: ['designAIInteraction', 'defineTools', 'planEvals', 'setModelPolicy']
  },
  'data-api-designer': {
    role: 'data-api-designer',
    name: 'Data, API & Extensibility Designer',
    description: 'Specifies data contracts and future-proofing',
    responsibilities: [
      'Choose data stores',
      'Design migration approach',
      'Draft ERD/schema',
      'Specify API contracts',
      'Plan webhooks/events',
      'Define extension points',
      'Version APIs',
      'Multi-tenant considerations'
    ],
    outputs: ['Data model', 'API spec', 'Versioning policy', 'Multi-tenant plan'],
    dependencies: ['orchestrator', 'scope-planner', 'nextjs-architect'],
    tools: ['designDataModel', 'specifyAPIs', 'planIntegrations', 'defineSchema']
  },
  'security-officer': {
    role: 'security-officer',
    name: 'Security, Privacy & Trust Officer',
    description: 'Prevents security incidents and ensures compliance',
    responsibilities: [
      'Design AuthN/AuthZ',
      'Plan session strategy',
      'Create threat model',
      'Handle secrets & key rotation',
      'Implement rate limiting',
      'Setup audit logging',
      'Address AI-specific risks',
      'Ensure GDPR/PII compliance'
    ],
    outputs: ['Security requirements', 'Threat model', 'Compliance notes', 'Incident playbook'],
    dependencies: ['orchestrator', 'nextjs-architect', 'ai-designer', 'data-api-designer'],
    tools: ['assessThreats', 'designAuth', 'planSecrets', 'defineCompliance']
  },
  'performance-engineer': {
    role: 'performance-engineer',
    name: 'Performance & Observability Engineer',
    description: 'Makes it fast and proves it with metrics',
    responsibilities: [
      'Define SLIs/SLOs',
      'Set performance budgets',
      'Plan caching strategy',
      'Optimize images/assets',
      'Design streaming approach',
      'Setup observability',
      'Configure monitoring',
      'Define alert thresholds'
    ],
    outputs: ['Performance plan', 'Observability setup', 'Budgets', 'Acceptance gates'],
    dependencies: ['orchestrator', 'nextjs-architect', 'ai-designer'],
    tools: ['defineMetrics', 'setPerfBudgets', 'planObservability', 'optimizeAssets']
  },
  'quality-lead': {
    role: 'quality-lead',
    name: 'Quality, Rollout & Docs Lead',
    description: 'Ensures it ships and people can use it',
    responsibilities: [
      'Create test plan',
      'Design AI eval sets',
      'Plan load tests',
      'Define release strategy',
      'Setup feature flags',
      'Plan canary rollout',
      'Write developer docs',
      'Create examples',
      'Document APIs'
    ],
    outputs: ['Test plan', 'Release checklist', 'Documentation outline', 'Definition of done'],
    dependencies: ['orchestrator', 'ai-designer', 'performance-engineer'],
    tools: ['createTestPlan', 'defineEvals', 'planRollout', 'writeDocOutline']
  }
};
