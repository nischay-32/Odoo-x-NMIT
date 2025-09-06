import api from './api'

const teamService = {
  // Get project team members
  getProjectTeam: async (projectId) => {
    const response = await api.get(`/team/${projectId}`)
    return response.data
  },

  // Add team member by email
  addTeamMember: async (projectId, email, role = 'member') => {
    const response = await api.post(`/team/${projectId}/add`, { email, role })
    return response.data
  },

  // Remove team member
  removeTeamMember: async (projectId, userId) => {
    const response = await api.delete(`/team/${projectId}/remove/${userId}`)
    return response.data
  },

  // Update member role
  updateMemberRole: async (projectId, userId, role) => {
    const response = await api.patch(`/team/${projectId}/role/${userId}`, { role })
    return response.data
  }
}

export default teamService
