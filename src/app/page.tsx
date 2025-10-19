'use client';

import { useState } from 'react';
import Questionnaire from '@/components/Questionnaire';
import { Markdown } from '@/components/Markdown';
import DownloadButton from '@/components/DownloadButton';
import { Button } from '@/components/ui/button';

const DEFAULT_MODEL = process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'openai/gpt-4o';

type FileOut = { name: string; content: string };

export default function Page() {
  const [files, setFiles] = useState<FileOut[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete(answers: any) {
    setLoading(true);
    setError(null);
    setFiles(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ answers }),
        headers: { 'content-type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Generation failed');
      setFiles(data.files);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFiles(null);
    setError(null);
  }

  return (
    <main className="space-y-8">
      {!files && !loading && (
        <Questionnaire defaultModel={DEFAULT_MODEL} onComplete={handleComplete} />
      )}

      {loading && (
        <div className="rounded-md border border-[--color-border] p-6">
          <p>Generating documents… (streaming occurs server-side)</p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-300 p-4">
          <p className="text-red-600">Error: {error}</p>
          <Button className="mt-3" onClick={reset}>Try again</Button>
        </div>
      )}

      {files && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Generated Documents</h2>
            <Button variant="ghost" onClick={reset}>Start over</Button>
          </div>

          {files.map(f => (
            <article key={f.name} className="rounded-md border border-[--color-border] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{f.name}</h3>
                <DownloadButton filename={f.name} content={f.content} />
              </div>
              <Markdown content={f.content} />
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
