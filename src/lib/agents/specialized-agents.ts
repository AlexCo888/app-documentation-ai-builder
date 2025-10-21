import { BaseAgent } from './base-agent';
import { agentTools } from './tools';
import type { SwarmContext } from './types';

/**
 * Market & Persona Analyst Agent
 * Builds the who/why for a dev audience
 */
export class MarketAnalystAgent extends BaseAgent {
  constructor(context: SwarmContext, model?: string) {
    super('market-analyst', context, model);
  }

  protected getSystemPrompt(): string {
    return `You are a Dev Market & Persona Analyst specializing in developer tools and frameworks.

Your responsibilities:
- Segment developer personas (solo devs, startup teams, platform teams)
- Map developer pain points and jobs-to-be-done
- Analyze competitive landscape (framework tooling, AI coding helpers, hosting)
- Define clear value propositions
- Estimate TAM/SAM/SOM when relevant

You write concise, actionable analysis in Markdown format. Focus on developer needs, not generic users.
Use data-driven insights and industry trends. Be specific about developer segments and their workflows.`;
  }

  protected getTools() {
    return {
      ...agentTools.common,
      ...agentTools.market
    };
  }

  async execute(): Promise<string> {
    this.updateState('request', 'Analyzing market and personas');

    const prompt = `${this.getProjectContext()}

Create the **Market Analysis & Personas** section for the PRD.

Include:
1. **Target Developer Personas** - Who will use this? (e.g., solo dev, startup team, enterprise)
2. **Problem Statement** - What pain points does this solve?
3. **Value Proposition** - Why is this better than alternatives?
4. **Competitive Landscape** - Brief comparison with similar tools/approaches
5. **Market Opportunity** - TAM/SAM/SOM estimates if applicable

Keep it concise and developer-focused. Use bullet points and clear headings.`;

    const output = await this.generate(prompt, { maxSteps: 3 });
    
    this.storeOutput(output);
    this.sendMessage('orchestrator', 'response', 'Market analysis complete', {
      section: 'market-personas',
      wordCount: output.split(/\s+/).length
    });

    return output;
  }
}

/**
 * Use-Case & Scope Planner Agent
 * Turns insights into prioritized work
 */
export class ScopePlannerAgent extends BaseAgent {
  constructor(context: SwarmContext, model?: string) {
    super('scope-planner', context, model);
  }

  protected getSystemPrompt(): string {
    return `You are a Use-Case & Scope Planner using Jobs-to-be-Done methodology.

Your responsibilities:
- Write job stories in JTBD format
- Define user journeys with clear steps
- Set measurable success criteria
- Prioritize features using RICE or MoSCoW
- Define MVP scope vs v1/vNext
- Document explicit anti-goals (what we won't build)

You create actionable, prioritized feature lists with clear acceptance criteria.
Be ruthless about scope - prioritize ruthlessly for MVP.`;
  }

  protected getTools() {
    return {
      ...agentTools.common,
      ...agentTools.scope
    };
  }

  async execute(): Promise<string> {
    this.updateState('request', 'Planning scope and features');

    const dependencyContext = this.getDependencyContext();
    const prompt = `${this.getProjectContext()}
${dependencyContext}

Create the **Scope & Features** section for the PRD.

Include:
1. **Job Stories** - 3-5 core job stories in format: "When [situation], I want to [motivation], so I can [outcome]"
2. **User Journeys** - Key workflows with steps
3. **Feature List** - Organized by priority:
   - **Must Have (MVP)** - Critical for launch
   - **Should Have** - Important but not blocking
   - **Could Have** - Nice to have
   - **Won't Have (Yet)** - Explicitly out of scope
4. **Success Criteria** - How we measure success (specific metrics)
5. **Risks & Open Questions** - What could go wrong? What's unclear?

Use MoSCoW prioritization. Be specific about MVP scope.`;

    const output = await this.generate(prompt, { maxSteps: 3 });
    
    this.storeOutput(output);
    this.sendMessage('orchestrator', 'response', 'Scope planning complete');

    return output;
  }
}

/**
 * Next.js 15 System Architect Agent
 * Owns the technical architecture
 */
export class NextJSArchitectAgent extends BaseAgent {
  constructor(context: SwarmContext, model?: string) {
    super('nextjs-architect', context, model);
  }

