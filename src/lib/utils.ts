import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function inferSelectionsFromIdea(text: string) {
  const t = text.toLowerCase();
  const has = (k: string) => t.includes(k);

  return {
    tailwind: has('tailwind'),
    shadcn: has('shadcn') || has('shadcn/ui') || has('shadcn ui'),
    framework:
      has('next.js') || has('next js') || has('nextjs') ? 'nextjs_app' :
      has('remix') ? 'remix' :
      has('sveltekit') || has('svelte') ? 'sveltekit' :
      has('astro') ? 'astro' :
      has('express') ? 'express' :
      'nextjs_app',
    db:
      has('supabase') ? 'supabase' :
      has('firebase') ? 'firebase' :
      has('planetscale') ? 'planetscale' :
      has('neon') ? 'neon' :
      has('sqlite') ? 'sqlite' :
      'none',
    vercelAISDK: has('vercel ai sdk') || has('ai sdk 5') || has('ai-sdk'),
    copilot:
      has('windsurf') ? 'windsurf' :
      has('cursor') ? 'cursor' :
      has('claude code') ? 'claude_code' :
      has('cline') ? 'cline' :
      has('copilot') || has('vscode') ? 'vscode_copilot' :
      'none'
  } as const;
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
