import type { Answers } from '@/lib/types';
import type { SwarmContext, AgentRole } from './types';
import { OrchestratorAgent } from './orchestrator';

/**
 * Initialize a new swarm context
 */
export function createSwarmContext(
  answers: Answers,
  model?: string,
  userId?: string
): SwarmContext {
  const context: SwarmContext = {
    answers,
    userId,
    model,
    sections: {},
    dependencies: {},
    messages: [],
    agentStates: {
      'orchestrator': { role: 'orchestrator', status: 'idle' },
      'market-analyst': { role: 'market-analyst', status: 'idle' },
      'scope-planner': { role: 'scope-planner', status: 'idle' },
      'nextjs-architect': { role: 'nextjs-architect', status: 'idle' },
      'ai-designer': { role: 'ai-designer', status: 'idle' },
      'data-api-designer': { role: 'data-api-designer', status: 'idle' },
      'security-officer': { role: 'security-officer', status: 'idle' },
      'performance-engineer': { role: 'performance-engineer', status: 'idle' },
      'quality-lead': { role: 'quality-lead', status: 'idle' }
    }
  };

  return context;
}

/**
 * Generate PRD using agent swarm
 */
export async function generatePRDWithAgents(
  answers: Answers,
  model?: string,
  userId?: string
): Promise<{
  prd: string;
  context: SwarmContext;
  summary: string;
}> {
  console.log('\n' + '='.repeat(60));
  console.log('🤖 PRD GENERATION SWARM STARTED');
  console.log('='.repeat(60) + '\n');

  const startTime = Date.now();

  // Initialize context
  const context = createSwarmContext(answers, model, userId);

  // Create and run orchestrator
  const orchestrator = new OrchestratorAgent(context, model);
  const prd = await orchestrator.execute();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const summary = orchestrator.getExecutionSummary();

  console.log('\n' + '='.repeat(60));
  console.log(`✨ PRD GENERATION COMPLETE (${duration}s)`);
  console.log('='.repeat(60) + '\n');

  return { prd, context, summary };
}

/**
 * Generate implementation guide using specialized agents
 */
