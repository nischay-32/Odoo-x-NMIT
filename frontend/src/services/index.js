// Export all services from a single entry point
import api from './api'
import authService from './authService'
import projectService from './projectService'
import teamService from './teamService'
import taskService from './taskService'
import commentService from './commentService'

export {
  api,
  authService,
  projectService,
  teamService,
  taskService,
  commentService
}
