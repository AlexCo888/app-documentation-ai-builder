import { generateText, ModelMessage, stepCountIs } from 'ai';
import type { ToolSet } from 'ai';
import type { AgentRole, AgentCapability, SwarmContext, AgentMessage } from './types';
import { AGENT_CAPABILITIES } from './types';

/**
 * Base agent class that all specialized agents extend
 */
export abstract class BaseAgent {
  protected role: AgentRole;
  protected capability: AgentCapability;
  protected context: SwarmContext;
  protected model: string;
  protected conversationHistory: ModelMessage[] = [];

  constructor(role: AgentRole, context: SwarmContext, model?: string) {
    this.role = role;
    this.capability = AGENT_CAPABILITIES[role];
    this.context = context;
    this.model = model || context.model || 'openai/gpt-5';
  }

  /**
   * Get the system prompt for this agent
   */
  protected abstract getSystemPrompt(): string;

  /**
   * Get the tools available to this agent
   * Returns a ToolSet (record of tool names to tool instances)
   */
  protected abstract getTools(): ToolSet;

  /**
   * Execute the agent's primary task
   */
  abstract execute(): Promise<string>;

  /**
   * Update agent state
   */
  protected updateState(status: AgentMessage['type'], message?: string): void {
    this.context.agentStates[this.role] = {
      role: this.role,
      status: status === 'error' ? 'error' : status === 'response' ? 'completed' : 'working',
      currentTask: message,
      output: this.context.agentStates[this.role]?.output
    };
  }

  /**
   * Send a message to another agent or broadcast
   */
  protected sendMessage(
    to: AgentRole | 'all',
    type: AgentMessage['type'],
    content: string,
    artifacts?: Record<string, unknown>
  ): void {
    const message: AgentMessage = {
      from: this.role,
      to,
      type,
      content,
      artifacts,
      timestamp: new Date()
    };
    this.context.messages.push(message);
  }

  /**
   * Get messages sent to this agent
   */
  protected getMessagesForMe(): AgentMessage[] {
    return this.context.messages.filter(
      msg => msg.to === this.role || msg.to === 'all'
    );
  }

  /**
   * Generate text using AI SDK with agent's persona
   */
  protected async generate(
    prompt: string,
    options?: {
      maxSteps?: number; // Number of steps for multi-step execution
      temperature?: number;
      includeTools?: boolean;
    }
  ): Promise<string> {
    const systemPrompt = this.getSystemPrompt();
    const tools = options?.includeTools ? this.getTools() : undefined;

    this.conversationHistory.push({
      role: 'user',
      content: prompt
    });

    try {
      const result = await generateText({
        model: this.model,
        system: systemPrompt,
        messages: this.conversationHistory,
        tools,
        // AI SDK 5: Use stopWhen instead of maxSteps
        stopWhen: tools ? stepCountIs(options?.maxSteps || 5) : undefined,
        temperature: options?.temperature || 0.7,
        providerOptions: {
          gateway: {
            user: this.context.userId || 'anon',
            tags: ['agent', this.role]
          }
        }
      });

      this.conversationHistory.push({
        role: 'assistant',
        content: result.text
      });

      return result.text;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.updateState('error', errorMsg);
      throw error;
    }
  }

  /**
   * Get context about dependencies (previous agents' work)
   */
  protected getDependencyContext(): string {
    const deps = this.capability.dependencies;
    if (deps.length === 0) return '';

    const contextParts: string[] = [];
    for (const dep of deps) {
      const depState = this.context.agentStates[dep];
      if (depState?.output) {
        contextParts.push(`\n## ${AGENT_CAPABILITIES[dep].name} Output:\n${depState.output}`);
      }
    }

    return contextParts.join('\n');
  }

  /**
   * Store this agent's output
   */
  protected storeOutput(output: string, artifacts?: Record<string, unknown>): void {
    this.context.agentStates[this.role] = {
      role: this.role,
      status: 'completed',
      output,
      artifacts
    };
  }

  /**
   * Get project context summary
   */
  protected getProjectContext(): string {
    const a = this.context.answers;
    const framework = a.framework === 'nextjs_app' ? 'Next.js 15 (App Router)' : a.framework;
    const styling = [
      a.styling.tailwind ? 'Tailwind CSS v4' : null,
      a.styling.shadcn ? 'shadcn/ui' : null,
      a.styling.other
    ].filter(Boolean).join(', ') || 'basic CSS';
    
    const appModels = a.ai.appModels?.join(', ') || 'TBD';
    
    return `
## Project Context
**Idea:** ${a.idea}

**Tech Stack:**
- Framework: ${framework}
- Styling: ${styling}
- Backend: ${a.backend.useVercel ? 'Vercel' : 'Custom'}
- Database: ${a.backend.db}
- Auth: ${a.backend.auth}
- AI: ${a.ai.vercelAISDK ? `Vercel AI SDK 5 (models: ${appModels})` : 'TBD'}
- IDE/Copilot: ${a.ai.copilot}

**Testing:**
- Unit: ${a.testing.unit}
- E2E: ${a.testing.e2e}

**Constraints:** ${a.constraints || 'None specified'}
`;
  }
}
