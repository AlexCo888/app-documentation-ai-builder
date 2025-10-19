import { NextRequest, NextResponse } from 'next/server';
import { genText } from '@/lib/ai';
import { Answers } from '@/lib/types';
import { buildPrdPrompt, buildAgentsPrompt, buildImplementationPrompt, buildMcpPrompt } from '@/lib/prompts';

export const runtime = 'edge'; // Fast startup, great with Gateway

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { answers: Answers; userId?: string };
    const { answers, userId } = body;

    const [prd, agents, impl, mcp] = await Promise.all([
      genText({ model: answers.model, prompt: buildPrdPrompt(answers), userId, tags: ['prd'] }),
      genText({ model: answers.model, prompt: buildAgentsPrompt(answers), userId, tags: ['agents'] }),
      genText({ model: answers.model, prompt: buildImplementationPrompt(answers), userId, tags: ['implementation'] }),
      genText({ model: answers.model, prompt: buildMcpPrompt(answers), userId, tags: ['mcp'] })
    ]);

    // Normalize optional MCP
    const mcpDoc = answers.ai.copilot === 'none' ? 'MCP is optional. Skipped.' : mcp;

    return NextResponse.json({
      ok: true,
      files: [
        { name: 'PRD.md', content: prd },
        { name: 'AGENTS.md', content: agents },
        { name: 'IMPLEMENTATION.md', content: impl },
        { name: 'MCP.md', content: mcpDoc }
      ]
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
