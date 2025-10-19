'use client';

import { Button } from './ui/button';
import { downloadText } from '@/lib/utils';

export default function DownloadButton({ filename, content }: { filename: string; content: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => downloadText(filename, content)}>
      Download {filename}
    </Button>
  );
}
