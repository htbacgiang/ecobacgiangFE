// Next.js API Route đã bị vô hiệu hóa
// Tất cả API calls đều đi qua Server API (NEXT_PUBLIC_API_SERVER_URL)
// File gốc đã được backup

export default function handler(req, res) {
  res.status(503).json({ 
    error: 'Next.js API has been disabled',
    message: 'Please use Server API (configured via NEXT_PUBLIC_API_SERVER_URL)',
    originalRoute: 'auth\reset-password.js'
  });
}
