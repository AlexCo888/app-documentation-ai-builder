# AI Agent Swarm System

This directory contains a production-ready multi-agent system built with Vercel AI SDK 5 for generating comprehensive Product Requirements Documents (PRDs).

## Architecture

### Agent Swarm Pattern

The system implements a **hierarchical agent swarm** where:
- An **Orchestrator** coordinates specialized agents
- Each agent owns specific PRD sections
- Agents communicate via a shared context
- Dependencies ensure correct execution order
- Tools provide reusable capabilities

```
┌─────────────────────────────────────────┐
│         Orchestrator Agent              │
│     (Editor-in-Chief / Coordinator)     │
└────────────┬────────────────────────────┘
             │
   ┌─────────┴─────────────────────────────┐
   │                                        │
   ▼                                        ▼
┌─────────────────┐              ┌──────────────────┐
│ Market Analyst  │              │  Scope Planner   │
│   (Research)    │─────────────▶│    (Features)    │
└─────────────────┘              └─────────┬────────┘
                                           │
                           ┌───────────────┼───────────────┐
                           ▼               ▼               ▼
                   ┌────────────┐  ┌────────────┐  ┌────────────┐
                   │  NextJS    │  │  AI        │  │  Data/API  │
                   │  Architect │  │  Designer  │  │  Designer  │
                   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
                         │               │               │
                   ┌─────┴───────────────┴───────────────┴─────┐
                   ▼                     ▼                      ▼
           ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
           │   Security   │     │ Performance  │     │   Quality    │
           │   Officer    │     │   Engineer   │     │     Lead     │
           └──────────────┘     └──────────────┘     └──────────────┘
```

## Agents

### 1. **Orchestrator Agent** (`orchestrator.ts`)
- **Role**: Editor-in-Chief
- **Responsibilities**:
  - Create PRD outline
  - Coordinate agent execution
  - Resolve conflicts
  - Compile final document
- **Output**: Complete, polished PRD

### 2. **Market Analyst** (`specialized-agents.ts`)
- **Role**: Dev Market & Persona Analyst
- **Responsibilities**:
  - Developer personas
  - Problem statements
  - Competitive analysis
  - Value proposition
- **Output**: Market analysis section

### 3. **Scope Planner** (`specialized-agents.ts`)
- **Role**: Use-Case & Scope Planner (JTBD)
- **Responsibilities**:
  - Job stories
  - User journeys
  - Feature prioritization (MoSCoW/RICE)
  - MVP definition
- **Output**: Scope & features section

### 4. **Next.js Architect** (`specialized-agents.ts`)
- **Role**: Next.js 15 System Architect
- **Responsibilities**:
  - Rendering strategies (RSC/SSR/SSG)
  - Route structure
  - Caching strategy
  - Performance budgets
- **Output**: Technical architecture section

### 5. **AI Designer** (`specialized-agents.ts`)
- **Role**: AI Interaction Designer (Vercel AI SDK)
- **Responsibilities**:
  - Conversation patterns
  - Tool schemas
  - Model selection
  - Safety guardrails
- **Output**: AI integration section

### 6. **Data/API Designer** (`specialized-agents.ts`)
- **Role**: Data & API Designer
- **Responsibilities**:
  - Database schema
  - API contracts
  - Integration points
  - Versioning
- **Output**: Data model section

### 7. **Security Officer** (`specialized-agents.ts`)
- **Role**: Security & Privacy Officer
- **Responsibilities**:
  - AuthN/AuthZ design
  - Threat modeling
  - Compliance (GDPR)
  - AI security risks
- **Output**: Security section

### 8. **Performance Engineer** (`specialized-agents.ts`)
- **Role**: Performance & Observability Engineer
- **Responsibilities**:
  - Core Web Vitals targets
  - SLIs/SLOs
  - Monitoring setup
  - Performance budgets
- **Output**: Performance section

### 9. **Quality Lead** (`specialized-agents.ts`)
- **Role**: Quality, Rollout & Docs Lead
- **Responsibilities**:
  - Test plan
  - Release strategy
  - Documentation
  - Rollout gates
- **Output**: Testing & rollout section

## Key Files

```
agents/
├── types.ts              # Agent types, schemas, capabilities
├── tools.ts              # Reusable AI tools for agents
├── base-agent.ts         # Abstract base agent class
├── specialized-agents.ts # 8 specialized agent implementations
├── orchestrator.ts       # Orchestrator agent
├── swarm.ts             # Main coordinator & public API
├── index.ts             # Exports
└── README.md            # This file
```

## Usage

### Basic Usage

```typescript
import { generatePRDWithAgents } from '@/lib/agents';

const answers: Answers = {
  idea: 'Build a developer documentation platform',
  framework: 'nextjs_app',
  // ... other config
};

const { prd, context, summary } = await generatePRDWithAgents(
  answers,
  'openai/gpt-4o', // model
  'user-123'       // userId
);

console.log(prd);      // Complete PRD markdown
console.log(summary);  // Execution summary
```

### Generating Supporting Documents

