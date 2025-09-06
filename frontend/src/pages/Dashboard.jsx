import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Plus, Users, Calendar, CheckCircle, Clock, AlertCircle, LogOut, Search } from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/v1/projects')
      setProjects(response.data.projects || [])
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

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProjectStats = (project) => {
    const totalTasks = project.tasks?.length || 0
    const completedTasks = project.tasks?.filter(task => task.status === 'done').length || 0
    const inProgressTasks = project.tasks?.filter(task => task.status === 'in-progress').length || 0
    const todoTasks = project.tasks?.filter(task => task.status === 'todo').length || 0
    
    return { totalTasks, completedTasks, inProgressTasks, todoTasks }
  }

  const getProgressPercentage = (project) => {
    const { totalTasks, completedTasks } = getProjectStats(project)
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
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
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 w-full sm:w-64"
              />
            </div>
            <button className="btn btn-primary">
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0 
                ? 'Create your first project to start collaborating with your team'
                : 'Try adjusting your search terms'
              }
            </p>
            {projects.length === 0 && (
              <button className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const { totalTasks, completedTasks, inProgressTasks, todoTasks } = getProjectStats(project)
              const progressPercentage = getProgressPercentage(project)
              
              return (
                <div key={project._id} className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        {project.teamMembers?.length || 0}
                      </div>
                    </div>
                    
                    {project.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Task Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{todoTasks}</div>
                        <div className="text-xs text-gray-500">To Do</div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="flex items-center justify-center mb-1">
                          <AlertCircle className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{inProgressTasks}</div>
                        <div className="text-xs text-gray-500">In Progress</div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-2">
                        <div className="flex items-center justify-center mb-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{completedTasks}</div>
                        <div className="text-xs text-gray-500">Done</div>
                      </div>
                    </div>
                    
                    {/* Project Footer */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Project →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
