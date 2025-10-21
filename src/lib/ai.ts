import { generateText, generateObject } from 'ai';
import type { z } from 'zod';

type GatewayModelId = `${string}/${string}`;
type WebSearchLevel = 'low' | 'medium' | 'high';
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type ProviderOptions = Record<string, Record<string, JsonValue>>;

// Model auto-routes via Vercel AI Gateway with 'provider/model' strings.
// Docs: https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway
// On Vercel: OIDC auth (no key). Local: `vercel dev` or set AI_GATEWAY_API_KEY.
export const DEFAULT_MODEL = (process.env.AI_MODEL || 'openai/gpt-5') as GatewayModelId;

export async function genText({
  model,
  prompt,
  userId,
  tags,
  webSearch
}: {
  model?: string;
  prompt: string;
  userId?: string;
  tags?: string[];
  webSearch?: WebSearchLevel;
}) {
  const modelId = (model ?? DEFAULT_MODEL) as GatewayModelId;

  const providerOptions: ProviderOptions = {
    gateway: {
      user: userId ?? 'anon',
      tags: tags ?? ['docs-gen']
    }
  };

  // Add web search if requested (OpenAI GPT-5 feature)
  if (webSearch && modelId.startsWith('openai/')) {
    providerOptions.openai = {
      includeWebSearch: {
        searchContextSize: webSearch,
      },
    };
  }

  const { text } = await generateText({
    model: modelId,
    prompt,
    providerOptions
  });
  return text;
}

export async function genObject<T extends z.ZodType>({
  model,
  schema,
  prompt,
  userId,
  tags
}: {
  model?: string;
  schema: T;
  prompt: string;
  userId?: string;
  tags?: string[];
}) {
  const modelId = (model ?? DEFAULT_MODEL) as GatewayModelId;
  const result = await generateObject({
    model: modelId,
    schema,
    prompt,
    providerOptions: {
      // Optional: usage attribution in Gateway analytics
      gateway: {
        user: userId || 'anon',
        tags: tags || ['docs-gen']
      }
    }
  });
  return result.object as z.infer<T>;
}
