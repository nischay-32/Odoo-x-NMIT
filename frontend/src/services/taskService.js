import api from './api'

const taskService = {
  // Get tasks for a specific project
  getProjectTasks: async (projectId, filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.assignee) params.append('assignee', filters.assignee)
    
    const queryString = params.toString()
    const url = `/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get(url)
    return response.data
  },

  // Create a new task
  createTask: async (projectId, taskData) => {
    const response = await api.post(`/projects/${projectId}/tasks`, {
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      assignee: taskData.assignee || null
    })
    return response.data
  },

  // Get task by ID
  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    const response = await api.patch(`/tasks/${taskId}`, taskData)
    return response.data
  },

  // Delete a task
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data
  },

  // Update task status (convenience method)
  updateTaskStatus: async (taskId, status) => {
    const response = await api.patch(`/tasks/${taskId}`, { status })
    return response.data
  },

  // Assign task to user (convenience method)
  assignTask: async (taskId, assigneeId) => {
    const response = await api.patch(`/tasks/${taskId}`, { assignee: assigneeId })
    return response.data
  }
}

export default taskService