export async function generateImplementationGuide(
  answers: Answers,
  prdContext: SwarmContext,
  model?: string
): Promise<string> {
  // Use the architect and quality lead outputs to create implementation guide
  const architectOutput = prdContext.sections['nextjs-architect'] || '';
  const qualityOutput = prdContext.sections['quality-lead'] || '';
  const aiOutput = prdContext.sections['ai-designer'] || '';

  const framework = answers.framework === 'nextjs_app' ? 'Next.js 15 (App Router)' : answers.framework;
  const hasAI = answers.ai.vercelAISDK;
  const testingEnabled = answers.testing.enabled;

  // Build sections dynamically
  let sectionNumber = 1;
  const sections: string[] = [];
  
  sections.push(`${sectionNumber++}. **Project Bootstrap** - Create ${framework} app, add styling`);
  
  if (answers.backend.db !== 'none') {
    sections.push(`${sectionNumber++}. **Database Setup** - Schema, migrations, client setup`);
  }
  
  if (answers.backend.auth !== 'none') {
    sections.push(`${sectionNumber++}. **Authentication** - ${answers.backend.auth} integration`);
  }
  
  if (hasAI) {
    sections.push(`${sectionNumber++}. **AI SDK Setup** - Install AI SDK, create API routes, configure Gateway`);
  }
  
  if (testingEnabled) {
    sections.push(`${sectionNumber++}. **Testing Setup** - ${answers.testing.unit} + ${answers.testing.e2e} configuration, test examples`);
  } else {
    sections.push(`${sectionNumber++}. **Testing Status** - Document that testing is deferred, manual verification procedures`);
  }
  
  sections.push(`${sectionNumber++}. **Deployment** - ${answers.backend.useVercel ? 'Vercel' : 'Host'} setup and env vars`);
  sections.push(`${sectionNumber++}. **Verification Checklist** - Final ${testingEnabled ? 'automated tests and' : 'manual checks before'} launch`);

  const prompt = `Create a step-by-step **IMPLEMENTATION.md** guide for this project.

## Project Context
${JSON.stringify(answers, null, 2)}

## Architecture Plan
${architectOutput}

## Testing & Rollout Plan
${qualityOutput}

${hasAI ? `## AI Integration Plan\n${aiOutput}` : ''}

Create a numbered, actionable implementation plan that:
1. Starts from an empty IDE/terminal
2. Includes exact commands with latest package versions
3. Shows folder structure at each step
4. Includes code snippets for key files
5. Has verification steps after each major section
6. Lists common pitfalls and solutions

Sections:
${sections.join('\n')}

${testingEnabled ? 
  'Be specific with test setup, include example tests, and show how to run them.' : 
  'IMPORTANT: Testing is DEFERRED. Be explicit about this limitation and provide manual testing procedures instead of automated test setup.'}

Be specific with versions and commands. Include troubleshooting tips.`;

  // Use the same model for consistency
  const { generateText } = await import('ai');
  const result = await generateText({
    model: model || 'openai/gpt-4o',
    prompt,
    providerOptions: {
      gateway: {
        user: prdContext.userId || 'anon',
        tags: ['implementation']
      }
    }
  });

  return result.text;
}

/**
 * Generate MCP configuration guide
 */
export async function generateMCPGuide(
  answers: Answers,
  model?: string,
  userId?: string
): Promise<string> {
  if (answers.ai.copilot === 'none') {
    return '# MCP Configuration\n\nMCP is optional. IDE/Copilot not selected.';
  }

  const prompt = `Create a brief **MCP.md** guide for ${answers.ai.copilot}.

Explain:
1. What MCP is and why it's useful
2. How to configure MCP in ${answers.ai.copilot}
3. 2-3 recommended MCP servers for this project type
4. Example configuration snippets
5. Links to official docs

Keep it concise and practical. Focus on getting started quickly.`;

  const { generateText } = await import('ai');
  const result = await generateText({
    model: model || 'openai/gpt-4o',
    prompt,
    providerOptions: {
      gateway: {
        user: userId || 'anon',
        tags: ['mcp']
      }
    }
  });

  return result.text;
}

/**
 * Generate AGENTS.md guide (repository guidelines)
 */
export async function generateAgentsGuide(
  answers: Answers,
  prdContext: SwarmContext,
  model?: string
): Promise<string> {
  const architectOutput = prdContext.sections['nextjs-architect'] || '';
  const qualityOutput = prdContext.sections['quality-lead'] || '';
  const testingEnabled = answers.testing.enabled;

  const prompt = `Create an **AGENTS.md** file following the agents.md specification.

## Project Context
${JSON.stringify(answers, null, 2)}

## Architecture
${architectOutput}

## Testing Plan
${qualityOutput}

Create a concise guide with these sections:

# Repository Guidelines

## Project Structure & Module Organization
Explain folder layout, where files belong, conventions.

## Build, Test & Development Commands
Exact commands to install, dev, build, ${testingEnabled ? 'test, ' : ''}deploy.

## Coding Style & Naming Conventions
TypeScript settings, formatting, naming, path aliases.

${testingEnabled ? 
`## Testing Guidelines
How to run tests (${answers.testing.unit} + ${answers.testing.e2e}), what to test, coverage expectations.` :
`## Testing Status
Explicitly state that automated testing is NOT included in this project. Document manual verification procedures and recommend adding testing in future iterations.`}

## Commit & Pull Request Guidelines
Commit message format, PR requirements, review process.

## Security & Configuration Tips
Env vars, secrets management, security best practices.

Keep it practical and tool-focused. This is for AI agents and developers.
${!testingEnabled ? '\nIMPORTANT: Be clear that testing is deferred - do not include test commands or test-related setup instructions.' : ''}`;

  const { generateText } = await import('ai');
  const result = await generateText({
    model: model || 'openai/gpt-4o',
    prompt,
    providerOptions: {
      gateway: {
        user: prdContext.userId || 'anon',
        tags: ['agents-guide']
      }
    }
  });

  return result.text;
}
