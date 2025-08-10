export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false,
      message: `Method ${req.method} not allowed` 
    })
  }

  console.log('Add Users API - Body:', req.body)

  const { projectId, users } = req.body

  if (!projectId || !users || !Array.isArray(users)) {
    return res.status(400).json({
      success: false,
      error: 'Project ID and users array are required'
    })
  }

  // Mock successful user addition
  console.log(`Adding users ${users.join(', ')} to project ${projectId}`)

  return res.status(200).json({
    success: true,
    message: `Successfully added ${users.length} users to project`,
    projectId,
    addedUsers: users
  })
}
