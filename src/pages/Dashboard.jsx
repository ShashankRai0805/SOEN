import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [userLoading, setUserLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      // Use different endpoints for production vs development
      const endpoint = process.env.NODE_ENV === 'production' 
        ? '/api/projects' 
        : '/projects/all'
      
      const response = await axios.get(endpoint)
      setProjects(response.data.projects || [])
    } catch (error) {
      setError('Failed to fetch projects')
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    setCreateLoading(true)
    try {
      // Use different endpoints for production vs development
      const endpoint = process.env.NODE_ENV === 'production' 
        ? '/api/projects' 
        : '/projects/create'
      
      const response = await axios.post(endpoint, {
        name: newProjectName.trim()
      })
      
      setProjects([...projects, response.data.project])
      setNewProjectName('')
      setShowCreateProject(false)
    } catch (error) {
      setError('Failed to create project')
      console.error('Error creating project:', error)
    } finally {
      setCreateLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      // Use different endpoints for production vs development
      const endpoint = process.env.NODE_ENV === 'production' 
        ? '/api/users/all' 
        : '/users/all'
      
      const response = await axios.get(endpoint)
      setAllUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const openUserModal = (project) => {
    setSelectedProject(project)
    setShowUserModal(true)
    fetchUsers()
  }

  const closeUserModal = () => {
    setShowUserModal(false)
    setSelectedProject(null)
    setSelectedUsers([])
  }

  const addUsersToProject = async () => {
    if (!selectedProject || selectedUsers.length === 0) return

    setUserLoading(true)
    try {
      // Use different endpoints for production vs development
      const endpoint = process.env.NODE_ENV === 'production' 
        ? '/api/projects/add-users' 
        : '/projects/add-user'
      
      await axios.put(endpoint, {
        projectId: selectedProject._id,
        users: selectedUsers
      })
      
      // Refresh projects
      fetchProjects()
      closeUserModal()
    } catch (error) {
      setError('Failed to add users to project')
      console.error('Error adding users:', error)
    } finally {
      setUserLoading(false)
    }
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-black sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your projects and start chatting
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setShowCreateProject(!showCreateProject)}
            className="btn-primary"
          >
            Create Project
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {showCreateProject && (
        <div className="mt-6 card p-6">
          <form onSubmit={createProject} className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-black">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                required
                className="mt-1 input-primary w-full"
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={createLoading}
                className="btn-primary"
              >
                {createLoading ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateProject(false)
                  setNewProjectName('')
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg leading-6 font-medium text-black mb-4">
          Your Projects ({projects.length})
        </h3>
        
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects yet. Create your first project to get started.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project._id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-black capitalize">
                    {project.name}
                  </h4>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Users: {project.users?.length || 0}
                </p>
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/chat?project=${project._id}`}
                    className="btn-primary text-sm"
                  >
                    Open Chat
                  </Link>
                  <button
                    onClick={() => openUserModal(project)}
                    className="btn-secondary text-sm"
                  >
                    Add Users
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Link to="/chat" className="card p-6 hover:shadow-md transition-shadow block">
          <h3 className="text-lg font-medium text-black">💬 Start Chatting</h3>
          <p className="mt-2 text-sm text-gray-500">
            Join conversations and collaborate with your team
          </p>
        </Link>
        
        <Link to="/ai" className="card p-6 hover:shadow-md transition-shadow block">
          <h3 className="text-lg font-medium text-black">🤖 AI Assistant</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get help from our AI assistant powered by Gemini
          </p>
        </Link>
      </div>

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-black">
                Add Users to {selectedProject?.name}
              </h3>
              <button
                onClick={closeUserModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {userLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allUsers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No users available to add
                  </p>
                ) : (
                  <>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {allUsers
                        .filter(user => !selectedProject?.users?.includes(user._id))
                        .map(user => (
                          <div key={user._id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={`user-${user._id}`}
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => toggleUserSelection(user._id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`user-${user._id}`}
                              className="text-sm text-gray-700 cursor-pointer flex-1"
                            >
                              {user.email}
                            </label>
                          </div>
                        ))
                      }
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                      <button
                        onClick={closeUserModal}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addUsersToProject}
                        disabled={selectedUsers.length === 0}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Users ({selectedUsers.length})
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
