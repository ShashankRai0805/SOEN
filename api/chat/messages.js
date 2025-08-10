// Simple in-memory storage for messages (in production, use a database)
let messages = []
let users = new Map() // Store user sessions

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const { room = 'general', since } = req.query
    
    // Filter messages by room and timestamp
    let filteredMessages = messages.filter(msg => msg.room === room)
    
    if (since) {
      const sinceTime = new Date(since)
      filteredMessages = filteredMessages.filter(msg => new Date(msg.timestamp) > sinceTime)
    }

    return res.status(200).json({
      success: true,
      messages: filteredMessages,
      onlineUsers: Array.from(users.values()).filter(u => u.room === room)
    })
  }

  if (req.method === 'POST') {
    const { message, room = 'general', user, type = 'message' } = req.body

    if (!message || !user) {
      return res.status(400).json({
        success: false,
        error: 'Message and user are required'
      })
    }

    // Create new message
    const newMessage = {
      id: Date.now().toString(),
      message,
      user,
      room,
      type,
      timestamp: new Date().toISOString()
    }

    // Store message
    messages.push(newMessage)

    // Keep only last 100 messages per room
    const roomMessages = messages.filter(m => m.room === room)
    if (roomMessages.length > 100) {
      messages = messages.filter(m => m.room !== room).concat(roomMessages.slice(-100))
    }

    // Update user status
    const userId = user._id || user.email
    users.set(userId, {
      ...user,
      room,
      lastSeen: new Date().toISOString()
    })

    // Clean up old users (offline after 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    for (const [id, userData] of users.entries()) {
      if (new Date(userData.lastSeen) < fiveMinutesAgo) {
        users.delete(id)
      }
    }

    return res.status(200).json({
      success: true,
      message: newMessage
    })
  }

  return res.status(405).json({
    success: false,
    message: `Method ${req.method} not allowed`
  })
}
