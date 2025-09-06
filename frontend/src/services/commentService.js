import api from './api'

const commentService = {
  // Get comments for a specific project
  getProjectComments: async (projectId) => {
    const response = await api.get(`/comments/projects/${projectId}/comments`)
    return response.data
  },

  // Create a new comment
  createComment: async (projectId, commentData) => {
    const response = await api.post(`/comments/projects/${projectId}/comments`, {
      body: commentData.body,
      parentComment: commentData.parentComment || null
    })
    return response.data
  },

  // Get comment by ID
  getCommentById: async (commentId) => {
    const response = await api.get(`/comments/comments/${commentId}`)
    return response.data
  },

  // Update a comment
  updateComment: async (commentId, commentData) => {
    const response = await api.patch(`/comments/comments/${commentId}`, {
      body: commentData.body
    })
    return response.data
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/comments/${commentId}`)
    return response.data
  },

  // Get replies for a comment
  getCommentReplies: async (commentId) => {
    const response = await api.get(`/comments/comments/${commentId}/replies`)
    return response.data
  }
}

export default commentService
