'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn, inferSelectionsFromIdea } from '@/lib/utils';
import type { Answers, FrameworkChoice, DBChoice, IDECopilot } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, CircuitBoard, Cpu, Database, Rocket, Sparkles, Workflow, Check, ChevronDown, Loader2, ExternalLink, Search, X } from 'lucide-react';
import { Sources, SourcesTrigger, SourcesContent, Source } from '@/components/ai-elements/sources';
import { PRDAgentSelector, type PRDAgentSelection } from '@/components/PRDAgentSelector';

type AuthChoice = 'none' | 'you-choose' | 'supabase_auth' | 'authjs' | 'clerk' | 'other' | 'better-auth';

type Step = {
  id: number;
  label: string;
  blurb: string;
  icon: LucideIcon;
};

const steps: Step[] = [
  { id: 1, label: 'Define', blurb: 'Describe your product requirements and constraints.', icon: Sparkles },
  { id: 2, label: 'Configure', blurb: 'Choose your tech stack, hosting, database, and authentication.', icon: CircuitBoard },
  { id: 3, label: 'Select Agents', blurb: 'Choose which specialized AI agents will generate your PRD.', icon: Cpu },
  { id: 4, label: 'Select Models', blurb: 'Pick AI models from Vercel AI Gateway for generation.', icon: Workflow },
  { id: 5, label: 'Generate', blurb: 'Create PRD documentation, MCP manifest, and implementation plan.', icon: Rocket }
];

const frameworkOptions: Array<{ value: FrameworkChoice; label: string; note: string }> = [
  { value: 'nextjs_app', label: 'Next.js 15', note: 'Edge-first App Router' },
  { value: 'remix', label: 'Remix', note: 'Nested data loaders' },
  { value: 'sveltekit', label: 'SvelteKit', note: 'Islands + SSR' },
  { value: 'astro', label: 'Astro', note: 'Content-focused islands' },
  { value: 'express', label: 'Express + Vite', note: 'Node classic + Vite DX' },
  { value: 'other', label: 'Other', note: 'Roll your own' }
];

const dbOptions: Array<{ value: DBChoice; label: string }> = [
  { value: 'none', label: 'No database yet' },
  { value: 'you-choose', label: 'You choose' },
  { value: 'supabase', label: 'Supabase (Postgres)' },
  { value: 'neon', label: 'Neon (Postgres)' },
  { value: 'planetscale', label: 'PlanetScale (MySQL)' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'firebase', label: 'Firebase' },
  { value: 'other', label: 'Other' }
];

const authOptions: Array<{ value: AuthChoice; label: string }> = [
  { value: 'none', label: 'No auth right now' },
  { value: 'you-choose', label: 'You choose' },
  { value: 'better-auth', label: 'Better Auth' },
  { value: 'supabase_auth', label: 'Supabase Auth' },
  { value: 'authjs', label: 'Auth.js' },
  { value: 'clerk', label: 'Clerk' },
  { value: 'other', label: 'Other' }
];

const copilotOptions: Array<{ value: IDECopilot; label: string }> = [
  { value: 'windsurf', label: 'Windsurf' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'vscode_copilot', label: 'VS Code + Copilot' },
  { value: 'claude_code', label: 'Claude Code' },
  { value: 'cline', label: 'Cline' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'None' }
];

const unitOptions: Array<'jest' | 'vitest' | 'none'> = ['jest', 'vitest', 'none'];
const e2eOptions: Array<'cypress' | 'playwright' | 'none'> = ['cypress', 'playwright', 'none'];

type ModelOption = {
  id: string;
  label: string;
  provider: string;
  inputCost?: string;  // Cost per million input tokens
  outputCost?: string; // Cost per million output tokens
  contextWindow?: string;
};

