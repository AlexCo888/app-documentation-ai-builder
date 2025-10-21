/**
 * Agent System - Multi-Agent PRD Generation
 * 
 * This module implements a swarm of specialized AI agents that collaborate
 * to generate comprehensive Product Requirements Documents (PRDs) following
 * best practices from Vercel AI SDK 5.
 * 
 * Architecture:
 * - Orchestrator: Coordinates all agents and compiles final output
 * - Specialized Agents: Each owns specific PRD sections
 * - Tools: Reusable capabilities for research, validation, handoff
 * - Context: Shared state and communication between agents
 * 
 * Usage:
 * ```typescript
 * import { generatePRDWithAgents } from '@/lib/agents';
 * 
 * const { prd, summary } = await generatePRDWithAgents(answers, model, userId);
 * ```
 */

export * from './types';
export * from './tools';
export * from './base-agent';
export * from './specialized-agents';
export * from './orchestrator';
export * from './swarm';

// Re-export main functions for convenience
export {
  generatePRDWithAgents,
  generateImplementationGuide,
  generateMCPGuide,
  generateAgentsGuide,
  createSwarmContext
} from './swarm';
