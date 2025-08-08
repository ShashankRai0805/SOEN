// Simple working API for Vercel
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Test API working!',
      timestamp: new Date().toISOString(),
      method: req.method
    })
  }

  if (req.method === 'POST') {
    return res.status(200).json({ 
      message: 'POST request working!',
      body: req.body,
      timestamp: new Date().toISOString()
    })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
