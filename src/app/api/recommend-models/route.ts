import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';
export const maxDuration = 300; // 60s for AI model recommendation with web search

// Define Zod schema for model recommendations
const recommendationsSchema = z.object({
  recommendations: z.array(
    z.string()
      .describe('AI model ID in format: provider/model-name (e.g., openai/gpt-5-pro)')
  )
    .min(1)
    .max(8)
    .describe('Array of recommended AI model IDs from Vercel AI Gateway')
});

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
    const timeoutId = setTimeout(() => abortController.abort(), 55000); // 55s timeout (before maxDuration)

    const prompt = `You are an expert AI architect helping developers choose the right AI models for their application.

Given this project idea:
"${idea}"

Analyze the requirements and recommend 1-8 specific AI models from the Vercel AI Gateway that would be most suitable.

Consider:
- Text generation needs (chat, completion, reasoning)
- Image generation/analysis if applicable
- Embedding needs for search/RAG
- Cost-effectiveness and performance balance
- Agentic capabilities (tool use, function calling)
- Context window requirements
- Latest model capabilities

AVAILABLE MODELS (choose ONLY from this list):

**OpenAI** (High quality, broad capabilities):
- openai/gpt-5-pro (400K context, $15/$120 per M, best reasoning)
- openai/gpt-5 (400K context, $1.25/$10 per M, excellent balance)
- openai/gpt-5-mini (400K context, $0.25/$2 per M, cost-effective)
- openai/gpt-5-nano (400K context, $0.05/$0.40 per M, ultra-cheap)
- openai/gpt-5-codex (400K context, coding specialist)
- openai/gpt-4.1 (1M context, $2/$8 per M)
- openai/gpt-4.1-mini (1M context, $0.40/$1.60 per M)
- openai/gpt-4.1-nano (1M context, $0.10/$0.40 per M)
- openai/gpt-4o (128K context, $2.50/$10 per M)
- openai/gpt-4o-mini (128K context, $0.15/$0.60 per M, very popular)
- openai/o4-mini (200K context, reasoning)
- openai/o3 (200K context, $2/$8 per M, reasoning)
- openai/o3-mini (200K context, reasoning)
- openai/o1 (200K context, advanced reasoning)
- openai/text-embedding-3-small (embeddings, $0.02 per M)
- openai/text-embedding-3-large (embeddings, $0.13 per M)

**Anthropic** (Strong reasoning, long context):
- anthropic/claude-sonnet-4.5 (200K context, $3/$15 per M, latest)
- anthropic/claude-sonnet-4 (200K context, $3/$15 per M)
- anthropic/claude-3.7-sonnet (200K context, $3/$15 per M)
- anthropic/claude-3.5-sonnet (200K context, excellent for agents)
- anthropic/claude-haiku-4.5 (200K context, $1/$5 per M, fast)
- anthropic/claude-3.5-haiku (200K context, $0.80/$4 per M)
- anthropic/claude-3-haiku (200K context, $0.25/$1.25 per M)
- anthropic/claude-opus-4.1 (200K context, $15/$75 per M, most capable)
- anthropic/claude-opus-4 (200K context, premium)

**Google** (Fast, multimodal):
- google/gemini-2.5-pro (1M context, $2.50/$10 per M, excellent)
- google/gemini-2.5-flash (1M context, $0.30/$2.50 per M, very fast)
- google/gemini-2.5-flash-lite (1M context, $0.10/$0.40 per M, ultra-fast)
- google/gemini-2.0-flash (1M context, $0.10/$0.40 per M)
- google/gemini-2.0-flash-lite (1M context, $0.07/$0.30 per M)
- google/gemini-2.5-flash-image (image generation)
- google/gemini-embedding-001 (embeddings, $0.15 per M)

**DeepSeek** (Reasoning, cost-effective):
- deepseek/deepseek-r1 (160K context, $0.79/$4 per M, reasoning)
- deepseek/deepseek-v3.1 (164K context, $0.20/$0.80 per M, excellent value)
- deepseek/deepseek-v3 (164K context, $0.77 per M)
- deepseek/deepseek-v3.2-exp (164K context, experimental)
- deepseek/deepseek-r1-distill-llama-70b (128K context, reasoning)

**Mistral** (European, strong performance):
- mistral/mistral-large (32K context, $2/$6 per M)
- mistral/mistral-medium (128K context, $0.40/$2 per M)
- mistral/mistral-small (32K context, $0.10/$0.30 per M)
- mistral/codestral (256K context, coding)
- mistral/magistral-small-2506 (128K context, $0.50/$1.50 per M)

**xAI** (Long context, reasoning):
- xai/grok-4 (256K context, $3/$15 per M)
- xai/grok-4-fast-reasoning (2M context, $0.20/$0.50 per M, huge context)
- xai/grok-4-fast-non-reasoning (2M context, $0.20/$0.50 per M)
- xai/grok-3 (131K context, $3/$15 per M)
- xai/grok-3-fast (131K context, $5/$25 per M)
- xai/grok-3-mini (131K context, $0.30/$0.50 per M)

**Meta** (Open models, cost-effective):
- meta/llama-4-maverick (1.3M context, $0.15/$0.60 per M, huge context)
- meta/llama-4-scout (128K context, $0.08/$0.30 per M)
- meta/llama-3.3-70b (128K context, $0.72 per M)
- meta/llama-3.2-90b (128K context)
- meta/llama-3.1-70b (128K context)

**Perplexity** (Search-augmented):
- perplexity/sonar-pro (200K context, $3/$15 per M, web search)
- perplexity/sonar (127K context, $1 per M, web search)
- perplexity/sonar-reasoning-pro (127K context, reasoning + search)
- perplexity/sonar-reasoning (127K context, reasoning + search)

**Cohere** (Enterprise, embeddings):
- cohere/command-r-plus (128K context, $2.50/$10 per M)
- cohere/command-r (128K context, $0.15/$0.60 per M)
- cohere/command-a (256K context)
- cohere/embed-v4.0 (embeddings, $0.12 per M)

Return model IDs in exact format: provider/model-name`;

    const { object: result } = await generateObject({
      model: 'openai/gpt-5',
      schema: recommendationsSchema,
      prompt,
      abortSignal: abortController.signal,
      providerOptions: {
        openai: {
          includeWebSearch: {
            searchContextSize: 'medium',
          },
        },
        gateway: {
          user: 'anon',
          tags: ['recommend-models', 'web-search']
        }
      }
    });

    clearTimeout(timeoutId); // Clean up timeout

    return NextResponse.json({
      ok: true,
      recommendations: result.recommendations
    });
  } catch (error: unknown) {
    console.error('Recommend models error:', error);
    
    // Handle timeout/abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { ok: false, error: 'Request timed out. Please try again.' },
        { status: 408 }
      );
    }
    
    const message = error instanceof Error ? error.message : 'Failed to recommend models';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
