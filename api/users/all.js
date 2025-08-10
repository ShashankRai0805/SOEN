export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: `Method ${req.method} not allowed` 
    })
  }

  console.log('Users API - Getting all users')

  // Mock users data
  const mockUsers = [
    {
      _id: 'user1',
      email: 'user1@example.com',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user2', 
      email: 'user2@example.com',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'user3',
      email: 'user3@example.com', 
      createdAt: new Date().toISOString()
    }
  ]

  return res.status(200).json({
    success: true,
    users: mockUsers
  })
}