  protected getSystemPrompt(): string {
    return `You are a Next.js 15 System Architect specializing in modern React Server Components.

Your responsibilities:
- Choose rendering strategies (RSC/SSR/SSG/PPR) per route
- Define Server Actions usage patterns
- Select Edge vs Node runtimes
- Design folder topology following App Router conventions
- Plan caching and revalidation strategy
- Set bundling config (Turbopack)
- Define environment variables and secrets management

You provide concrete, implementation-ready architecture decisions.
Always cite Next.js 15 docs and best practices.`;
  }

  protected getTools() {
    return {
      ...agentTools.common,
      ...agentTools.architecture
    };
  }

  async execute(): Promise<string> {
    this.updateState('request', 'Designing architecture');

    const dependencyContext = this.getDependencyContext();
    const prompt = `${this.getProjectContext()}
${dependencyContext}

Create the **Technical Architecture** section for the PRD.

Include:
1. **Route Structure** - App Router folder layout with rendering strategy per route
2. **Rendering Strategy** - When to use RSC, SSR, SSG, or PPR
3. **Runtime Selection** - Edge vs Node.js per route
4. **Server Actions** - Where and how to use them
5. **Caching Strategy** - revalidation approach, cache tags
6. **Performance Budgets** - LCP, TTFB, bundle size targets
7. **Dependencies** - Key packages with versions
8. **Environment Variables** - Required config (no secrets)

Be specific about Next.js 15 App Router patterns. Include code examples where helpful.`;

    const output = await this.generate(prompt, { maxSteps: 4 });
    
    this.storeOutput(output);
    this.sendMessage('orchestrator', 'response', 'Architecture complete');

    return output;
  }
}

/**
 * AI Interaction Designer Agent
 * Designs AI features with Vercel AI SDK
 */
export class AIDesignerAgent extends BaseAgent {
  constructor(context: SwarmContext, model?: string) {
    super('ai-designer', context, model);
  }

  protected getSystemPrompt(): string {
    return `You are an AI Interaction Designer specializing in Vercel AI SDK 5.

Your responsibilities:
- Design conversation patterns and flows
- Define tool/command schemas for AI functions
- Plan retrieval and memory strategies
- Specify streaming UX patterns
- Handle error and edge cases
- Set model selection policies (primary + fallbacks)
- Define token/latency budgets
- Create safety prompts and guardrails
- Design evaluation goals

You create practical, implementable AI interaction specs using AI SDK 5 patterns.
Focus on developer experience and production-readiness.`;
  }

  protected getTools() {
    return {
      ...agentTools.common,
      ...agentTools.ai
    };
  }

  async execute(): Promise<string> {
    this.updateState('request', 'Designing AI interactions');

    const dependencyContext = this.getDependencyContext();
    
    // Skip if no AI SDK usage
    if (!this.context.answers.ai.vercelAISDK) {
      const output = '# AI Integration\n\nNot using Vercel AI SDK for this project.';
      this.storeOutput(output);
      return output;
    }

    const prompt = `${this.getProjectContext()}
${dependencyContext}

Create the **AI Integration & Interaction Design** section for the PRD.

Include:
1. **AI Features** - What AI capabilities does the app provide?
2. **Conversation Patterns** - How users interact with AI (chat, completion, streaming)
3. **Tool Definitions** - AI SDK tools the model can call (with schemas)
4. **Model Strategy** - Primary model + fallbacks: ${this.context.answers.ai.appModels?.join(', ') || 'TBD'}
5. **Streaming UX** - How to show loading, partial results, errors
6. **Memory/Context** - How to maintain conversation state
7. **Safety & Guardrails** - Rate limits, content filtering, PII handling
8. **Evaluation Plan** - How to test AI quality (golden datasets, eval metrics)
9. **Token Budget** - Cost estimates per interaction

Use Vercel AI SDK 5 patterns. Include code examples for tool definitions.`;

    const output = await this.generate(prompt, { maxSteps: 4 });
    
    this.storeOutput(output);
    this.sendMessage('orchestrator', 'response', 'AI design complete');

    return output;
  }
}

/**
 * Data & API Designer Agent
 * Specifies data contracts
 */
export class DataAPIDesignerAgent extends BaseAgent {
  constructor(context: SwarmContext, model?: string) {
    super('data-api-designer', context, model);
  }

