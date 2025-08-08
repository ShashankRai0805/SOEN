import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

// Use environment variable or fallback based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Vercel will serve API routes from the same domain
  : 'http://localhost:3001' // Local development with your backend

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL
axios.defaults.withCredentials = true

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // You could validate token here by making a request to /auth/verify endpoint
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    try {
      // For production, use Vercel API routes
      const endpoint = process.env.NODE_ENV === 'production' 
        ? '/api/auth/login' 
        : '/users/login'
      
      const response = await axios.post(endpoint, { email, password })
      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.msg || 'Login failed' 
      }
    }
  }

  const register = async (email, password) => {
    try {
      // For production, use Vercel API routes
      const endpoint = process.env.NODE_ENV === 'production' 
        ? '/api/auth/register' 
        : '/users/register'
        
      const response = await axios.post(endpoint, { email, password })
      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.msg || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    loading,
    API_BASE_URL
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
