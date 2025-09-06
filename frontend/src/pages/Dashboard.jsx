import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plus, Users, Calendar, CheckCircle, Clock, AlertCircle, LogOut, Search, X } from 'lucide-react'
import { projectService } from '../services'
import CreateProjectModal from '../components/CreateProjectModal'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10
  })

  useEffect(() => {
    fetchProjects()
  }, [searchTerm])

  const fetchProjects = async (page = 1) => {
    try {
      setLoading(true)
      const response = await projectService.getProjects({
        page,
        limit: 12,
        search: searchTerm || undefined
      })
      setProjects(response.projects || [])
      setPagination(response.pagination || {})
    } catch (error) {
      setError('Failed to fetch projects')
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleCreateProject = async (projectData) => {
    setCreateLoading(true)
    try {
      const response = await projectService.createProject(projectData)
      setProjects(prev => [response.project, ...prev])
      setShowCreateModal(false)
      setError('') // Clear any previous errors
    } catch (error) {
      throw error // Re-throw to let the modal handle the error display
    } finally {
      setCreateLoading(false)
    }
  }

  const getProjectStats = (project) => {
    const totalTasks = project.tasks?.length || 0
    const completedTasks = project.tasks?.filter(task => task.status === 'done').length || 0
    const inProgressTasks = project.tasks?.filter(task => task.status === 'in-progress').length || 0
    const todoTasks = project.tasks?.filter(task => task.status === 'todo').length || 0
    
    return { totalTasks, completedTasks, inProgressTasks, todoTasks }
  }

  const getProgressPercentage = (project) => {
    const { totalTasks, completedTasks } = getProjectStats(project)
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.progress || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SynergySphere</span>
              </div>
              <div className="hidden md:block text-gray-400">|</div>
              <h1 className="hidden md:block text-lg font-medium text-gray-700">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Create Project */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <p className="text-gray-600 mt-1">Manage and track your team's work</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first project to start collaborating with your team'
              }
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const { totalTasks, completedTasks, inProgressTasks, todoTasks } = getProjectStats(project)
              const progressPercentage = getProgressPercentage(project)
              const memberCount = project.members?.length || 0
              
              return (
                <div 
                  key={project._id} 
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900 truncate pr-2">
                      {project.name}
                    </h3>
                    <div className="flex items-center text-sm text-slate-500 gap-1">
                      <Users className="w-4 h-4" />
                      <span>{memberCount}</span>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Progress</span>
                      <span className="text-sm text-slate-500">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <Clock className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                      <div className="text-sm font-medium text-slate-900">{todoTasks}</div>
                      <div className="text-xs text-slate-500">To Do</div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <AlertCircle className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                      <div className="text-sm font-medium text-slate-900">{inProgressTasks}</div>
                      <div className="text-xs text-slate-500">In Progress</div>
                    </div>
                    
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                      <div className="text-sm font-medium text-slate-900">{completedTasks}</div>
                      <div className="text-xs text-slate-500">Done</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-500 gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Project →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateProject}
            loading={createLoading}
          />
        )}
      </main>
    </div>
  )
}

export default Dashboard
