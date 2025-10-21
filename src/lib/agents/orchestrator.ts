import { BaseAgent } from './base-agent';
import type { SwarmContext, AgentRole } from './types';
import { AGENT_CAPABILITIES } from './types';
import {
  MarketAnalystAgent,
  ScopePlannerAgent,
  NextJSArchitectAgent,
  AIDesignerAgent,
  DataAPIDesignerAgent,
  SecurityOfficerAgent,
  PerformanceEngineerAgent,
  QualityLeadAgent
} from './specialized-agents';

/**
 * Orchestrator Agent - The "Editor-in-Chief"
 * Coordinates all other agents and compiles the final PRD
 */
export class OrchestratorAgent extends BaseAgent {
  private agents: Map<AgentRole, BaseAgent> = new Map();

  constructor(context: SwarmContext, model?: string) {
    super('orchestrator', context, model);
    
    // Initialize only the agents selected by the user
    const selectedAgents = context.answers.prdAgents || {
      marketAnalyst: true,
      scopePlanner: true,
      nextjsArchitect: true,
      aiDesigner: true,
      dataApiDesigner: true,
      securityOfficer: true,
      performanceEngineer: true,
      qualityLead: true
    };

    // Map UI agent IDs to internal agent roles
    const agentMapping: Record<string, { role: AgentRole; class: new (ctx: SwarmContext, model?: string) => BaseAgent }> = {
      marketAnalyst: { role: 'market-analyst', class: MarketAnalystAgent },
      scopePlanner: { role: 'scope-planner', class: ScopePlannerAgent },
      nextjsArchitect: { role: 'nextjs-architect', class: NextJSArchitectAgent },
      aiDesigner: { role: 'ai-designer', class: AIDesignerAgent },
      dataApiDesigner: { role: 'data-api-designer', class: DataAPIDesignerAgent },
      securityOfficer: { role: 'security-officer', class: SecurityOfficerAgent },
      performanceEngineer: { role: 'performance-engineer', class: PerformanceEngineerAgent },
      qualityLead: { role: 'quality-lead', class: QualityLeadAgent }
    };

    // Initialize only selected agents
    Object.entries(agentMapping).forEach(([key, { role, class: AgentClass }]) => {
      if (selectedAgents[key as keyof typeof selectedAgents]) {
        this.agents.set(role, new AgentClass(context, model));
      }
    });

    console.log(`🤖 Initialized ${this.agents.size} agents:`, Array.from(this.agents.keys()));
  }

  protected getSystemPrompt(): string {
    return `You are the PRD Orchestrator - the Editor-in-Chief of the PRD generation swarm.

Your responsibilities:
- Create the PRD outline and structure
- Coordinate agent execution in the correct order
- Resolve conflicts and inconsistencies between agents
- Enforce scope boundaries (in-scope vs out-of-scope)
- Compile all agent outputs into a cohesive final PRD
- Ensure professional quality and consistency

You maintain high standards and ensure all sections work together seamlessly.
You are the final authority on content and structure.`;
  }

  protected getTools() {
    return {}; // Orchestrator manages agents, doesn't use tools directly
  }

  /**
   * Create the initial PRD outline
   */
  private async createOutline(): Promise<string> {
    const prompt = `${this.getProjectContext()}

Create a PRD outline for this project. Include:
1. Title and overview
2. Section headers for each major area
3. Subsections where needed
4. Brief notes on what each section should contain

Return the outline in Markdown format with clear hierarchy.`;

    const outline = await this.generate(prompt);
    this.context.prdOutline = outline;
    return outline;
  }

  /**
   * Get the execution order for agents based on dependencies
   * Only includes agents that were initialized (selected by user)
   */
  private getExecutionOrder(): AgentRole[] {
    const order: AgentRole[] = [];
    const visited = new Set<AgentRole>();
    const enabledAgents = new Set(this.agents.keys());
    
    const visit = (role: AgentRole) => {
      if (visited.has(role)) return;
      if (!enabledAgents.has(role)) return; // Skip disabled agents
      visited.add(role);
      
      const deps = AGENT_CAPABILITIES[role].dependencies;
      for (const dep of deps) {
        if (dep !== 'orchestrator' && enabledAgents.has(dep)) {
          visit(dep);
        }
      }
      
      if (role !== 'orchestrator') {
        order.push(role);
      }
    };

    // Visit only enabled agents
    for (const role of this.agents.keys()) {
      visit(role);
    }

    return order;
  }

  /**
   * Group agents into parallel execution waves based on dependencies
   */
  private getExecutionWaves(): AgentRole[][] {
    const waves: AgentRole[][] = [];
    const completed = new Set<AgentRole>(['orchestrator']);
    const remaining = new Set(this.agents.keys());
    
    while (remaining.size > 0) {
      const wave: AgentRole[] = [];
      
      // Find all agents whose dependencies are satisfied
      for (const role of remaining) {
        const deps = AGENT_CAPABILITIES[role].dependencies;
        const depsReady = deps.every(dep => completed.has(dep) || !remaining.has(dep));
        
        if (depsReady) {
          wave.push(role);
        }
      }
      
      // No agents ready means circular dependency or error
      if (wave.length === 0) break;
      
      // Add this wave and mark agents as completed
      waves.push(wave);
      wave.forEach(role => {
        remaining.delete(role);
        completed.add(role);
      });
    }
    
    return waves;
  }

