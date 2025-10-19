# AI Project Docs Generator

Generate a **PRD**, **AGENTS.md** (per the open standard), an **IMPLEMENTATION.md** checklist, and an optional **MCP.md** from a dynamic questionnaire.

- **Next.js 15 + App Router**
- **Tailwind CSS v4 + shadcn/ui**
- **Vercel AI SDK 5** via **Vercel AI Gateway**

## Quick start

```bash
pnpm i
pnpm dev


Example: I want to generate a Next.js 15 App router app powered by Vercel AI Gateway to generate customized Newsletters. We should have Auth and Stripe (you can choose the best option for Auth). We will use Vercel AI SDK. The idea is very simple: we have a landing page to login/signup, the user needs to pay ($5 usd/month) to be able to use it. In the /dashboard users will in a very simple prompt (we will make the most of Vercel AI Elements for this) write what he wants his newsletter be about (we will need a beautiful UI generated with Tailwind and Shadcn) to help the user to know which is the best way to generate their own newsletter (e.g. style of the newsletters, topics, what to avoid, etc. you need to be very innovative and creative in this way to avoid a plain form). We will use Resend, Supabase and React Templates to send programmatically the newsletters. The user will be able to choose how many news they want to receive (between 1/month, 2/month, 4/month). The UX in the email should be award-winning; our expected use case is the users will be 100% excited to open their email to read the newsletters because of the AI-tailored content and because of the amazing design of the UI.