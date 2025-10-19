import './globals.css';

export const metadata = {
  title: 'AI Project Docs Generator',
  description: 'Generate PRD, AGENTS.md, and an implementation plan from your idea.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold">AI Project Docs Generator</h1>
            <p className="text-sm opacity-80">
              Next.js 15 · Tailwind v4 · shadcn/ui · Vercel AI SDK 5
            </p>
          </header>
          {children}
          <footer className="mt-12 text-xs opacity-70">
            <p>
              Powered by Vercel AI Gateway + AI SDK 5. Models selectable in UI.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
