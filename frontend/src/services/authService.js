import api from './api'

const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // Register user
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  },

  // Logout user
  logout: async () => {
    const response = await api.delete('/auth/logout')
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.patch('/auth/updateUser', userData)
    return response.data
  },

  // Update password
  updatePassword: async (oldPassword, newPassword) => {
    const response = await api.patch('/auth/updateUserPassword', {
      oldPassword,
      newPassword
    })
    return response.data
  }
}

export default authService
