export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  console.log('Projects API - Method:', req.method)
  console.log('Projects API - Headers:', req.headers)
  console.log('Projects API - Body:', req.body)

  // Mock projects data for testing
  const mockProjects = [
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

  if (req.method === 'GET') {
    // Return mock projects
    return res.status(200).json({
      success: true,
      projects: mockProjects
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

    // Mock project creation
    const newProject = {
      _id: Date.now().toString(),
      name,
      description: description || '',
      createdAt: new Date().toISOString()
    }

    console.log('Created new project:', newProject)

    return res.status(201).json({
      success: true,
      project: newProject,
      message: 'Project created successfully!'
    })
  }

  return res.status(405).json({ 
    success: false,
    message: `Method ${req.method} not allowed` 
  })
}