  /**
   * Execute all agents in parallel waves based on dependencies
   */
  private async executeAgents(): Promise<void> {
    const waves = this.getExecutionWaves();
    
    console.log(`🤖 Executing ${this.agents.size} agents in ${waves.length} parallel waves`);
    waves.forEach((wave, i) => {
      console.log(`  Wave ${i + 1}: [${wave.map(r => AGENT_CAPABILITIES[r].name).join(', ')}]`);
    });
    
    for (let i = 0; i < waves.length; i++) {
      const wave = waves[i];
      console.log(`\n🌊 Wave ${i + 1}/${waves.length}: Executing ${wave.length} agent(s) in parallel`);
      
      // Execute all agents in this wave in parallel
      const wavePromises = wave.map(async (role) => {
        const agent = this.agents.get(role);
        if (!agent) return;

        console.log(`  📋 Starting: ${AGENT_CAPABILITIES[role].name}`);
        
        try {
          this.context.agentStates[role] = {
            role,
            status: 'working',
            currentTask: `Generating ${role} section`
          };

          const output = await agent.execute();
          
          // Store the output in context sections
          this.context.sections[role] = output;
          
          console.log(`  ✅ Completed: ${AGENT_CAPABILITIES[role].name} (${output.length} chars)`);
        } catch (error) {
          console.error(`  ❌ Error in ${role}:`, error);
          this.context.agentStates[role] = {
            role,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          // Continue with other agents even if one fails
        }
      });

      // Wait for all agents in this wave to complete
      await Promise.all(wavePromises);
      console.log(`✅ Wave ${i + 1} complete`);
    }
  }

  /**
   * Compile all sections into final PRD
   */
  private async compilePRD(): Promise<string> {
    const sections = this.context.sections;
    
    // Define the desired section order
    const sectionOrder: AgentRole[] = [
      'market-analyst',
      'scope-planner',
      'nextjs-architect',
      'ai-designer',
      'data-api-designer',
      'security-officer',
      'performance-engineer',
      'quality-lead'
    ];

    const prompt = `You are compiling the final PRD from multiple agent outputs.

${this.getProjectContext()}

## Agent Outputs:
${sectionOrder.map(role => {
  const output = sections[role];
  if (!output) return '';
  return `\n### ${AGENT_CAPABILITIES[role].name}\n${output}\n`;
}).join('\n')}

Create a polished, professional PRD document that:
1. Starts with a clear title and executive summary
2. Flows logically from market analysis → scope → architecture → implementation concerns
3. Removes redundancy while keeping critical details
4. Maintains consistent terminology and formatting
5. Uses professional Markdown with proper headings, lists, and code blocks
6. Ends with a summary of open questions and next steps

Return the complete PRD in Markdown format.`;

    return await this.generate(prompt, { temperature: 0.3 });
  }

  /**
   * Main execution method
   */
  async execute(): Promise<string> {
    console.log('\n🚀 Starting PRD Orchestrator\n');
    
    try {
      // Step 1: Create outline
      this.updateState('request', 'Creating PRD outline');
      console.log('📝 Creating PRD outline...');
      await this.createOutline();

      // Step 2: Execute all agents in order
      this.updateState('request', 'Executing agent swarm');
      await this.executeAgents();

      // Step 3: Compile final PRD
      this.updateState('request', 'Compiling final PRD');
      console.log('\n📦 Compiling final PRD...');
      const finalPRD = await this.compilePRD();

      this.storeOutput(finalPRD);
      this.updateState('response', 'PRD generation complete');
      
      console.log('\n✨ PRD Orchestrator complete!\n');
      
      return finalPRD;
    } catch (error) {
      console.error('\n❌ Orchestrator error:', error);
      this.updateState('error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Get execution summary
   */
  getExecutionSummary(): string {
    const states = Object.values(this.context.agentStates);
    const completed = states.filter(s => s.status === 'completed').length;
    const errors = states.filter(s => s.status === 'error').length;
    const working = states.filter(s => s.status === 'working').length;

    return `
## Agent Execution Summary

- ✅ Completed: ${completed}
- ⚠️ Errors: ${errors}
- 🔄 In Progress: ${working}
- 📊 Total: ${states.length}

${states.map(s => {
  const emoji = s.status === 'completed' ? '✅' : 
                s.status === 'error' ? '❌' : 
                s.status === 'working' ? '🔄' : '⏸️';
  return `${emoji} ${AGENT_CAPABILITIES[s.role].name}: ${s.status}`;
}).join('\n')}
`;
  }
}
