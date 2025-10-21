import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for AI prompt improvement with web search

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();

    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Project idea is required' },
        { status: 400 }
      );
    }

    // Create abort controller with timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 290000); // 290s timeout (before maxDuration)

    const prompt = `You are an expert product manager helping developers write clear, comprehensive project descriptions.

Given this project idea:
"${idea}"

Improve it by:
1. Making it more specific and detailed
2. Adding technical clarity where needed
3. Including user value and target audience if missing
4. Mentioning key features or constraints
5. Keeping it concise but comprehensive (2-4 sentences)

Consider latest trends and best practices in the tech industry. Return ONLY the improved project description without any preamble or explanation.`;

    const { text: improvedIdea, sources } = await generateText({
      model: 'openai/gpt-5-mini',
      prompt,
      abortSignal: abortController.signal,
      providerOptions: {
        openai: {
          includeWebSearch: {
            searchContextSize: 'low',
          },
        },
        gateway: {
          user: 'anon',
          tags: ['improve-prompt', 'web-search']
        }
      }
    });

    clearTimeout(timeoutId); // Clean up timeout

    return NextResponse.json({
      ok: true,
      improvedIdea: improvedIdea.trim(),
      sources: sources || []
    });
  } catch (error: unknown) {
    console.error('Improve prompt error:', error);
    
    // Handle timeout/abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { ok: false, error: 'Request timed out. Please try again.' },
        { status: 408 }
      );
    }
    
    const message = error instanceof Error ? error.message : 'Failed to improve prompt';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
