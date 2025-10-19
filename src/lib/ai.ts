import { generateText } from 'ai';

// Model auto-routes via Vercel AI Gateway with 'provider/model' strings.
// Docs: https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway
// On Vercel: OIDC auth (no key). Local: `vercel dev` or set AI_GATEWAY_API_KEY.
export const DEFAULT_MODEL = process.env.AI_MODEL || 'openai/gpt-4o';

export async function genText({
  model,
  prompt,
  userId,
  tags
}: {
  model?: string;
  prompt: string;
  userId?: string;
  tags?: string[];
}) {
  const { text } = await generateText({
    model: (model || DEFAULT_MODEL) as any,
    prompt,
    providerOptions: {
      // Optional: usage attribution in Gateway analytics
      gateway: {
        user: userId || 'anon',
        tags: tags || ['docs-gen']
      }
    }
  });
  return text;
}