```typescript
import {
  generatePRDWithAgents,
  generateImplementationGuide,
  generateAgentsGuide,
  generateMCPGuide
} from '@/lib/agents';

// 1. Generate PRD with agent swarm
const { prd, context } = await generatePRDWithAgents(answers);

// 2. Generate supporting docs using PRD context
const implementation = await generateImplementationGuide(answers, context);
const agentsGuide = await generateAgentsGuide(answers, context);
const mcpGuide = await generateMCPGuide(answers);
```

## Vercel AI SDK 5 Patterns Used

### 1. **generateText with Tools**
```typescript
const result = await generateText({
  model: 'openai/gpt-4o',
  system: systemPrompt,
  messages: conversationHistory,
  tools: {
    research: researchTool,
    handoff: handoffTool,
    validate: validateTool
  },
  maxSteps: 5, // Multi-step agent execution
  providerOptions: {
    gateway: {
      user: userId,
      tags: ['agent', role]
    }
  }
});
```

### 2. **Tool Definitions with Zod**
```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const researchTool = tool({
  description: 'Research and generate content for a PRD section',
  inputSchema: z.object({
    section: z.string(),
    focus: z.string(),
    context: z.string().optional()
  }),
  execute: async ({ section, focus, context }) => {
    // Tool implementation
    return { section, content, status: 'complete' };
  }
});
```

### 3. **Multi-Agent Coordination**
- Agents execute in dependency order
- Shared context enables handoffs
- Each agent has specialized tools
- Orchestrator compiles outputs

### 4. **Streaming & Async Execution**
- Agents run sequentially but complete async
- Each agent can make multiple LLM calls
- Tools enable multi-step reasoning

## Benefits

### For MVPs (Current Use)
✅ **Fast Development**: Pre-configured agents for common patterns  
✅ **Consistent Quality**: Each agent follows best practices  
✅ **Cost Efficient**: Specialized models per task  
✅ **Easy Customization**: Add/remove agents as needed  

### For Enterprise (Future?)
✅ **Scalable Architecture**: Add more agents without refactoring  
✅ **Audit Trail**: Full message history and state tracking  
✅ **Parallel Execution**: Independent agents can run concurrently  
✅ **Human-in-Loop**: Easy to add approval gates  

## Extending the System

### Adding a New Agent

1. **Define capabilities** in `types.ts`:
```typescript
export const AGENT_CAPABILITIES: Record<AgentRole, AgentCapability> = {
  // ... existing agents
  'your-agent': {
    role: 'your-agent',
    name: 'Your Agent Name',
    description: 'What this agent does',
    responsibilities: ['Task 1', 'Task 2'],
    outputs: ['Output type'],
    dependencies: ['orchestrator', 'other-agent'],
    tools: ['toolName']
  }
};
```

2. **Create agent class** in `specialized-agents.ts`:
```typescript
export class YourAgent extends BaseAgent {
  constructor(context: SwarmContext, model?: string) {
    super('your-agent', context, model);
  }

  protected getSystemPrompt(): string {
    return `You are a specialized agent that...`;
  }

  protected getTools(): Record<string, unknown> {
    return { ...agentTools.common };
  }

  async execute(): Promise<string> {
    // Agent implementation
  }
}
```

3. **Register in orchestrator** (`orchestrator.ts`):
```typescript
this.agents.set('your-agent', new YourAgent(context, model));
```

### Adding New Tools

Create tools in `tools.ts`:
```typescript
export const yourTool = tool({
  description: 'Tool description',
  inputSchema: z.object({
    param: z.string()
  }),
  execute: async ({ param }) => {
    // Tool logic
    return result;
  }
});
```

## Performance

- **Average PRD Generation**: 60-120 seconds (8 agents)
- **Token Usage**: ~50k-100k tokens (varies by complexity)
- **Cost**: ~$0.50-$2.00 per PRD (with GPT-4o)
- **Parallelization**: Supporting docs run in parallel

## Best Practices

1. **Use appropriate models**: GPT-4o for complexity, GPT-4o-mini for speed
2. **Set temperature**: 0.7 for creativity, 0.3 for compilation
3. **Monitor token usage**: Use Gateway analytics
4. **Handle errors gracefully**: Agents can fail independently
5. **Cache when possible**: Reuse context between related generations

## Troubleshooting

### Agent Fails
- Check `context.agentStates[role].error` for details
- Review agent's conversation history
- Verify dependencies are completed

### Incomplete Output
- Increase `maxSteps` in agent's `generate()` call
- Check if token limit was hit
- Review system prompt clarity

### Inconsistent Results
- Lower temperature for more deterministic output
- Add more specific instructions in system prompts
- Use validation tools between agents

## Future Enhancements

- [ ] Parallel agent execution for independent agents
- [ ] Human-in-the-loop approval gates
- [ ] Agent result caching and reuse
- [ ] Real-time progress streaming to UI
- [ ] Agent performance metrics and logging
- [ ] Dynamic agent selection based on project type
- [ ] Multi-model routing (different models per agent)

## References

- [Vercel AI SDK Docs](https://sdk.vercel.ai)
- [AI SDK Tools & Functions](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
- [Multi-Agent Systems](https://sdk.vercel.ai/docs/foundations/agents)
- [Agentic Workflows](https://sdk.vercel.ai/docs/foundations/prompts#multi-step-prompting)
