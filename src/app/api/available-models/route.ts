import { NextResponse } from 'next/server';
import { gateway } from '@ai-sdk/gateway';

export const runtime = 'edge';

export async function GET() {
  try {
    // Fetch available models from AI Gateway
    const result = await gateway.getAvailableModels();
    
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
