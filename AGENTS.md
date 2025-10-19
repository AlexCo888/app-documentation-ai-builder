# Repository Guidelines

## Project Structure & Module Organization
This Next.js 15 app keeps all source under `src`. App routes live in `src/app`, where `layout.tsx` defines shells and nested folders own their feature pages. Shared UI components sit in `src/components`, with `components/ui` mirroring shadcn-style primitives and feature widgets like `DownloadButton` and `Markdown`. Cross-cutting utilities, schema helpers, and API clients belong in `src/lib`. Static assets live in `public`, and root configs (`tsconfig.json`, `eslint.config.mjs`, `components.json`) track tooling.

## Build, Test & Development Commands
Install dependencies once per machine with `pnpm install`. Use `pnpm dev` to launch the Turbopack dev server on `http://localhost:3000`, and `pnpm build` for a production compile. `pnpm start` serves the optimized output after a build. Run `pnpm lint` before committing; it executes the Next.js core-web-vitals ESLint suite with TypeScript awareness.

## Coding Style & Naming Conventions
Code is TypeScript-first with `@/*` path aliases defined in `tsconfig.json`. Prefer functional React components named in PascalCase (e.g., `Questionnaire`, `DownloadButton`) and colocate hooks/utilities in camelCase files under `src/lib`. Keep JSX indentation at two spaces and rely on ESLint for consistency; introduce new formatters only after repo-wide alignment. Tailwind CSS 4 powers styling—compose utility classes inline and centralize tokens in `components.json`. Expose browser-safe configuration via `NEXT_PUBLIC_*` environment variables and read others server-side.

## Testing Guidelines
An automated test runner is not yet configured, so treat linting as the minimum gate. When adding coverage, colocate tests beside the subject using the `.test.ts(x)` suffix and keep shared fixtures in `src/lib/test` to avoid circular imports. Prioritize high-impact flows: questionnaire submission, API responses, and Markdown rendering. Update `package.json` with a `test` script (Vitest or Playwright both fit) as soon as the first suite lands, then document coverage expectations here.

## Commit & Pull Request Guidelines
Keep commit messages short, present-tense, and specific (e.g., `Add questionnaire validation`). Group related changes together and avoid “WIP” or merge commits. Pull requests should include a summary of intent, screenshots for UI tweaks, callouts for new env vars, and manual verification notes. Link issues with `Closes #ID` when relevant, and ensure `pnpm lint` completes successfully before requesting review.

## Security & Configuration Tips
Secrets belong in `.env.local`, which stays untracked; share sample values in the README instead of committing real keys. Verify third-party API keys before pushing, ensure `NEXT_PUBLIC_*` values are browser-safe, and rotate credentials promptly after any exposure.
