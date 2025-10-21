import { NextResponse } from 'next/server';
import { gateway } from '@ai-sdk/gateway';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for fetching available models from gateway

export async function GET() {
  try {
    // Create abort controller with timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 290000); // 290s timeout (before maxDuration)

    // Fetch available models from AI Gateway with timeout
    const resultPromise = gateway.getAvailableModels();
    const result = await Promise.race([
      resultPromise,
      new Promise<never>((_, reject) => {
        abortController.signal.addEventListener('abort', () => {
          reject(new Error('Request timed out'));
        });
      })
    ]);

    clearTimeout(timeoutId); // Clean up timeout
    
    // Filter to only language models (not embeddings)
    const languageModels = result.models.filter(
      (m) => m.modelType === 'language'
    );

    // Return the models with their pricing information
    return NextResponse.json({
      ok: true,
      models: languageModels.map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        modelType: model.modelType,
        pricing: model.pricing ? {
          input: model.pricing.input,
          output: model.pricing.output,
          cachedInputTokens: model.pricing.cachedInputTokens,
          cacheCreationInputTokens: model.pricing.cacheCreationInputTokens,
        } : undefined,
      })),
    });
  } catch (error: unknown) {
    console.error('Failed to fetch available models:', error);
    
    // Handle timeout errors
    if (error instanceof Error && (error.message === 'Request timed out' || error.name === 'AbortError')) {
      return NextResponse.json(
        { ok: false, error: 'Request timed out while fetching models. Please try again.' },
        { status: 408 }
      );
    }
    
    const message = error instanceof Error ? error.message : 'Failed to fetch models';
    
    // Return error with helpful message
    return NextResponse.json(
      { 
        ok: false, 
        error: message,
        hint: 'Make sure AI_GATEWAY_API_KEY is set in your environment variables'
      },
      { status: 500 }
    );
  }
}
