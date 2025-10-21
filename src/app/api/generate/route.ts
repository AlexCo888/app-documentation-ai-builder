import { NextRequest, NextResponse } from 'next/server';
import { Answers } from '@/lib/types';
import {
  generatePRDWithAgents,
  generateImplementationGuide,
  generateMCPGuide,
  generateAgentsGuide
} from '@/lib/agents';

export const runtime = 'edge'; // Fast startup, great with Gateway
export const maxDuration = 300; // 5 minutes for agent swarm execution

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { answers: Answers; userId?: string };
    const { answers, userId } = body;

    console.log('🚀 Starting agent-based PRD generation...');

    // Generate PRD using agent swarm
    const { prd, context, summary } = await generatePRDWithAgents(
      answers,
      answers.docGenerationModel,
      userId
    );

    console.log('📝 PRD generated, creating supporting documents...');

    // Generate supporting documents using the PRD context
    const [agents, impl, mcp] = await Promise.all([
      generateAgentsGuide(answers, context, answers.docGenerationModel),
      generateImplementationGuide(answers, context, answers.docGenerationModel),
      generateMCPGuide(answers, answers.docGenerationModel, userId)
    ]);

    console.log('✅ All documents generated successfully');
    console.log(summary);

    return NextResponse.json({
      ok: true,
      files: [
        { name: 'PRD.md', content: prd },
        { name: 'AGENTS.md', content: agents },
        { name: 'IMPLEMENTATION.md', content: impl },
        { name: 'MCP.md', content: mcp }
      ],
      metadata: {
        summary,
        agentCount: Object.keys(context.agentStates).length,
        messageCount: context.messages.length,
        sectionsGenerated: Object.keys(context.sections).length
      }
    });
  } catch (error: unknown) {
    console.error('❌ Agent generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
