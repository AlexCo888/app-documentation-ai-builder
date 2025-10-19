'use client';

import React from 'react';
import { Response } from '@/components/ai-elements/response';

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose max-w-none">
      <Response>{content}</Response>
    </div>
  );
}
