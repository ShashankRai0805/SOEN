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
      message: 'Auth API working!',
      availableActions: ['login', 'register']
    })
  }

  if (req.method === 'POST') {
    const { action } = req.query
    const { email, password } = req.body

    console.log('Auth API - Method:', req.method)
    console.log('Auth API - Action:', action)
    console.log('Auth API - Body:', req.body)

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      })
    }

    // For now, just return a success response to test if API is working
    if (action === 'register') {
      return res.status(200).json({
        success: true,
        message: 'Registration endpoint working!',
        user: { email },
        token: 'test-token-123'
      })
    }

    if (action === 'login') {
      return res.status(200).json({
        success: true,
        message: 'Login endpoint working!',
        user: { email },
        token: 'test-token-123'
      })
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use ?action=login or ?action=register'
    })
  }

  return res.status(405).json({ message: `Method ${req.method} not allowed` })
}
