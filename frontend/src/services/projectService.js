import api from './api'

const projectService = {
  // Get all projects with pagination and filters
  getProjects: async (params = {}) => {
    const { page = 1, limit = 10, search, status } = params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status })
    })
    
    const response = await api.get(`/projects?${queryParams}`)
    return response.data
  },

  // Get single project by ID
  getProjectById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`)
    return response.data
  },

  // Create new project
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData)
    return response.data
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    const response = await api.patch(`/projects/${projectId}`, projectData)
    return response.data
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`)
    return response.data
  },

  // Add member to project
  addMember: async (projectId, userId) => {
    const response = await api.post(`/projects/${projectId}/members`, { userId })
    return response.data
  },

  // Remove member from project
  removeMember: async (projectId, memberId) => {
    const response = await api.delete(`/projects/${projectId}/members/${memberId}`)
    return response.data
  }
}

export default projectService
