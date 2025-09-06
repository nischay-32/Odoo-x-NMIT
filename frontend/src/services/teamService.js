import api from './api'

const teamService = {
  // Get project team members
  getProjectTeam: async (projectId) => {
    const response = await api.get(`/teams/${projectId}/members`)
    return response.data
  },

  // Add team member by email
  addTeamMember: async (projectId, memberData) => {
    const response = await api.post(`/teams/${projectId}/members`, memberData)
    return response.data
  },

  // Remove team member
  removeTeamMember: async (projectId, memberId) => {
    const response = await api.delete(`/teams/${projectId}/members/${memberId}`)
    return response.data
  },

  // Update member role
  updateMemberRole: async (projectId, memberId, roleData) => {
    const response = await api.patch(`/teams/${projectId}/members/${memberId}/role`, roleData)
    return response.data
  }
}

export default teamService
