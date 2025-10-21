import { NextRequest, NextResponse } from 'next/server';
import { Answers } from '@/lib/types';
import {
  generatePRDWithAgents,
  generateImplementationGuide,
  generateMCPGuide,
  generateAgentsGuide
} from '@/lib/agents';

export const runtime = 'edge'; // Fast startup, great with Gateway
export const maxDuration = 600; // 5 minutes for agent swarm execution

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { answers: Answers; userId?: string };
    const { answers, userId } = body;

    console.log('🚀 Starting agent-based PRD generation...');

    // Create abort controller with timeout (280s, before maxDuration of 300s)
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 280000);

    // Wrap all operations with timeout handling
    const generateWithTimeout = async () => {
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

      return { prd, context, summary, agents, impl, mcp };
    };

    const result = await Promise.race([
      generateWithTimeout(),
      new Promise<never>((_, reject) => {
        abortController.signal.addEventListener('abort', () => {
          reject(new Error('Document generation timed out'));
        });
      })
    ]);

    clearTimeout(timeoutId); // Clean up timeout

    console.log('✅ All documents generated successfully');
    console.log(result.summary);

    return NextResponse.json({
      ok: true,
      files: [
        { name: 'PRD.md', content: result.prd },
        { name: 'AGENTS.md', content: result.agents },
        { name: 'IMPLEMENTATION.md', content: result.impl },
        { name: 'MCP.md', content: result.mcp }
      ],
      metadata: {
        summary: result.summary,
        agentCount: Object.keys(result.context.agentStates).length,
        messageCount: result.context.messages.length,
        sectionsGenerated: Object.keys(result.context.sections).length
      }
    });
  } catch (error: unknown) {
    console.error('❌ Agent generation error:', error);
    
    // Handle timeout errors
    if (error instanceof Error && (error.message === 'Document generation timed out' || error.name === 'AbortError')) {
      return NextResponse.json(
        { ok: false, error: 'Document generation timed out after 4.5 minutes. This may happen with complex projects. Please try again or simplify your requirements.' },
        { status: 408 }
      );
    }
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
