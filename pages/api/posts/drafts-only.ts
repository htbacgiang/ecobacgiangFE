// Next.js API Route đã bị vô hiệu hóa
// Tất cả API calls đều đi qua Server API (NEXT_PUBLIC_API_SERVER_URL)
// File gốc đã được backup

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(503).json({ 
    error: 'Next.js API has been disabled',
    message: 'Please use Server API (configured via NEXT_PUBLIC_API_SERVER_URL)',
    originalRoute: 'posts\drafts-only.ts'
  });
}
