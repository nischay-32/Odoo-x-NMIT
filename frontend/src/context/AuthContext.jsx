import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

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

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:5000'
  axios.defaults.withCredentials = true

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/v1/auth/me')
      setUser(response.data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/v1/auth/login', {
        email,
        password
      })
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Login failed'
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/v1/auth/register', {
        name,
        email,
        password
      })
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Registration failed'
      }
    }
  }

  const logout = async () => {
    try {
      await axios.delete('/api/v1/auth/logout')
      setUser(null)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.msg || 'Logout failed'
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
