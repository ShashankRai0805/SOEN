const projects = [
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

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

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
