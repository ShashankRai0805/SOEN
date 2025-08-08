export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  return res.status(200).json({
    message: 'Debug API working!',
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    headers: Object.keys(req.headers)
  })
}
