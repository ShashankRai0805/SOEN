// Unified API endpoint for all SEON functionality
// This consolidates all endpoints to stay within Vercel's 12 function limit

// In-memory storage (use database in production)
let messages = []
let users = new Map()
let projects = [
  {
    _id: '1',
    name: 'Sample Project 1',
    description: 'This is a sample project',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Sample Project 2',
    description: 'Another sample project',
    createdAt: new Date().toISOString()
  }
]

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

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { endpoint } = req.query
  
  console.log('API called with endpoint:', endpoint)
  console.log('Method:', req.method)
  console.log('Query:', req.query)
  console.log('Body:', req.body)
  
  try {
    // Route to appropriate handler based on endpoint
    switch (endpoint) {
      case 'health':
        return res.status(200).json({
          success: true,
          message: 'API is healthy',
          timestamp: new Date().toISOString()
        })
      case 'auth':
        return handleAuth(req, res)
      case 'projects':
        return handleProjects(req, res)
      case 'users':
        return handleUsers(req, res)
      case 'chat-messages':
        return handleChatMessages(req, res)
      case 'chat-ai':
        return handleChatAI(req, res)
      case 'project-users':
        return handleProjectUsers(req, res)
      default:
        return res.status(404).json({
          success: false,
          error: `Endpoint '${endpoint}' not found`,
          availableEndpoints: ['health', 'auth', 'projects', 'users', 'chat-messages', 'chat-ai', 'project-users']
        })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    })
  }
}

// Authentication handler
function handleAuth(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { action } = req.query
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password required'
    })
  }

  if (action === 'register') {
    return res.status(200).json({
      success: true,
      message: 'Registration successful!',
      user: { email },
      token: 'test-token-' + Date.now()
    })
  }

  if (action === 'login') {
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: { email },
      token: 'test-token-' + Date.now()
    })
  }

  return res.status(400).json({
    success: false,
    error: 'Invalid action. Use ?action=login or ?action=register'
  })
}

// Projects handler
function handleProjects(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      projects: projects
    })
  }

  if (req.method === 'POST') {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      })
    }

    const newProject = {
      _id: Date.now().toString(),
      name,
      description: description || '',
      createdAt: new Date().toISOString()
    }

    projects.push(newProject)

    return res.status(201).json({
      success: true,
      project: newProject,
      message: 'Project created successfully!'
    })
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' })
}

// Users handler
function handleUsers(req, res) {
  console.log('handleUsers called with method:', req.method)
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  console.log('Returning users:', mockUsers)
  
  return res.status(200).json({
    success: true,
    users: mockUsers
  })
}

// Chat messages handler
function handleChatMessages(req, res) {
  console.log('handleChatMessages called with method:', req.method)
  console.log('Query params:', req.query)
  console.log('Body:', req.body)
  
  if (req.method === 'GET') {
    const { room = 'general', since } = req.query
    
    console.log('Getting messages for room:', room)
    console.log('Since:', since)
    
    let filteredMessages = messages.filter(msg => msg.room === room)
    
    if (since) {
      const sinceTime = new Date(since)
      filteredMessages = filteredMessages.filter(msg => new Date(msg.timestamp) > sinceTime)
    }

    console.log('Returning messages:', filteredMessages)
    console.log('Online users:', Array.from(users.values()))

    return res.status(200).json({
      success: true,
      messages: filteredMessages,
      onlineUsers: Array.from(users.values()).filter(u => u.room === room)
    })
  }

  if (req.method === 'POST') {
    const { message, room = 'general', user, type = 'message' } = req.body

    console.log('Posting message:', { message, room, user, type })

    if (!message || !user) {
      return res.status(400).json({
        success: false,
        error: 'Message and user are required'
      })
    }

    const newMessage = {
      id: Date.now().toString(),
      message,
      user,
      room,
      type,
      timestamp: new Date().toISOString()
    }

    messages.push(newMessage)
    console.log('Message added:', newMessage)

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

    console.log('Updated user status for:', userId)

    return res.status(200).json({
      success: true,
      message: newMessage
    })
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' })
}

// Chat AI handler
function handleChatAI(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { message } = req.body

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Message is required'
    })
  }

  const aiResponses = [
    "That's an interesting point! Let me help you with that.",
    "I understand what you're asking. Here's my suggestion...",
    "Based on what you've shared, I think the best approach would be...",
    "Great question! Here's how I would tackle this problem...",
    "Let me break this down for you step by step.",
    "That sounds like a common challenge. Here's what I recommend..."
  ]

  const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

  return res.status(200).json({
    success: true,
    aiResponse: randomResponse,
    timestamp: new Date().toISOString()
  })
}

// Project users handler
function handleProjectUsers(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { projectId, users } = req.body

  if (!projectId || !users || !Array.isArray(users)) {
    return res.status(400).json({
      success: false,
      error: 'Project ID and users array are required'
    })
  }

  return res.status(200).json({
    success: true,
    message: `Successfully added ${users.length} users to project`,
    projectId,
    addedUsers: users
  })
}
