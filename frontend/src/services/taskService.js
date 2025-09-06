import api from './api'

const taskService = {
  // Get tasks for a specific project
  getProjectTasks: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/tasks`)
    return response.data
  },

  // Create a new task
  createTask: async (projectId, taskData) => {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData)
    return response.data
  },

  // Update a task
  updateTask: async (projectId, taskId, taskData) => {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData)
    return response.data
  },

  // Delete a task
  deleteTask: async (projectId, taskId) => {
    const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`)
    return response.data
  },

  // Update task status
  updateTaskStatus: async (projectId, taskId, status) => {
    const response = await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status })
    return response.data
  },

  // Assign task to user
  assignTask: async (projectId, taskId, assigneeId) => {
    const response = await api.patch(`/projects/${projectId}/tasks/${taskId}/assign`, { assignee: assigneeId })
    return response.data
  },

  // Add comment to task
  addTaskComment: async (projectId, taskId, comment) => {
    const response = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { text: comment })
    return response.data
  },

  // Get task by ID
  getTaskById: async (projectId, taskId) => {
    const response = await api.get(`/projects/${projectId}/tasks/${taskId}`)
    return response.data
  }
}

export default taskService
