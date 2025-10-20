import { Answers } from './types';

const AGENTS_MD_URL = 'https://agents.md/';

export function buildPrdPrompt(a: Answers) {
  const framework = a.framework === 'nextjs_app' ? 'Next.js 15 (App Router)' : a.framework;
  const db = a.backend.db !== 'none' ? a.backend.db : 'no dedicated DB';
  const styling = [
    a.styling.tailwind ? 'Tailwind CSS v4' : null,
    a.styling.shadcn ? 'shadcn/ui' : null,
    a.styling.other ? a.styling.other : null
  ].filter(Boolean).join(', ') || 'basic CSS';

  const ide = a.ai.copilot !== 'none' ? a.ai.copilot : 'none specified';
  const appModels = a.ai.appModels && a.ai.appModels.length > 0 
    ? a.ai.appModels.join(', ') 
    : 'to be determined';

  return `
You are a senior product manager and tech lead with access to real-time web search.
Write a concise, actionable **Product Requirements Document (PRD)** in Markdown for the following project.
Use web search to verify latest best practices, security considerations, and technology trends.

## Project Idea
${a.idea.trim()}

## Confirmed Stack
- Framework: ${framework}
- Styling: ${styling}
- Backend/Infra: ${a.backend.useVercel ? 'Vercel (serverless/edge) ' : ''}${a.backend.auth !== 'none' ? ` + Auth: ${a.backend.auth}` : ''}${a.backend.db !== 'none' ? ` + DB: ${db}` : ''}
- AI: ${a.ai.vercelAISDK ? `Vercel AI SDK 5 + Gateway (models: ${appModels})` : 'LLM integration TBD'}
- IDE/Copilot: ${ide}

## Requirements
0) Maximize performance and speed while minimizing costs (without compromising security).
1) Produce a **professional PRD** with the following sections:
   - **Overview**
   - **Personas & Core Use Cases**
   - **Features** (bulleted; prioritize MVP)
   - **Data model & Integrations** (align with the chosen DB/backends)
   - **Non-functional Requirements** (perf, a11y, security, observability)
   - **Open Questions & Assumptions**

2) Keep it tight, scannable, and implementation-ready (short paragraphs, lists).

3) If ${a.framework === 'nextjs_app'} include App Router considerations (RSC, route structure, cache strategies, etc.) at a high level.

4) Do **not** invent vendor-specific API keys or secrets. If unknown, add to "Open Questions".
`;
}

export function buildAgentsPrompt(a: Answers) {
  const framework = a.framework === 'nextjs_app' ? 'Next.js 15 (App Router)' : a.framework;
  const wantsNextStructure = a.wantsNextStructure;
  const appModels = a.ai.appModels && a.ai.appModels.length > 0 
    ? a.ai.appModels.join(', ') 
    : 'to be determined';

  return `
You are producing an **AGENTS.md** file per ${AGENTS_MD_URL}.

Context about the project:
- Idea: ${a.idea.trim()}
- Stack: ${framework}; Styling: ${a.styling.tailwind ? 'Tailwind v4' : 'CSS'}${a.styling.shadcn ? ' + shadcn/ui' : ''}; AI: ${a.ai.vercelAISDK ? `Vercel AI SDK 5 (models: ${appModels})` : 'TBD'}
- Backend: ${a.backend.useVercel ? 'Vercel' : 'Other'}; DB: ${a.backend.db}; Auth: ${a.backend.auth}
- IDE/Copilot: ${a.ai.copilot}

**Output an AGENTS.md** with these sections (and only these top-level headings):

# AGENTS.md

## Setup commands
- Node version and package manager
- Install deps, dev, build, test
- Any env vars and .env.example instructions (no secrets)

## Code style
- TypeScript settings, formatting (Prettier/ESLint norms)
- Tailwind/shadcn usage rules (if chosen)
- Naming conventions and file structure guidance

## Testing instructions
- How to run unit/e2e tests (if enabled)
- What to test first (critical paths)

## Project structure
${wantsNextStructure ? `- Include a canonical **Next.js App Router** layout: \`/app\`, \`/components\`, \`/lib\`, \`/app/api\`, etc.
- Explain where to put server actions, route handlers, and UI components.` : '- Provide a reasonable structure for the chosen framework.'}

## Build & deploy
- Local dev
- Vercel deployment notes (if applicable), including env var setup
- Any post-deploy checks

Use clear bullet lists. Be precise and concise. Assume AI coding agents will read this and follow it.
`;
}

export function buildImplementationPrompt(a: Answers) {
  return `
Produce **IMPLEMENTATION.md**: a numbered, step-by-step plan to implement the project **from an empty IDE**.
Tailor to the stack choices below. Each step must be immediately actionable (exact commands/files).

**IMPORTANT**: Use web search to find the latest package versions, setup commands, and official documentation.
Verify all package versions are current and commands are up-to-date.

Include:
- Project bootstrap (create app, add Tailwind v4, add shadcn/ui components) with latest CLI commands
- If DB selected: schema and setup steps with current package versions
- If AI SDK selected: how to add API route or server action and call the model via Vercel AI Gateway (latest AI SDK 5 patterns)
- Testing setup if enabled (Jest/Vitest; Cypress/Playwright) with current versions
- Final verification checklist and common pitfalls

Context:
${JSON.stringify(a, null, 2)}
`;
}

export function buildMcpPrompt(a: Answers) {
  return `
If the user IDE/copilot supports MCP (e.g., Windsurf, Cursor, Claude Code), produce a short **MCP.md** explaining:
- What MCP is and when to consider it
- IDE rules (e.g. Windsurf rules or Cursor rules)
- 1-2 example MCP tools relevant to this project (e.g., file-system, HTTP, vector db) and how to wire them in that IDE
- Keep it optional and minimal, linking to official docs if info is missing

User IDE/Copilot: ${a.ai.copilot}
If the IDE is "none", output a single line: "MCP is optional. Skipped."
`;
}