const CURATED_MODELS: ModelOption[] = [
  // Alibaba
  { id: 'alibaba/qwen3-max', label: 'Qwen3 Max', provider: 'Alibaba' },
  { id: 'alibaba/qwen3-max-preview', label: 'Qwen3 Max Preview', provider: 'Alibaba' },
  { id: 'alibaba/qwen-3-235b', label: 'Qwen 3 235B', provider: 'Alibaba' },
  { id: 'alibaba/qwen-3-32b', label: 'Qwen 3 32B', provider: 'Alibaba' },
  { id: 'alibaba/qwen-3-30b', label: 'Qwen 3 30B', provider: 'Alibaba' },
  { id: 'alibaba/qwen-3-14b', label: 'Qwen 3 14B', provider: 'Alibaba' },
  { id: 'alibaba/qwen3-coder-30b-a3b', label: 'Qwen3 Coder 30B A3B', provider: 'Alibaba' },
  { id: 'alibaba/qwen3-coder', label: 'Qwen3 Coder', provider: 'Alibaba' },
  { id: 'alibaba/qwen3-coder-plus', label: 'Qwen3 Coder Plus', provider: 'Alibaba' },
  { id: 'alibaba/qwen3-next-80b-a3b-instruct', label: 'Qwen3 Next 80B A3B Instruct', provider: 'Alibaba' },
  { id: 'alibaba/qwen3-next-80b-a3b-thinking', label: 'Qwen3 Next 80B A3B Thinking', provider: 'Alibaba' },
  { id: 'alibaba/qwen3-vl-instruct', label: 'Qwen3 VL Instruct', provider: 'Alibaba' },
  { id: 'alibaba/qwen3-vl-thinking', label: 'Qwen3 VL Thinking', provider: 'Alibaba' },
  
  // Amazon
  { id: 'amazon/nova-pro', label: 'Nova Pro', provider: 'Amazon' },
  { id: 'amazon/nova-lite', label: 'Nova Lite', provider: 'Amazon' },
  { id: 'amazon/nova-micro', label: 'Nova Micro', provider: 'Amazon' },
  { id: 'amazon/titan-embed-text-v2', label: 'Titan Embed Text v2', provider: 'Amazon' },
  
  // Anthropic
  { id: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5', provider: 'Anthropic', inputCost: '$3.00', outputCost: '$15.00', contextWindow: '200K' },
  { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4', provider: 'Anthropic', inputCost: '$3.00', outputCost: '$15.00', contextWindow: '200K' },
  { id: 'anthropic/claude-3.7-sonnet', label: 'Claude 3.7 Sonnet', provider: 'Anthropic', inputCost: '$3.00', outputCost: '$15.00', contextWindow: '200K' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputCost: '$3.00', outputCost: '$15.00', contextWindow: '200K' },
  { id: 'anthropic/claude-3.5-sonnet-20240620', label: 'Claude 3.5 Sonnet (2024-06-20)', provider: 'Anthropic', inputCost: '$3.00', outputCost: '$15.00', contextWindow: '200K' },
  { id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku', provider: 'Anthropic', inputCost: '$0.80', outputCost: '$4.00', contextWindow: '200K' },
  { id: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku', provider: 'Anthropic', inputCost: '$0.25', outputCost: '$1.25', contextWindow: '200K' },
  { id: 'anthropic/claude-3-opus', label: 'Claude 3 Opus', provider: 'Anthropic', inputCost: '$15.00', outputCost: '$75.00', contextWindow: '200K' },
  { id: 'anthropic/claude-haiku-4.5', label: 'Claude Haiku 4.5', provider: 'Anthropic', inputCost: '$1.00', outputCost: '$5.00', contextWindow: '200K' },
  { id: 'anthropic/claude-opus-4.1', label: 'Claude Opus 4.1', provider: 'Anthropic', inputCost: '$15.00', outputCost: '$75.00', contextWindow: '200K' },
  { id: 'anthropic/claude-opus-4', label: 'Claude Opus 4', provider: 'Anthropic', inputCost: '$15.00', outputCost: '$75.00', contextWindow: '200K' },
  
  // Cohere
  { id: 'cohere/command-a', label: 'Command A', provider: 'Cohere' },
  { id: 'cohere/command-r', label: 'Command R', provider: 'Cohere' },
  { id: 'cohere/command-r-plus', label: 'Command R+', provider: 'Cohere' },
  { id: 'cohere/embed-v4.0', label: 'Embed v4.0', provider: 'Cohere' },
  
  // DeepSeek
  { id: 'deepseek/deepseek-v3', label: 'DeepSeek v3', provider: 'DeepSeek', inputCost: '$0.77', outputCost: '$0.77', contextWindow: '164K' },
  { id: 'deepseek/deepseek-v3.1', label: 'DeepSeek v3.1', provider: 'DeepSeek', inputCost: '$0.20', outputCost: '$0.80', contextWindow: '164K' },
  { id: 'deepseek/deepseek-v3.1-base', label: 'DeepSeek v3.1 Base', provider: 'DeepSeek', inputCost: '$0.20', outputCost: '$0.80', contextWindow: '128K' },
  { id: 'deepseek/deepseek-v3.1-terminus', label: 'DeepSeek v3.1 Terminus', provider: 'DeepSeek', inputCost: '$0.27', outputCost: '$1.00', contextWindow: '131K' },
  { id: 'deepseek/deepseek-v3.2-exp', label: 'DeepSeek v3.2 Exp', provider: 'DeepSeek', inputCost: '$0.27', outputCost: '$0.41', contextWindow: '164K' },
  { id: 'deepseek/deepseek-v3.2-exp-thinking', label: 'DeepSeek v3.2 Exp Thinking', provider: 'DeepSeek', inputCost: '$0.28', outputCost: '$0.42', contextWindow: '164K' },
  { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1', provider: 'DeepSeek', inputCost: '$0.79', outputCost: '$4.00', contextWindow: '160K' },
  { id: 'deepseek/deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill Llama 70B', provider: 'DeepSeek', inputCost: '$0.75', outputCost: '$0.99', contextWindow: '128K' },
  
  // Google
  { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: 'Google', inputCost: '$2.50', outputCost: '$10.00', contextWindow: '1M' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'Google', inputCost: '$0.30', outputCost: '$2.50', contextWindow: '1M' },
  { id: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', provider: 'Google', inputCost: '$0.10', outputCost: '$0.40', contextWindow: '1M' },
  { id: 'google/gemini-2.5-flash-preview-09-2025', label: 'Gemini 2.5 Flash Preview (09-2025)', provider: 'Google', inputCost: '$0.30', outputCost: '$2.50', contextWindow: '1M' },
  { id: 'google/gemini-2.5-flash-lite-preview-09-2025', label: 'Gemini 2.5 Flash Lite Preview (09-2025)', provider: 'Google', inputCost: '$0.10', outputCost: '$0.40', contextWindow: '1M' },
  { id: 'google/gemini-2.5-flash-image-preview', label: 'Gemini 2.5 Flash Image Preview', provider: 'Google', inputCost: '$0.30', outputCost: '$2.50', contextWindow: '33K' },
  { id: 'google/gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image Generation', provider: 'Google', inputCost: '$0.30', outputCost: '$2.50', contextWindow: '33K' },
  { id: 'google/gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'Google', inputCost: '$0.10', outputCost: '$0.40', contextWindow: '1M' },
  { id: 'google/gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', provider: 'Google', inputCost: '$0.07', outputCost: '$0.30', contextWindow: '1M' },
  { id: 'google/gemma-2-9b', label: 'Gemma 2 9B', provider: 'Google', inputCost: '$0.20', outputCost: '$0.20', contextWindow: '8K' },
  { id: 'google/gemini-embedding-001', label: 'Gemini Embedding 001', provider: 'Google', inputCost: '$0.15', outputCost: '—' },
  { id: 'google/text-embedding-005', label: 'Text Embedding 005', provider: 'Google', inputCost: '$0.03', outputCost: '—' },
  { id: 'google/text-multilingual-embedding-002', label: 'Text Multilingual Embedding 002', provider: 'Google', inputCost: '$0.03', outputCost: '—' },
  
  // Inception
  { id: 'inception/mercury-coder-small', label: 'Mercury Coder Small', provider: 'Inception' },
  
  // Meituan
  { id: 'meituan/longcat-flash-chat', label: 'Longcat Flash Chat', provider: 'Meituan' },
  { id: 'meituan/longcat-flash-thinking', label: 'Longcat Flash Thinking', provider: 'Meituan' },
  
  // Meta
  { id: 'meta/llama-4-maverick', label: 'Llama 4 Maverick', provider: 'Meta' },
  { id: 'meta/llama-4-scout', label: 'Llama 4 Scout', provider: 'Meta' },
  { id: 'meta/llama-3.3-70b', label: 'Llama 3.3 70B', provider: 'Meta' },
  { id: 'meta/llama-3.2-90b', label: 'Llama 3.2 90B', provider: 'Meta' },
  { id: 'meta/llama-3.2-11b', label: 'Llama 3.2 11B', provider: 'Meta' },
  { id: 'meta/llama-3.2-3b', label: 'Llama 3.2 3B', provider: 'Meta' },
  { id: 'meta/llama-3.2-1b', label: 'Llama 3.2 1B', provider: 'Meta' },
  { id: 'meta/llama-3.1-70b', label: 'Llama 3.1 70B', provider: 'Meta' },
  { id: 'meta/llama-3.1-8b', label: 'Llama 3.1 8B', provider: 'Meta' },
  { id: 'meta/llama-3-70b', label: 'Llama 3 70B', provider: 'Meta' },
  { id: 'meta/llama-3-8b', label: 'Llama 3 8B', provider: 'Meta' },
  
  // Mistral
  { id: 'mistral/mistral-large', label: 'Mistral Large', provider: 'Mistral' },
  { id: 'mistral/mistral-medium', label: 'Mistral Medium', provider: 'Mistral' },
  { id: 'mistral/mistral-small', label: 'Mistral Small', provider: 'Mistral' },
  { id: 'mistral/magistral-medium', label: 'Magistral Medium', provider: 'Mistral' },
  { id: 'mistral/magistral-medium-2506', label: 'Magistral Medium 2506', provider: 'Mistral' },
  { id: 'mistral/magistral-small', label: 'Magistral Small', provider: 'Mistral' },
  { id: 'mistral/magistral-small-2506', label: 'Magistral Small 2506', provider: 'Mistral' },
  { id: 'mistral/codestral', label: 'Codestral', provider: 'Mistral' },
  { id: 'mistral/codestral-embed', label: 'Codestral Embed', provider: 'Mistral' },
  { id: 'mistral/devstral-small', label: 'Devstral Small', provider: 'Mistral' },
  { id: 'mistral/pixtral-large', label: 'Pixtral Large', provider: 'Mistral' },
  { id: 'mistral/pixtral-12b', label: 'Pixtral 12B', provider: 'Mistral' },
  { id: 'mistral/mixtral-8x22b-instruct', label: 'Mixtral 8x22B Instruct', provider: 'Mistral' },
  { id: 'mistral/ministral-8b', label: 'Ministral 8B', provider: 'Mistral' },
  { id: 'mistral/ministral-3b', label: 'Ministral 3B', provider: 'Mistral' },
  { id: 'mistral/mistral-embed', label: 'Mistral Embed', provider: 'Mistral' },
  
  // Moonshotai
  { id: 'moonshotai/kimi-k2-turbo', label: 'Kimi K2 Turbo', provider: 'Moonshotai' },
  { id: 'moonshotai/kimi-k2', label: 'Kimi K2', provider: 'Moonshotai' },
  { id: 'moonshotai/kimi-k2-0905', label: 'Kimi K2 0905', provider: 'Moonshotai' },
  
  // Morph
  { id: 'morph/morph-v3-large', label: 'Morph v3 Large', provider: 'Morph' },
  { id: 'morph/morph-v3-fast', label: 'Morph v3 Fast', provider: 'Morph' },
  
  // OpenAI
  { id: 'openai/gpt-5-pro', label: 'GPT-5 Pro', provider: 'OpenAI', inputCost: '$15.00', outputCost: '$120.00', contextWindow: '400K' },
  { id: 'openai/gpt-5', label: 'GPT-5', provider: 'OpenAI', inputCost: '$1.25', outputCost: '$10.00', contextWindow: '400K' },
  { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini', provider: 'OpenAI', inputCost: '$0.25', outputCost: '$2.00', contextWindow: '400K' },
  { id: 'openai/gpt-5-nano', label: 'GPT-5 Nano', provider: 'OpenAI', inputCost: '$0.05', outputCost: '$0.40', contextWindow: '400K' },
  { id: 'openai/gpt-5-codex', label: 'GPT-5 Codex', provider: 'OpenAI', inputCost: '$1.25', outputCost: '$10.00', contextWindow: '400K' },
  { id: 'openai/gpt-4.1', label: 'GPT-4.1', provider: 'OpenAI', inputCost: '$2.00', outputCost: '$8.00', contextWindow: '1M' },
  { id: 'openai/gpt-4.1-mini', label: 'GPT-4.1 Mini', provider: 'OpenAI', inputCost: '$0.40', outputCost: '$1.60', contextWindow: '1M' },
  { id: 'openai/gpt-4.1-nano', label: 'GPT-4.1 Nano', provider: 'OpenAI', inputCost: '$0.10', outputCost: '$0.40', contextWindow: '1M' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', provider: 'OpenAI', inputCost: '$2.50', outputCost: '$10.00', contextWindow: '128K' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI', inputCost: '$0.15', outputCost: '$0.60', contextWindow: '128K' },
  { id: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI', inputCost: '$10.00', outputCost: '$30.00', contextWindow: '128K' },
  { id: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI', inputCost: '$0.50', outputCost: '$1.50', contextWindow: '16K' },
  { id: 'openai/gpt-3.5-turbo-instruct', label: 'GPT-3.5 Turbo Instruct', provider: 'OpenAI', inputCost: '$1.50', outputCost: '$2.00', contextWindow: '8K' },
  { id: 'openai/o4-mini', label: 'O4 Mini', provider: 'OpenAI', inputCost: '$1.10', outputCost: '$4.40', contextWindow: '200K' },
  { id: 'openai/o3', label: 'O3', provider: 'OpenAI', inputCost: '$2.00', outputCost: '$8.00', contextWindow: '200K' },
  { id: 'openai/o3-mini', label: 'O3 Mini', provider: 'OpenAI', inputCost: '$1.10', outputCost: '$4.40', contextWindow: '200K' },
  { id: 'openai/o1', label: 'O1', provider: 'OpenAI', inputCost: '$15.00', outputCost: '$60.00', contextWindow: '200K' },
  { id: 'openai/gpt-oss-120b', label: 'GPT OSS 120B', provider: 'OpenAI', inputCost: '$0.10', outputCost: '$0.50', contextWindow: '131K' },
  { id: 'openai/gpt-oss-20b', label: 'GPT OSS 20B', provider: 'OpenAI', inputCost: '$0.07', outputCost: '$0.30', contextWindow: '128K' },
  { id: 'openai/text-embedding-3-small', label: 'Text Embedding 3 Small', provider: 'OpenAI', inputCost: '$0.02', outputCost: '—' },
  { id: 'openai/text-embedding-3-large', label: 'Text Embedding 3 Large', provider: 'OpenAI', inputCost: '$0.13', outputCost: '—' },
  { id: 'openai/text-embedding-ada-002', label: 'Text Embedding Ada 002', provider: 'OpenAI', inputCost: '$0.10', outputCost: '—' },
  
  // Perplexity
  { id: 'perplexity/sonar-pro', label: 'Sonar Pro', provider: 'Perplexity' },
  { id: 'perplexity/sonar', label: 'Sonar', provider: 'Perplexity' },
  { id: 'perplexity/sonar-reasoning-pro', label: 'Sonar Reasoning Pro', provider: 'Perplexity' },
  { id: 'perplexity/sonar-reasoning', label: 'Sonar Reasoning', provider: 'Perplexity' },
  
  // Stealth
  { id: 'stealth/sonoma-sky-alpha', label: 'Sonoma Sky Alpha', provider: 'Stealth' },
  { id: 'stealth/sonoma-dusk-alpha', label: 'Sonoma Dusk Alpha', provider: 'Stealth' },
  
  // Vercel
  { id: 'vercel/v0-1.5-md', label: 'v0 1.5 MD', provider: 'Vercel' },
  { id: 'vercel/v0-1.0-md', label: 'v0 1.0 MD', provider: 'Vercel' },
  
  // Voyage
  { id: 'voyage/voyage-3.5', label: 'Voyage 3.5', provider: 'Voyage' },
  { id: 'voyage/voyage-3.5-lite', label: 'Voyage 3.5 Lite', provider: 'Voyage' },
  { id: 'voyage/voyage-3-large', label: 'Voyage 3 Large', provider: 'Voyage' },
  { id: 'voyage/voyage-code-3', label: 'Voyage Code 3', provider: 'Voyage' },
  { id: 'voyage/voyage-code-2', label: 'Voyage Code 2', provider: 'Voyage' },
  { id: 'voyage/voyage-finance-2', label: 'Voyage Finance 2', provider: 'Voyage' },
  { id: 'voyage/voyage-law-2', label: 'Voyage Law 2', provider: 'Voyage' },
  
  // xAI
  { id: 'xai/grok-4', label: 'Grok 4', provider: 'xAI', inputCost: '$3.00', outputCost: '$15.00', contextWindow: '256K' },
  { id: 'xai/grok-4-fast-reasoning', label: 'Grok 4 Fast Reasoning', provider: 'xAI', inputCost: '$0.20', outputCost: '$0.50', contextWindow: '2M' },
  { id: 'xai/grok-4-fast-non-reasoning', label: 'Grok 4 Fast Non-Reasoning', provider: 'xAI', inputCost: '$0.20', outputCost: '$0.50', contextWindow: '2M' },
  { id: 'xai/grok-3', label: 'Grok 3', provider: 'xAI', inputCost: '$3.00', outputCost: '$15.00', contextWindow: '131K' },
  { id: 'xai/grok-3-fast', label: 'Grok 3 Fast', provider: 'xAI', inputCost: '$5.00', outputCost: '$25.00', contextWindow: '131K' },
  { id: 'xai/grok-3-mini', label: 'Grok 3 Mini', provider: 'xAI', inputCost: '$0.30', outputCost: '$0.50', contextWindow: '131K' },
  { id: 'xai/grok-3-mini-fast', label: 'Grok 3 Mini Fast', provider: 'xAI', inputCost: '$0.60', outputCost: '$4.00', contextWindow: '131K' },
  { id: 'xai/grok-2', label: 'Grok 2', provider: 'xAI', inputCost: '$2.00', outputCost: '$10.00', contextWindow: '131K' },
  { id: 'xai/grok-2-vision', label: 'Grok 2 Vision', provider: 'xAI', inputCost: '$2.00', outputCost: '$10.00', contextWindow: '33K' },
  { id: 'xai/grok-code-fast-1', label: 'Grok Code Fast 1', provider: 'xAI', inputCost: '$0.20', outputCost: '$1.50', contextWindow: '256K' },
  
  // ZAI
  { id: 'zai/glm-4.6', label: 'GLM 4.6', provider: 'ZAI' },
  { id: 'zai/glm-4.5', label: 'GLM 4.5', provider: 'ZAI' },
  { id: 'zai/glm-4.5-air', label: 'GLM 4.5 Air', provider: 'ZAI' },
  { id: 'zai/glm-4.5v', label: 'GLM 4.5v', provider: 'ZAI' }
];

const CURATED_MODELS_BY_PROVIDER: Record<string, ModelOption[]> = CURATED_MODELS.reduce(
  (acc, option) => {
    if (!acc[option.provider]) acc[option.provider] = [];
    acc[option.provider].push(option);
    return acc;
  },
  {} as Record<string, ModelOption[]>
);

Object.values(CURATED_MODELS_BY_PROVIDER).forEach((list) =>
  list.sort((a, b) => a.label.localeCompare(b.label))
);

const CURATED_MODEL_LOOKUP = CURATED_MODELS.reduce<Record<string, ModelOption>>((acc, option) => {
  acc[option.id.toLowerCase()] = option;
  return acc;
}, {});

const CURATED_MODEL_IDS = new Set(Object.keys(CURATED_MODEL_LOOKUP));

function cloneModelMap(source: Record<string, ModelOption[]>): Record<string, ModelOption[]> {
  return Object.fromEntries(
    Object.entries(source).map(([provider, options]) => [provider, [...options]])
  );
}

export default function Questionnaire({
  defaultModel,
  onComplete
}: {
  defaultModel: string;
  onComplete: (answers: Answers) => void;
}) {
  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState('');
  const inferred = useMemo(() => inferSelectionsFromIdea(idea), [idea]);

  const [framework, setFramework] = useState<FrameworkChoice>('nextjs_app');
  const [tailwind, setTailwind] = useState(true);
  const [shadcn, setShadcn] = useState(true);
  const [stylingOther, setStylingOther] = useState('');

  const [useVercel, setUseVercel] = useState(true);
  const [db, setDb] = useState<DBChoice>('none');
  const [auth, setAuth] = useState<AuthChoice>('none');

  const [useAISDK, setUseAISDK] = useState(true);
  const [ide, setIde] = useState<IDECopilot>('vscode_copilot');

  const [testing, setTesting] = useState(true);
  const [unit, setUnit] = useState<'jest' | 'vitest' | 'none'>('jest');
  const [e2e, setE2e] = useState<'cypress' | 'playwright' | 'none'>('cypress');

  const [constraints, setConstraints] = useState('');
  const [docGenerationModel, setDocGenerationModel] = useState<string>(defaultModel);
  const [appModels, setAppModels] = useState<string[]>([]);
  
  // PRD Agent Selection - all enabled by default
  const [prdAgents, setPrdAgents] = useState<PRDAgentSelection>({
    marketAnalyst: true,
    scopePlanner: true,
    nextjsArchitect: true,
    aiDesigner: true,
    dataApiDesigner: true,
    securityOfficer: true,
    performanceEngineer: true,
    qualityLead: true
  });
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, ModelOption[]>>(() =>
    cloneModelMap(CURATED_MODELS_BY_PROVIDER)
  );
  const [modelFetchError, setModelFetchError] = useState<string | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);
  const [improvingPrompt, setImprovingPrompt] = useState(false);
  const [improveError, setImproveError] = useState<string | null>(null);
  const [improveSources, setImproveSources] = useState<Array<{ url: string; title?: string }>>([]);
  const [recommendingModels, setRecommendingModels] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const [docModelSearch, setDocModelSearch] = useState('');
  const [appModelsSearch, setAppModelsSearch] = useState('');

  useEffect(() => {
    if (!idea.trim()) return;
    setFramework(inferred.framework);
    setTailwind((prev) => inferred.tailwind || prev);
    setShadcn((prev) => inferred.shadcn || prev);
    setUseAISDK((prev) => inferred.vercelAISDK || prev);
    setIde(inferred.copilot);
    if (db === 'none' && inferred.db !== 'none') setDb(inferred.db as DBChoice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea]);

  useEffect(() => {
    let cancelled = false;
    async function fetchModels() {
      setLoadingModels(true);
      try {
        // Fetch models from our API route (which calls gateway.getAvailableModels() server-side)
        const response = await fetch('/api/available-models');
        const data = await response.json();
        
        if (cancelled) return;

        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Failed to fetch models');
        }

        // Filter to only models that are in our curated list
        const languageModels = data.models.filter(
          (m: { id: string }) => CURATED_MODEL_IDS.has(m.id.toLowerCase())
        );

        if (languageModels.length === 0) {
          setModelsByProvider(cloneModelMap(CURATED_MODELS_BY_PROVIDER));
          setModelFetchError(null);
          setLoadingModels(false);
          return;
        }

        // Build model options with real-time pricing from gateway
        const available: Record<string, ModelOption[]> = {};
        for (const model of languageModels) {
          const normalized = model.id.toLowerCase();
          const curatedOption = CURATED_MODEL_LOOKUP[normalized];
          if (!curatedOption) continue;

          // Create updated model option with live pricing
          const updatedOption: ModelOption = {
            ...curatedOption,
            label: model.name || curatedOption.label,
            // Convert pricing from per-token to per-million tokens
            inputCost: model.pricing?.input 
              ? `$${(parseFloat(model.pricing.input) * 1_000_000).toFixed(2)}`
              : curatedOption.inputCost,
            outputCost: model.pricing?.output
              ? `$${(parseFloat(model.pricing.output) * 1_000_000).toFixed(2)}`
              : curatedOption.outputCost,
          };

          if (!available[curatedOption.provider]) available[curatedOption.provider] = [];
          if (!available[curatedOption.provider].some((existing: ModelOption) => existing.id === updatedOption.id)) {
            available[curatedOption.provider].push(updatedOption);
          }
        }

        // Merge with fallback models
        const merged: Record<string, ModelOption[]> = {};
        Object.entries(CURATED_MODELS_BY_PROVIDER).forEach(([provider, fallback]) => {
          const next = available[provider];
          merged[provider] = next && next.length
            ? [...next].sort((a, b) => a.label.localeCompare(b.label))
            : [...fallback];
        });

        setModelsByProvider(merged);
        setModelFetchError(null);
        setLoadingModels(false);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to fetch models from API:', error);
        
        // Provide more specific error message
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isAuthError = errorMessage.toLowerCase().includes('unauthorized') || 
                           errorMessage.toLowerCase().includes('api key') ||
                           errorMessage.toLowerCase().includes('401');
        
        setModelsByProvider(cloneModelMap(CURATED_MODELS_BY_PROVIDER));
        setModelFetchError(
          isAuthError 
            ? 'Using static model list. Set AI_GATEWAY_API_KEY to enable live pricing.'
            : 'Using static model list. Live pricing unavailable.'
        );
        setLoadingModels(false);
      }
    }
    fetchModels();
    return () => {
      cancelled = true;
    };
  }, []);

  const ideaSignals = useMemo(() => {
    const signals = new Set<string>();
    signals.add(
      frameworkOptions.find((entry) => entry.value === inferred.framework)?.label ?? 'Next.js 15'
    );
    if (inferred.tailwind) signals.add('Tailwind');
    if (inferred.shadcn) signals.add('shadcn/ui');
    if (inferred.vercelAISDK) signals.add('AI SDK 5');
    if (inferred.db && inferred.db !== 'none') {
      const label = dbOptions.find((entry) => entry.value === inferred.db)?.label;
      if (label) signals.add(label);
    }
    if (inferred.copilot && inferred.copilot !== 'none') {
      const label = copilotOptions.find((entry) => entry.value === inferred.copilot)?.label;
      if (label) signals.add(label);
    }
    return Array.from(signals);
  }, [inferred]);

  const providerEntries = useMemo(() => {
    return Object.entries(modelsByProvider)
      .map(([provider, options]) => [
        provider,
        [...options].sort((a, b) => a.label.localeCompare(b.label))
      ] as const)
      .sort(([a], [b]) => a.localeCompare(b));
  }, [modelsByProvider]);

  // Filtered provider entries for app models dropdown with search
  const filteredAppProviderEntries = useMemo(() => {
    if (!appModelsSearch.trim()) return providerEntries;
    
    const searchLower = appModelsSearch.toLowerCase();
    const filtered = providerEntries
      .map(([provider, options]) => {
        const matchedOptions = options.filter(option =>
          option.label.toLowerCase().includes(searchLower) ||
          option.id.toLowerCase().includes(searchLower) ||
          provider.toLowerCase().includes(searchLower)
        );
        return [provider, matchedOptions] as const;
      })
      .filter(([, options]) => options.length > 0);
    
    return filtered;
  }, [providerEntries, appModelsSearch]);

  // Filtered options for doc generation model dropdown with search
  const filteredDocModelOptions = useMemo(() => {
    if (!docModelSearch.trim()) return CURATED_MODELS;
    
    const searchLower = docModelSearch.toLowerCase();
    return CURATED_MODELS.filter(option =>
      option.label.toLowerCase().includes(searchLower) ||
      option.id.toLowerCase().includes(searchLower) ||
      option.provider.toLowerCase().includes(searchLower)
    );
  }, [docModelSearch]);

  const activeModelDisplay = useMemo(() => {
    const normalized = docGenerationModel?.toLowerCase();
    if (normalized && CURATED_MODEL_LOOKUP[normalized]) return CURATED_MODEL_LOOKUP[normalized].label;
    const defaultNormalized = defaultModel?.toLowerCase();
    if (defaultNormalized && CURATED_MODEL_LOOKUP[defaultNormalized])
      return CURATED_MODEL_LOOKUP[defaultNormalized].label;
    return docGenerationModel || defaultModel;
  }, [docGenerationModel, defaultModel]);

  function next() {
    setStep((current) => Math.min(5, current + 1));
  }

  function back() {
    setStep((current) => Math.max(1, current - 1));
  }

  function finish() {
    const answers: Answers = {
      idea,
      framework,
      wantsNextStructure: true,
      styling: { tailwind, shadcn, other: stylingOther || undefined },
      backend: { useVercel, db, auth },
      ai: {
        vercelAISDK: useAISDK,
        appModels: useAISDK && appModels.length > 0 ? appModels : undefined,
        copilot: ide
      },
      prdAgents,
      testing: { enabled: testing, unit, e2e },
      constraints: constraints || undefined,
      docGenerationModel: docGenerationModel || defaultModel
    };
    onComplete(answers);
  }

  async function improvePrompt() {
    if (!idea.trim()) {
      setImproveError('Please enter a project idea first');
      return;
    }

    setImprovingPrompt(true);
    setImproveError(null);

    try {
      const response = await fetch('/api/improve-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to improve prompt');
      }

      setIdea(data.improvedIdea);
      setImproveSources(data.sources || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to improve prompt';
      setImproveError(message);
    } finally {
      setImprovingPrompt(false);
    }
  }

  async function recommendModels() {
    if (!idea.trim()) {
      setRecommendError('Please describe your project idea first');
      return;
    }

    setRecommendingModels(true);
    setRecommendError(null);

    try {
      const response = await fetch('/api/recommend-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to get model recommendations');
      }

      setAppModels(data.recommendations);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get model recommendations';
      setRecommendError(message);
    } finally {
      setRecommendingModels(false);
    }
  }

  function toggleAppModel(modelId: string) {
    setAppModels((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === step;
          const isDone = item.id < step;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(item.id)}
              className={cn(
                'rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.75)] p-5 text-left transition-all cursor-pointer hover:border-[hsl(var(--color-primary)/0.5)] hover:shadow-[0_20px_40px_-30px_hsl(var(--color-primary))]',
                isActive && 'ring-2 ring-[hsl(var(--color-primary)/0.35)]',
                isDone && 'opacity-75 hover:opacity-100'
              )}
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    'border-transparent text-[0.65rem] uppercase tracking-[0.3em]',
                    isActive
                      ? 'bg-[hsl(var(--color-primary)/0.18)] text-[hsl(var(--color-primary))]'
                      : 'bg-[hsl(var(--color-muted)/0.45)] text-[hsl(var(--color-muted-foreground))]'
                  )}
                >
                  {item.label}
                </Badge>
                <Icon className={cn('size-6 opacity-60', isActive && 'text-[hsl(var(--color-primary))]')} />
              </div>
              <p className="mt-3 text-sm text-[hsl(var(--color-muted-foreground))]">{item.blurb}</p>
            </button>
          );
        })}
      </header>

      {step === 1 && (
        <section className="space-y-4 rounded-[calc(var(--radius-lg)+0.75rem)] border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.8)] p-8 shadow-[0_25px_60px_-40px_hsl(var(--shadow))] backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-semibold text-[hsl(var(--color-foreground))]">Project vision</h2>
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
              Write the pitch, target audience, MVP scope, or anything the AI should know.
            </p>
          </div>
          <div className="relative">
            <Textarea
              value={idea}
              onChange={(event) => {
                setIdea(event.target.value);
                // Clear sources when user modifies the idea
                if (improveSources.length > 0) {
                  setImproveSources([]);
                }
              }}
              placeholder="Example: Build a compliance-ready founder dashboard with SOC2 auth, AI changelog summaries, and Neon-backed analytics."
              className="min-h-[160px] resize-none rounded-3xl border-none bg-[hsl(var(--color-muted)/0.4)] p-6 pb-14 text-base text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-muted-foreground))] focus-visible:ring-[hsl(var(--color-primary)/0.25)]"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              {improveSources.length > 0 && !improvingPrompt && (
                <Badge 
                  variant="outline" 
                  className="gap-1 border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.12)] text-[hsl(var(--color-primary))]"
                >
                  <ExternalLink className="size-3" />
                  {improveSources.length}
                </Badge>
              )}
              <Button
                type="button"
                onClick={improvePrompt}
                disabled={improvingPrompt || !idea.trim()}
                className="gap-2 rounded-full bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] hover:bg-[hsl(var(--color-primary)/0.9)] disabled:opacity-50"
                size="sm"
              >
                {improvingPrompt ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Improve Prompt
                  </>
                )}
              </Button>
            </div>
          </div>
          {improveError && (
            <p className="text-sm text-red-500">{improveError}</p>
          )}
          {improveSources.length > 0 && (
            <div className="rounded-xl border border-[hsl(var(--color-border)/0.5)] bg-[hsl(var(--color-card)/0.5)] p-4">
              <Sources>
                <SourcesTrigger count={improveSources.length}>
                  <div className="flex items-center gap-2 text-[hsl(var(--color-foreground))]">
                    <ExternalLink className="size-4 text-[hsl(var(--color-primary))]" />
                    <p className="text-sm font-medium">Used {improveSources.length} web {improveSources.length === 1 ? 'source' : 'sources'}</p>
                    <ChevronDown className="size-4" />
                  </div>
                </SourcesTrigger>
                <SourcesContent>
                  {improveSources.map((source, index) => {
                    try {
                      const url = new URL(source.url);
                      return (
                        <Source
                          key={index}
                          href={source.url}
                          title={source.title || url.hostname}
                          className="text-[hsl(var(--color-foreground))] hover:text-[hsl(var(--color-primary))] transition-colors"
                        />
                      );
                    } catch {
                      return null;
                    }
                  })}
                </SourcesContent>
              </Sources>
            </div>
          )}
          {ideaSignals.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {ideaSignals.map((signal) => (
                <Badge
                  key={signal}
                  variant="outline"
                  className="border-[hsl(var(--color-primary)/0.35)] bg-[hsl(var(--color-primary)/0.12)] text-[hsl(var(--color-primary))]"
                >
                  {signal}
                </Badge>
              ))}
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="space-y-8 rounded-[calc(var(--radius-lg)+0.75rem)] border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.8)] p-8 shadow-[0_25px_60px_-40px_hsl(var(--shadow))] backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-3">
            {frameworkOptions.map((option) => {
              const isActive = framework === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFramework(option.value)}
                  className={cn(
                    'flex h-full cursor-pointer flex-col justify-between rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--color-ring-soft)/0.5)] hover:shadow-[0_26px_48px_-30px_hsl(var(--color-ring-soft))]',
                    isActive
                      ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.16)] text-[hsl(var(--color-foreground))] shadow-[0_30px_55px_-35px_hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border)/0.45)] bg-[hsl(var(--color-card)/0.7)] text-[hsl(var(--color-foreground))]'
                  )}
                >
                  <span className="text-base font-semibold">{option.label}</span>
                  <span className="mt-3 text-xs text-[hsl(var(--color-muted-foreground))]">{option.note}</span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
            <div className="space-y-4 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] p-6">
              <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">Styling DNA</Label>
              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setTailwind((prev) => !prev)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    tailwind
                      ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.18)] text-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border)/0.6)] text-[hsl(var(--color-muted-foreground))] hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:text-[hsl(var(--color-foreground))]'
                  )}
                >
                  Tailwind
                </button>
                <button
                  type="button"
                  onClick={() => setShadcn((prev) => !prev)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    shadcn
                      ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.18)] text-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border)/0.6)] text-[hsl(var(--color-muted-foreground))] hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:text-[hsl(var(--color-foreground))]'
                  )}
                >
                  shadcn/ui
                </button>
              </div>
              <Input
                value={stylingOther}
                onChange={(event) => setStylingOther(event.target.value)}
                placeholder="Extra styling notes (tokens, theming, etc.)"
                className="rounded-2xl border-none bg-[hsl(var(--color-muted)/0.4)]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] p-5">
                <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">Database</Label>
                <Select value={db} onValueChange={(value) => setDb(value as DBChoice)}>
                  <SelectTrigger className="w-full rounded-2xl">
                    <SelectValue placeholder="Pick one" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] p-5">
                <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">Auth</Label>
                <Select value={auth} onValueChange={(value) => setAuth(value as AuthChoice)}>
                  <SelectTrigger className="w-full rounded-2xl">
                    <SelectValue placeholder="Auth option" />
                  </SelectTrigger>
                  <SelectContent>
                    {authOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                onClick={() => setUseVercel((prev) => !prev)}
                aria-pressed={useVercel}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-3xl border px-5 py-4 text-left transition-all duration-300 sm:col-span-2 hover:-translate-y-0.5 hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:shadow-[0_22px_42px_-30px_hsl(var(--color-ring-soft))]',
                  useVercel
                    ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.16)] text-[hsl(var(--color-primary))]'
                    : 'border-[hsl(var(--color-border)/0.55)] bg-[hsl(var(--color-card)/0.65)] text-[hsl(var(--color-muted-foreground))]'
                )}
              >
                <div>
                  <p className="text-sm font-semibold tracking-wide">Deploy on Vercel</p>
                  <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                    Toggle to include Edge config, env matrix, and preview strategy.
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em]',
                    useVercel
                      ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.25)] text-[hsl(var(--color-primary))]'
                      : 'border-[hsl(var(--color-border)/0.7)] bg-[hsl(var(--color-muted)/0.4)] text-[hsl(var(--color-muted-foreground))]'
                  )}
                >
                  {useVercel ? 'Enabled' : 'Optional'}
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-8 rounded-[calc(var(--radius-lg)+0.75rem)] border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.82)] p-8 shadow-[0_25px_60px_-40px_hsl(var(--shadow))] backdrop-blur-xl">
          {/* PRD Agent Selection */}
          <PRDAgentSelector selected={prdAgents} onChange={setPrdAgents} />
        </section>
      )}

      {step === 4 && (
        <section className="space-y-8 rounded-[calc(var(--radius-lg)+0.75rem)] border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.82)] p-8 shadow-[0_25px_60px_-40px_hsl(var(--shadow))] backdrop-blur-xl">
          {/* Documentation Generation Model */}
          <div className="space-y-4 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.75)] p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">
                  Documentation generation model
                </Label>
                <Badge variant="outline" className="bg-[hsl(var(--color-primary)/0.18)] text-[hsl(var(--color-primary))]">
                  {activeModelDisplay}
                </Badge>
              </div>
              <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                AI model used to generate your PRD, AGENTS, and IMPLEMENTATION docs
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[hsl(var(--color-border)/0.4)] bg-[hsl(var(--color-surface-soft)/0.6)] px-4 py-3 text-left text-sm font-medium text-[hsl(var(--color-foreground))] transition-colors hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:bg-[hsl(var(--color-surface-soft)/0.75)]">
                  <span className="truncate">{activeModelDisplay}</span>
                  <ChevronDown className="size-4 opacity-70" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[min(340px,92vw)] sm:w-[min(420px,90vw)] md:w-[min(560px,85vw)] xl:w-[min(680px,70vw)] max-h-[360px] overflow-x-hidden rounded-2xl border border-[hsl(var(--color-border)/0.45)] bg-[hsl(var(--color-card)/0.96)] shadow-[0_35px_80px_-40px_hsl(var(--color-ring-soft))] backdrop-blur-2xl p-0">
                <div className="sticky top-0 z-10 border-b border-[hsl(var(--color-border)/0.4)] bg-[hsl(var(--color-card)/0.98)] p-2 backdrop-blur-xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))]" />
                    <input
                      type="text"
                      placeholder="Search models..."
                      value={docModelSearch}
                      onChange={(e) => setDocModelSearch(e.target.value)}
                      className="w-full rounded-lg border border-[hsl(var(--color-border)/0.3)] bg-[hsl(var(--color-surface-soft)/0.5)] py-2 pl-9 pr-9 text-sm text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-muted-foreground))] focus:border-[hsl(var(--color-primary)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring-soft)/0.25)]"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    {docModelSearch && (
                      <button
                        onClick={() => setDocModelSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
                <ScrollArea className="max-h-[290px] pr-1 md:pr-2">
                  <div className="space-y-3 p-2">
                    {filteredDocModelOptions.length === 0 ? (
                      <div className="py-8 text-center text-sm text-[hsl(var(--color-muted-foreground))]">
                        No models found
                      </div>
                    ) : (
                      Object.entries(
                        filteredDocModelOptions.reduce((acc, option) => {
                          if (!acc[option.provider]) acc[option.provider] = [];
                          acc[option.provider].push(option);
                          return acc;
                        }, {} as Record<string, typeof filteredDocModelOptions>)
                      )
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([provider, options]) => (
                      <DropdownMenuGroup key={provider} className="space-y-1 px-1">
                        <DropdownMenuLabel className="text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--color-muted-foreground))]">
                          {provider}
                        </DropdownMenuLabel>
                        <div className="grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-2">
                          {options.map((option) => (
                            <DropdownMenuItem
                              key={option.id}
                              className={cn(
                                'w-full cursor-pointer rounded-lg border border-transparent px-3 py-2 text-sm font-medium leading-tight transition-colors duration-150',
                                docGenerationModel.toLowerCase() === option.id.toLowerCase()
                                  ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.12)] text-[hsl(var(--color-primary))]'
                                  : 'hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:bg-[hsl(var(--color-surface-soft)/0.65)]'
                              )}
                              onSelect={() => setDocGenerationModel(option.id)}
                            >
                              <div className="flex flex-col">
                                <span className="whitespace-normal break-words">{option.label}</span>
                                <span className="break-all text-[0.65rem] text-[hsl(var(--color-muted-foreground))]">
                                  {option.id}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </DropdownMenuGroup>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            {loadingModels && (
              <p className="flex items-center gap-2 text-xs text-[hsl(var(--color-muted-foreground))]">
                <Loader2 className="size-3 animate-spin" />
                Syncing live model pricing...
              </p>
            )}
            {modelFetchError && <p className="text-xs text-amber-500">{modelFetchError}</p>}
          </div>

          {/* App AI Models Section */}
          <div className="space-y-4 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.75)] p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">
                  Use Vercel AI SDK in your app?
                </Label>
                <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                  Enable to select AI models for your application
                </p>
              </div>
              <Switch
                checked={useAISDK}
                onCheckedChange={setUseAISDK}
              />
            </div>

            {useAISDK && (
              <div className="space-y-4 pt-4 border-t border-[hsl(var(--color-border)/0.4)]">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">
                    App AI models
                  </Label>
                  <Button
                    type="button"
                    onClick={recommendModels}
                    disabled={recommendingModels || !idea.trim()}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    {recommendingModels ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Recommend by AI
                      </>
                    )}
                  </Button>
                </div>

                {!idea.trim() && (
                  <div className="rounded-xl bg-[hsl(var(--color-muted)/0.3)] p-4 text-center">
                    <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                      💡 Describe your project idea in Step 1 to enable AI model recommendations
                    </p>
                  </div>
                )}

                {recommendError && (
                  <p className="text-sm text-red-500">{recommendError}</p>
                )}

                {appModels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {appModels.map((modelId) => {
                      const modelInfo = CURATED_MODEL_LOOKUP[modelId.toLowerCase()];
                      return (
                        <button
                          key={modelId}
                          type="button"
                          onClick={() => toggleAppModel(modelId)}
                          className="group relative inline-flex items-center gap-2 rounded-full border border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.12)] px-3 py-1.5 text-sm font-medium text-[hsl(var(--color-primary))] transition-all hover:bg-[hsl(var(--color-primary)/0.2)]"
                        >
                          <span>{modelInfo?.label || modelId}</span>
                          <span className="text-xs opacity-70">×</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-medium text-[hsl(var(--color-muted-foreground))]">
                    Or manually select models:
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[hsl(var(--color-border)/0.4)] bg-[hsl(var(--color-surface-soft)/0.6)] px-4 py-3 text-left text-sm font-medium text-[hsl(var(--color-foreground))] transition-colors hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:bg-[hsl(var(--color-surface-soft)/0.75)]">
                        <span>Select AI models ({appModels.length} selected)</span>
                        <ChevronDown className="size-4 opacity-70" aria-hidden="true" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[min(340px,92vw)] sm:w-[min(420px,90vw)] md:w-[min(560px,85vw)] xl:w-[min(680px,70vw)] max-h-[360px] overflow-x-hidden rounded-2xl border border-[hsl(var(--color-border)/0.45)] bg-[hsl(var(--color-card)/0.96)] shadow-[0_35px_80px_-40px_hsl(var(--color-ring-soft))] backdrop-blur-2xl p-0">
                      <div className="sticky top-0 z-10 border-b border-[hsl(var(--color-border)/0.4)] bg-[hsl(var(--color-card)/0.98)] p-2 backdrop-blur-xl">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))]" />
                          <input
                            type="text"
                            placeholder="Search models..."
                            value={appModelsSearch}
                            onChange={(e) => setAppModelsSearch(e.target.value)}
                            className="w-full rounded-lg border border-[hsl(var(--color-border)/0.3)] bg-[hsl(var(--color-surface-soft)/0.5)] py-2 pl-9 pr-9 text-sm text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-muted-foreground))] focus:border-[hsl(var(--color-primary)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring-soft)/0.25)]"
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                          {appModelsSearch && (
                            <button
                              onClick={() => setAppModelsSearch('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
                            >
                              <X className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <ScrollArea className="max-h-[290px] pr-1 md:pr-2">
                        <div className="space-y-3 p-2">
                          {filteredAppProviderEntries.length === 0 ? (
                            <div className="py-8 text-center text-sm text-[hsl(var(--color-muted-foreground))]">
                              No models found
                            </div>
                          ) : (
                            filteredAppProviderEntries.map(([provider, options]) => (
                            <DropdownMenuGroup key={provider} className="space-y-1 px-1">
                              <DropdownMenuLabel className="text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--color-muted-foreground))]">
                                {provider}
                              </DropdownMenuLabel>
                              <div className="grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-2">
                                {options.map((option) => (
                                  <DropdownMenuItem
                                    key={option.id}
                                    className={cn(
                                      'w-full cursor-pointer rounded-lg border border-transparent px-3 py-2 text-sm font-medium leading-tight transition-colors duration-150',
                                      appModels.some(m => m.toLowerCase() === option.id.toLowerCase())
                                        ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.12)] text-[hsl(var(--color-primary))]'
                                        : 'hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:bg-[hsl(var(--color-surface-soft)/0.65)]'
                                    )}
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      toggleAppModel(option.id);
                                    }}
                                  >
                                    <div className="flex items-start gap-2 w-full">
                                      <span className={cn(
                                        "grid size-4 place-items-center rounded-sm border flex-shrink-0 mt-0.5",
                                        appModels.some(m => m.toLowerCase() === option.id.toLowerCase())
                                          ? "border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary))]"
                                          : "border-[hsl(var(--color-border))]"
                                      )}>
                                        {appModels.some(m => m.toLowerCase() === option.id.toLowerCase()) && (
                                          <Check className="size-3 text-white" />
                                        )}
                                      </span>
                                      <div className="flex flex-col flex-1 min-w-0">
                                        <span className="whitespace-normal break-words font-medium">{option.label}</span>
                                        <span className="break-all text-[0.65rem] text-[hsl(var(--color-muted-foreground))]">
                                          {option.id}
                                        </span>
                                        {(option.inputCost || option.outputCost || option.contextWindow) && (
                                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[0.65rem]">
                                            {option.contextWindow && (
                                              <span className="text-[hsl(var(--color-muted-foreground))]">
                                                {option.contextWindow} ctx
                                              </span>
                                            )}
                                            {option.inputCost && (
                                              <span className="text-emerald-600 dark:text-emerald-400">
                                                ↓{option.inputCost}/M
                                              </span>
                                            )}
                                            {option.outputCost && (
                                              <span className="text-amber-600 dark:text-amber-400">
                                                ↑{option.outputCost}/M
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </div>
                            </DropdownMenuGroup>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-3 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.75)] p-6">
              <div className="flex items-center gap-3">
                <Cpu className="size-5 text-[hsl(var(--color-primary))]" />
                <p className="text-sm font-semibold text-[hsl(var(--color-foreground))]">IDE / Code Copilot</p>
              </div>
              <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                Select your development environment for MCP integration and IDE-specific recommendations
              </p>
              <Select value={ide} onValueChange={(value) => setIde(value as IDECopilot)}>
                <SelectTrigger className="w-full rounded-2xl">
                  <SelectValue placeholder="Select IDE / copilot" />
                </SelectTrigger>
                <SelectContent>
                  {copilotOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.75)] p-6">
              <div className="flex items-center gap-3">
                <Database className="size-5 text-[hsl(var(--color-primary))]" />
                <p className="text-sm font-semibold text-[hsl(var(--color-foreground))]">Quality gates</p>
              </div>
              <button
                type="button"
                onClick={() => setTesting((prev) => !prev)}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[hsl(var(--color-ring-soft)/0.45)] hover:shadow-[0_22px_44px_-30px_hsl(var(--color-ring-soft))]',
                  testing
                    ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.15)] text-[hsl(var(--color-primary))]'
                    : 'border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] text-[hsl(var(--color-muted-foreground))]'
                )}
              >
                {testing ? 'Testing enabled' : 'Skip testing setup'}
              </button>
              {testing && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select value={unit} onValueChange={(value) => setUnit(value as typeof unit)}>
                  <SelectTrigger className="w-full rounded-2xl">
                    <SelectValue placeholder="Unit testing" />
                  </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={e2e} onValueChange={(value) => setE2e(value as typeof e2e)}>
                  <SelectTrigger className="w-full rounded-2xl">
                    <SelectValue placeholder="E2E testing" />
                  </SelectTrigger>
                    <SelectContent>
                      {e2eOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-6 rounded-[calc(var(--radius-lg)+0.75rem)] border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.85)] p-8 shadow-[0_25px_60px_-40px_hsl(var(--shadow))] backdrop-blur-xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Framework', value: frameworkOptions.find((f) => f.value === framework)?.label ?? framework },
              {
                label: 'Styling',
                value: [tailwind && 'Tailwind', shadcn && 'shadcn/ui', stylingOther || null]
                  .filter(Boolean)
                  .join(' · ') || 'Minimal'
              },
              { label: 'Hosting', value: useVercel ? 'Vercel' : 'Custom' },
              { label: 'Database', value: dbOptions.find((entry) => entry.value === db)?.label ?? db },
              { label: 'Auth', value: authOptions.find((entry) => entry.value === auth)?.label ?? auth },
              { label: 'Doc generation model', value: docGenerationModel || defaultModel },
              {
                label: 'PRD Agents',
                value: `${Object.values(prdAgents).filter(Boolean).length} / 8 selected`
              },
              {
                label: 'App AI models',
                value: useAISDK && appModels.length > 0 
                  ? `${appModels.length} selected` 
                  : useAISDK ? 'None selected' : 'Not using AI SDK'
              },
              {
                label: 'Testing',
                value: testing ? `${unit.toUpperCase()} + ${e2e.toUpperCase()}` : 'Deferred'
              },
              {
                label: 'Copilot',
                value: copilotOptions.find((entry) => entry.value === ide)?.label ?? ide
              }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.7)] p-5"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--color-muted-foreground))]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-[hsl(var(--color-foreground))]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[hsl(var(--color-foreground))]">
              Constraints, success metrics & other notes (optional)
            </Label>
            <Textarea
              value={constraints}
              onChange={(event) => setConstraints(event.target.value)}
              placeholder="Performance budgets, compliance requirements, roll-out strategy..."
              className="min-h-[110px] resize-none rounded-3xl border-none bg-[hsl(var(--color-muted)/0.35)] p-5 text-sm focus-visible:ring-[hsl(var(--color-primary)/0.25)]"
            />
          </div>
        </section>
      )}

      <footer className="flex flex-col gap-4 border-t border-[hsl(var(--color-border)/0.4)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          onClick={back}
          disabled={step === 1}
          className="w-full justify-center gap-2 rounded-full border border-[hsl(var(--color-border)/0.6)] bg-[hsl(var(--color-card)/0.65)] sm:w-auto"
        >
          Back
        </Button>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {step < 5 && (
            <Button
              onClick={next}
              className="w-full justify-center gap-2 rounded-full bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] hover:bg-[hsl(var(--color-primary)/0.9)] sm:w-auto"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          )}
          {step === 5 && (
            <Button
              onClick={finish}
              className="w-full justify-center gap-2 rounded-full bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] hover:bg-[hsl(var(--color-primary)/0.9)] sm:w-auto"
            >
              Generate documents
              <Rocket className="size-4" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
