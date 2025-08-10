export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

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