  protected getSystemPrompt(): string {
    return `You are a Data & API Designer specializing in modern web application architecture.

Your responsibilities:
- Design database schema and relationships
- Plan migration approach
- Specify API contracts (REST/GraphQL/tRPC)
- Define webhooks and event patterns
- Plan extension points for integrations
- Set versioning policy
- Consider multi-tenant architecture

You create clear, implementable data and API specifications.
Focus on scalability and developer experience.`;
  }

  protected getTools() {
    return {
      ...agentTools.common
    };
  }

  async execute(): Promise<string> {
    this.updateState('request', 'Designing data model and APIs');

    const dependencyContext = this.getDependencyContext();
    const prompt = `${this.getProjectContext()}
${dependencyContext}

Create the **Data Model & API Contracts** section for the PRD.

Include:
1. **Database Schema** - Tables/collections with key fields and relationships
2. **Migration Strategy** - How to evolve schema over time
3. **API Design** - Endpoints/queries with request/response formats
4. **Integration Points** - Webhooks, events, third-party APIs
5. **Extension Architecture** - How to add plugins/integrations
6. **Versioning Policy** - How to handle API changes
7. **Multi-tenant Considerations** - If applicable

Use the database choice: ${this.context.answers.backend.db}
Be specific about data types and constraints.`;

    const output = await this.generate(prompt, { maxSteps: 3 });
    
    this.storeOutput(output);
    this.sendMessage('orchestrator', 'response', 'Data/API design complete');

    return output;
  }
}

/**
 * Security Officer Agent
 * Prevents security incidents
 */
export class SecurityOfficerAgent extends BaseAgent {
  constructor(context: SwarmContext, model?: string) {
    super('security-officer', context, model);
  }

  protected getSystemPrompt(): string {
    return `You are a Security & Privacy Officer specializing in web application security.

Your responsibilities:
- Design authentication and authorization
- Plan session management strategy
- Perform threat modeling (OWASP)
- Handle secrets and key rotation
- Implement rate limiting and abuse prevention
- Set up audit logging
- Address AI-specific risks (prompt injection, data leakage)
- Ensure GDPR/PII compliance

You create actionable security requirements and playbooks.
Be specific about risks and mitigation strategies.`;
  }

  protected getTools() {
    return {
      ...agentTools.common,
      ...agentTools.security
    };
  }

  async execute(): Promise<string> {
    this.updateState('request', 'Assessing security requirements');

    const dependencyContext = this.getDependencyContext();
    const prompt = `${this.getProjectContext()}
${dependencyContext}

Create the **Security, Privacy & Compliance** section for the PRD.

Include:
1. **Authentication & Authorization** - Strategy: ${this.context.answers.backend.auth}
2. **Session Management** - How sessions work across RSC/Server Actions
3. **Threat Model** - OWASP Top 10 considerations + AI-specific risks
4. **Secrets Management** - API keys, tokens, rotation policy
5. **Rate Limiting** - Abuse prevention and quotas
6. **Audit Logging** - What to log for security monitoring
7. **AI Security** - Prompt injection, data leakage, jailbreaking
8. **Compliance** - GDPR, PII handling, data retention
9. **Incident Response** - Playbook for security events

Be specific about security controls and their implementation.`;

    const output = await this.generate(prompt, { maxSteps: 3 });
    
    this.storeOutput(output);
    this.sendMessage('orchestrator', 'response', 'Security assessment complete');

    return output;
  }
}

/**
 * Performance Engineer Agent
 * Makes it fast and proves it
 */
export class PerformanceEngineerAgent extends BaseAgent {
  constructor(context: SwarmContext, model?: string) {
    super('performance-engineer', context, model);
  }

  protected getSystemPrompt(): string {
    return `You are a Performance & Observability Engineer focused on web vitals and monitoring.

Your responsibilities:
- Define SLIs and SLOs
- Set performance budgets (LCP, FID, CLS)
- Plan caching strategy
- Optimize images and assets
- Design streaming approach
- Set up observability (logs, traces, metrics)
- Configure monitoring and alerting
- Define acceptance gates for CI

You create measurable, enforceable performance standards.
Focus on Core Web Vitals and real-world metrics.`;
  }

  protected getTools() {
    return {
      ...agentTools.common,
      ...agentTools.performance
    };
  }

