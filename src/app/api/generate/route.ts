import { NextRequest } from 'next/server';
import { Answers } from '@/lib/types';
import {
  generatePRDWithAgents,
  generateImplementationGuide,
  generateMCPGuide,
  generateAgentsGuide
} from '@/lib/agents';

export const runtime = 'nodejs'; // Node.js runtime for longer-running operations
export const maxDuration = 300; // 5 minutes - stays within Pro plan default (no extra cost)

// Helper to create SSE-formatted message
function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  // Parse request body before streaming
  const body = (await req.json()) as { answers: Answers; userId?: string };
  const { answers, userId } = body;

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(encoder.encode(sseMessage(event, data)));
  };

  // Send keepalive heartbeats every 15 seconds to prevent proxy timeouts
  const heartbeatInterval = setInterval(async () => {
    try {
      await writer.write(encoder.encode(': heartbeat\n\n'));
    } catch {
      clearInterval(heartbeatInterval);
    }
  }, 15000);

  // Start processing in background
  (async () => {
    try {

      console.log('🚀 Starting agent-based PRD generation...');
      await sendEvent('progress', { step: 'starting', message: 'Initializing agent swarm...' });

      // Create abort controller with timeout (290s, before maxDuration of 300s)
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 290000);

      // Wrap all operations with timeout handling
      const generateWithTimeout = async () => {
        await sendEvent('progress', { step: 'prd', message: 'Running agents in parallel waves for faster generation...' });
        
        // Generate PRD using agent swarm (now parallelized)
        const { prd, context, summary } = await generatePRDWithAgents(
          answers,
          answers.docGenerationModel,
          userId
        );

        console.log('📝 PRD generated, creating supporting documents...');
        await sendEvent('progress', { step: 'prd-complete', message: 'PRD complete! Creating supporting documents...' });

        await sendEvent('progress', { step: 'docs', message: 'Generating AGENTS.md, IMPLEMENTATION.md, MCP.md...' });

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

      await sendEvent('progress', { step: 'finalizing', message: 'All documents generated successfully!' });

      // Send final result
      await sendEvent('complete', {
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
        await sendEvent('error', {
          ok: false,
          error: 'Document generation timed out after 5 minutes. Agents are running in parallel now. If this persists, try reducing the number of selected agents.'
        });
      } else {
        const message = error instanceof Error ? error.message : 'Unknown error';
        await sendEvent('error', { ok: false, error: message });
      }
    } finally {
      clearInterval(heartbeatInterval);
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
