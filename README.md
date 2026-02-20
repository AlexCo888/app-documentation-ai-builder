# AI Documentation Builder

**Generate comprehensive project documentation using a multi-agent AI system powered by Vercel AI SDK 5.**

Transform your product idea into production-ready documentation: PRDs, implementation guides, repository guidelines (AGENTS.md), and MCP configurations—all generated through an intelligent agent swarm architecture.

![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Vercel AI SDK](https://img.shields.io/badge/AI_SDK-5.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

---

## 🎯 Overview

This application uses a **swarm of specialized AI agents** to collaboratively generate high-quality technical documentation. Each agent is an expert in their domain (market analysis, architecture, security, performance, etc.) and contributes to building comprehensive PRDs that follow industry best practices.

### What Gets Generated

- **PRD.md** - Complete Product Requirements Document with market analysis, feature scope, technical architecture, and success criteria
- **AGENTS.md** - Repository guidelines following the agents.md specification for AI-assisted development
- **IMPLEMENTATION.md** - Step-by-step implementation guide with commands, code snippets, and verification steps
- **MCP.md** - Model Context Protocol configuration guide for your IDE/copilot

### Architecture Highlights

- **Multi-Agent System**: 8 specialized agents (Market Analyst, Scope Planner, Next.js Architect, AI Designer, Data/API Designer, Security Officer, Performance Engineer, Quality Lead)
- **Orchestrator Pattern**: Intelligent coordination of agent execution with dependency resolution
- **Vercel AI Gateway**: Model-agnostic generation with usage tracking and analytics
- **Edge Runtime**: Fast, scalable API routes with 5-minute max duration
- **Streaming UI**: Real-time progress updates during generation

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **pnpm** 8+ (`npm install -g pnpm`)
- **Vercel AI Gateway** access (free tier available)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd app-builder

# Install dependencies
pnpm install

# Set up environment variables
# Create .env.local with your AI Gateway credentials
# See "Configuration" section below
```

### Development

```bash
# Start the development server with Turbopack
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build & Deploy

```bash
# Create production build
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Vercel AI Gateway (required)
# Get your key from: https://vercel.com/docs/ai-gateway
AI_GATEWAY_API_KEY=your_gateway_key_here

# Default AI model (optional, defaults to openai/gpt-5)
AI_MODEL=openai/gpt-10o
NEXT_PUBLIC_DEFAULT_MODEL=openai/gpt-10
```

### Vercel AI Gateway Setup

1. Sign up for [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
2. Create a new gateway or use existing one
3. Copy your API key to `.env.local`
4. The app will automatically route requests through the gateway

**Local Development**: Use `vercel dev` for OIDC authentication, or set `AI_GATEWAY_API_KEY` manually.

**Production (Vercel)**: OIDC authentication is automatic—no key needed.

---

## 🏗️ Architecture

### Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Runtime** | Node.js / Edge (Vercel) |
| **Bundler** | Turbopack |
| **Language** | TypeScript 5 (strict mode) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **AI/LLM** | Vercel AI SDK 5 + AI Gateway |
| **Icons** | Lucide React |
| **UI Components** | Radix UI primitives |
| **Syntax Highlighting** | react-syntax-highlighter |
| **Animations** | Motion (Framer Motion) |
| **Schema Validation** | Zod 4 |

### Project Structure

```
app-builder/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes (Edge runtime)
│   │   │   ├── generate/         # Main PRD generation endpoint
│   │   │   ├── available-models/ # Fetch models from Gateway
│   │   │   ├── recommend-models/ # AI model recommendations
│   │   │   └── improve-prompt/   # Prompt enhancement
│   │   ├── layout.tsx            # Root layout with theme
│   │   ├── page.tsx              # Main application page
│   │   └── globals.css           # Global styles + Tailwind
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── ai-elements/          # AI-specific UI components
│   │   ├── Questionnaire.tsx     # Dynamic form (72KB+)
│   │   ├── PRDAgentSelector.tsx  # Agent selection UI
│   │   ├── Markdown.tsx          # Markdown renderer
│   │   ├── DownloadButton.tsx    # File download handler
│   │   └── IntroModal.tsx        # Welcome modal
│   └── lib/                      # Shared utilities
│       ├── agents/               # Multi-agent system
│       │   ├── base-agent.ts     # Base agent class
│       │   ├── orchestrator.ts   # Orchestrator agent
│       │   ├── specialized-agents.ts # 8 domain agents
│       │   ├── swarm.ts          # Swarm coordination
│       │   ├── tools.ts          # Agent tools/capabilities
│       │   └── types.ts          # Type definitions
│       ├── ai.ts                 # AI SDK wrappers
│       ├── prompts.ts            # System prompts
│       ├── types.ts              # Global types
│       └── utils.ts              # Utility functions
├── public/                       # Static assets
├── AGENTS.md                     # Repository guidelines
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind v4 config
├── components.json               # shadcn/ui config
└── next.config.ts                # Next.js config
```

### Multi-Agent System

The application implements an **OpenAI Swarm-inspired architecture** with specialized agents:

```typescript
┌─────────────────────────────────────┐
│      OrchestratorAgent             │
│   (Editor-in-Chief / Coordinator)   │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌─────────┐          ┌─────────┐
│ Market  │          │  Scope  │
│ Analyst │──────────│ Planner │
└─────────┘          └─────────┘
    │                     │
    ▼                     ▼
┌──────────┐         ┌──────────┐
│ Next.js  │         │    AI    │
│Architect │─────────│ Designer │
└──────────┘         └──────────┘
    │                     │
    ▼                     ▼
┌──────────┐         ┌──────────┐
│ Data/API │         │ Security │
│ Designer │─────────│ Officer  │
└──────────┘         └──────────┘
    │                     │
    ▼                     ▼
┌────────────┐       ┌──────────┐
│Performance │       │ Quality  │
│ Engineer   │───────│   Lead   │
└────────────┘       └──────────┘
```

**Agent Capabilities**:

1. **Orchestrator** - Creates outline, coordinates execution, compiles final output
2. **Market Analyst** - Developer personas, pain points, competitive analysis
3. **Scope Planner** - Job stories, feature prioritization (MoSCoW), MVP definition
4. **Next.js Architect** - Route structure, rendering strategies, caching, performance budgets
5. **AI Designer** - Conversation patterns, tool schemas, model selection, safety guardrails
6. **Data/API Designer** - Database schema, API contracts, migration strategy
7. **Security Officer** - Auth/authz, threat modeling (OWASP), secrets management, AI security
8. **Performance Engineer** - SLIs/SLOs, Core Web Vitals, observability, monitoring
9. **Quality Lead** - Test plans, rollout strategy, documentation, definition of done

**Agent Communication**:
- Shared `SwarmContext` for state and inter-agent messaging
- Dependency resolution ensures correct execution order
- Agents can request handoffs and read outputs from other agents
- Tool system for reusable capabilities (research, validation, etc.)

---

## 🎨 Features

### Dynamic Questionnaire

- **Progressive disclosure**: Multi-step form adapts to user selections
- **Model selection**: Choose from any Vercel AI Gateway provider/model
- **Agent customization**: Enable/disable specific agents per use case
- **Tech stack configuration**: Framework, database, auth, testing preferences
- **Real-time validation**: Zod schemas ensure data integrity

### UI/UX

- **Glassmorphism design**: Modern, translucent card-based UI
- **Dark/Light themes**: System-aware with manual toggle
- **Responsive layout**: Mobile-first, works on all screen sizes
- **Loading states**: Progress indicators during generation
- **File preview**: Markdown rendering with syntax highlighting
- **One-click download**: Export all generated files as `.md`

### Generation Pipeline

1. **User Input** → Questionnaire captures requirements
2. **Model Selection** → Choose generation model from Gateway
3. **Agent Execution** → Orchestrator runs agents in dependency order
4. **Compilation** → Final PRD assembled from agent outputs
5. **Supporting Docs** → AGENTS.md, IMPLEMENTATION.md, MCP.md generated in parallel
6. **Output** → 4 markdown files ready for download

---

## 🛠️ Development

### Key Commands

```bash
# Development
pnpm dev              # Start dev server (Turbopack)
pnpm dev --turbo      # Explicit Turbopack flag

# Build & Production
pnpm build            # Production build
pnpm start            # Serve production build

# Quality
pnpm lint             # Run ESLint (Next.js + TypeScript)

# Package Management
pnpm add <package>    # Add dependency
pnpm remove <package> # Remove dependency
```

### Code Style

- **TypeScript strict mode** enabled
- **ESLint**: Next.js core-web-vitals preset
- **Path aliases**: `@/*` maps to `src/*`
- **Component naming**: PascalCase for components, camelCase for utilities
- **File organization**: Colocate related code, use barrel exports

### Adding New Agents

To add a new specialized agent:

1. Create agent class in `src/lib/agents/specialized-agents.ts`:

```typescript
export class MyCustomAgent extends BaseAgent {
  constructor(context: SwarmContext, model?: string) {
    super('my-custom-agent', context, model);
  }

  protected getSystemPrompt(): string {
    return `You are a [Role] specializing in [Domain]...`;
  }

  async execute(): Promise<string> {
    // Agent logic here
  }
}
```

2. Register in `src/lib/agents/types.ts`:

```typescript
export type AgentRole = 'orchestrator' | 'my-custom-agent' | ...;

export const AGENT_CAPABILITIES: Record<AgentRole, AgentCapability> = {
  'my-custom-agent': {
    name: 'My Custom Agent',
    description: '...',
    dependencies: ['orchestrator'],
    outputs: ['my-section']
  },
  // ...
};
```

3. Add to orchestrator in `src/lib/agents/orchestrator.ts`

---

## 📝 Usage Examples

### Basic Usage

```typescript
import { generatePRDWithAgents } from '@/lib/agents';

const answers = {
  idea: 'AI-powered recipe generator',
  framework: 'nextjs_app',
  ai: { vercelAISDK: true, appModels: ['openai/gpt-4o'] },
  // ... other config
};

const { prd, context, summary } = await generatePRDWithAgents(
  answers,
  'openai/gpt-4o',
  'user-123'
);

console.log(prd); // Full PRD markdown
console.log(summary); // Agent execution summary
```

### Custom Agent Selection

```typescript
const answers = {
  // ... base config
  prdAgents: {
    marketAnalyst: true,
    scopePlanner: true,
    nextjsArchitect: true,
    aiDesigner: true,
    dataApiDesigner: false,  // Skip this agent
    securityOfficer: true,
    performanceEngineer: false, // Skip this agent
    qualityLead: true
  }
};
```

### Using AI SDK Directly

```typescript
import { genText, genObject } from '@/lib/ai';

// Text generation
const text = await genText({
  model: 'openai/gpt-4o',
  prompt: 'Explain Next.js Server Components',
  userId: 'user-123',
  tags: ['education'],
  webSearch: 'high' // OpenAI GPT-5 feature
});

// Structured output
const schema = z.object({
  title: z.string(),
  features: z.array(z.string())
});

const data = await genObject({
  model: 'anthropic/claude-3-opus',
  schema,
  prompt: 'Generate PRD outline for a todo app',
  userId: 'user-123'
});
```

---

## 🔒 Security

- **Environment variables**: Secrets in `.env.local` (gitignored)
- **Edge runtime**: Isolated execution, no file system access
- **Rate limiting**: Implement at gateway level (Vercel AI Gateway)
- **Input validation**: Zod schemas on all user inputs
- **CORS**: Configured via Next.js middleware
- **CSP headers**: Set in `next.config.ts` for production

### Best Practices

1. **Never commit** `.env.local` or API keys
2. Use `NEXT_PUBLIC_*` only for browser-safe values
3. Rotate credentials after exposure
4. Review Gateway analytics for abuse patterns
5. Set up alerts for unusual usage spikes

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables** (Vercel Dashboard):
- `AI_GATEWAY_API_KEY` - Optional (OIDC auto-auth on Vercel)
- `AI_MODEL` - Default model identifier
- `NEXT_PUBLIC_DEFAULT_MODEL` - Client-side default

### Docker (Alternative)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
RUN npm install -g pnpm && pnpm install --prod
CMD ["pnpm", "start"]
```

---

## 📊 Performance

### Metrics

- **Build time**: ~30s (Turbopack)
- **Bundle size**: ~300KB (gzipped, first load)
- **Generation time**: 30-90s (depends on model and agent count)
- **Edge cold start**: <200ms

### Optimization Tips

1. **Selective agents**: Disable unnecessary agents to reduce generation time
2. **Model selection**: Faster models (GPT-4o-mini) vs accuracy (GPT-5, Claude Opus)
3. **Caching**: Consider implementing Redis for repeated generations
4. **Streaming**: Enable streaming for real-time feedback (future enhancement)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit with conventional commits: `feat: add agent handoff system`
4. Push and create a pull request
5. Ensure `pnpm lint` passes

### Development Setup

```bash
git clone <your-fork>
cd app-builder
pnpm install
pnpm dev
```

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` file for details.

---

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai) - AI orchestration and model routing
- [Next.js](https://nextjs.org) - React framework
- [shadcn/ui](https://ui.shadcn.com) - UI component library
- [OpenAI Swarm](https://github.com/openai/swarm) - Agent pattern inspiration
- [agents.md spec](https://github.com/e2b-dev/spec-agents-md) - Repository guidelines standard

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)

---

**Built with ❤️ using Next.js 15, Vercel AI SDK 5, and a swarm of intelligent agents.**
