export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    })
  }

  const { message } = req.body

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Message is required'
    })
  }

  // Mock AI response for now
  const aiResponses = [
    "That's an interesting point! Let me help you with that.",
    "I understand what you're asking. Here's my suggestion...",
    "Based on what you've shared, I think the best approach would be...",
    "Great question! Here's how I would tackle this problem...",
    "Let me break this down for you step by step.",
    "That sounds like a common challenge. Here's what I recommend..."
  ]

  const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

  // Simulate AI processing time
  setTimeout(() => {
    return res.status(200).json({
      success: true,
      aiResponse: randomResponse,
      timestamp: new Date().toISOString()
    })
  }, 1000)
}