  async execute(): Promise<string> {
    this.updateState('request', 'Planning performance & observability');

    const dependencyContext = this.getDependencyContext();
    const prompt = `${this.getProjectContext()}
${dependencyContext}

Create the **Performance & Observability** section for the PRD.

Include:
1. **Performance Budgets** - Core Web Vitals targets (LCP, FID, CLS)
2. **SLIs/SLOs** - Service level indicators and objectives per route type
3. **Caching Strategy** - Revalidation, cache tags, stale-while-revalidate
4. **Asset Optimization** - Images, fonts, bundles
5. **Streaming Strategy** - Progressive rendering, suspense boundaries
6. **Observability Stack** - Logs, traces, metrics tools
7. **Monitoring** - Key metrics to track (RUM, synthetic)
8. **Alerting** - Thresholds for incidents
9. **CI Gates** - Performance checks in build pipeline

Use Vercel Analytics patterns. Be specific about targets.`;

    const output = await this.generate(prompt, { maxSteps: 3 });
    
    this.storeOutput(output);
    this.sendMessage('orchestrator', 'response', 'Performance plan complete');

    return output;
  }
}

/**
 * Quality & Rollout Lead Agent
 * Ensures it ships and people can use it
 */
export class QualityLeadAgent extends BaseAgent {
  constructor(context: SwarmContext, model?: string) {
    super('quality-lead', context, model);
  }

  protected getSystemPrompt(): string {
    return `You are a Quality, Rollout & Documentation Lead ensuring production readiness.

Your responsibilities:
- Create comprehensive test plan
- Design AI evaluation sets
- Plan load and stress tests
- Define release strategy
- Set up feature flags
- Plan canary/gradual rollout
- Write developer documentation
- Create code examples
- Document APIs

You ensure the product ships successfully and developers can use it.
Focus on practical, executable plans.`;
  }

  protected getTools() {
    return {
      ...agentTools.common,
      ...agentTools.quality
    };
  }

  async execute(): Promise<string> {
    this.updateState('request', 'Planning testing & rollout');

    const dependencyContext = this.getDependencyContext();
    const testingEnabled = this.context.answers.testing.enabled;
    
    const prompt = `${this.getProjectContext()}
${dependencyContext}

Create the **Testing, Rollout & Documentation** section for the PRD.

${testingEnabled ? `Include:
1. **Test Plan**:
   - Unit tests: ${this.context.answers.testing.unit}
   - E2E tests: ${this.context.answers.testing.e2e}
   - Critical test scenarios (auth, data integrity, error handling)
   - Coverage expectations (aim for 80%+ on critical paths)
2. **AI Evaluation** - If using AI: eval datasets, metrics, golden prompts
3. **Load Testing** - Expected traffic, stress test scenarios
4. **Release Strategy**:
   - Preview deployments
   - Feature flags
   - Canary/gradual rollout (10% → 50% → 100%)
   - Rollback criteria
5. **Documentation Plan**:
   - Quickstart guide
   - API documentation
   - Code examples
   - Troubleshooting guide
6. **Definition of Done** - Checklist before launch

Be specific about test coverage and release gates.` : `IMPORTANT: Testing is **deferred** for this project.

Include:
1. **Testing Status**:
   - Explicitly state that automated testing is NOT included in the current scope
   - Document this as a known limitation and future enhancement
   - Recommend manual testing procedures as interim solution
2. **Manual Testing Checklist**:
   - Critical user flows to manually verify
   - Smoke tests before each deployment
3. **Release Strategy** (without automated tests):
   - Manual verification steps
   - Preview deployments for stakeholder review
   - Feature flags for gradual rollout
   - Clear rollback procedure
4. **Documentation Plan**:
   - Quickstart guide
   - API documentation (if applicable)
   - Manual testing procedures
   - Known limitations section
5. **Future Enhancement**:
   - Recommend adding ${this.context.answers.testing.unit || 'Jest/Vitest'} + ${this.context.answers.testing.e2e || 'Playwright/Cypress'} in phase 2
   - Outline when testing should be prioritized (e.g., before scaling, before production)

Be clear and honest that testing is out of scope, but provide practical manual alternatives.`}`;

    const output = await this.generate(prompt, { maxSteps: 3 });
    
    this.storeOutput(output);
    this.sendMessage('orchestrator', 'response', 'Quality plan complete');

    return output;
  }
}
