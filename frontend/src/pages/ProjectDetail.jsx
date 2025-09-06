import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Plus, Settings, Calendar, CheckCircle, Clock, AlertTriangle, MoreVertical, UserPlus, UserMinus, Crown } from 'lucide-react'
import { projectService, teamService, taskService } from '../services'
import { useAuth } from '../context/AuthContext'
import TaskBoard from '../components/TaskBoard'
import CreateTaskModal from '../components/CreateTaskModal'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [addMemberLoading, setAddMemberLoading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [createTaskLoading, setCreateTaskLoading] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await projectService.getProjectById(id)
      setProject(response.project)
      setError('')
      // For now, use mock tasks since backend doesn't have task endpoints yet
      setTasks([])
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!newMemberEmail.trim()) return

    setAddMemberLoading(true)
    try {
      await teamService.addTeamMember(id, { email: newMemberEmail.trim() })
      setNewMemberEmail('')
      setShowAddMember(false)
      await fetchProject() // Refresh project data
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to add team member')
    } finally {
      setAddMemberLoading(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      await teamService.removeTeamMember(id, userId)
      await fetchProject() // Refresh project data
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to remove team member')
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await teamService.updateMemberRole(id, userId, { role: newRole })
      await fetchProject() // Refresh project data
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to update member role')
    }
  }

  const handleCreateTask = async (taskData) => {
    setCreateTaskLoading(true)
    try {
      // For now, create mock task since backend doesn't have task endpoints yet
      const newTask = {
        _id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description,
        assignee: taskData.assignee,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        tags: taskData.tags,
        createdAt: new Date().toISOString()
      }
      setTasks(prev => [...prev, newTask])
      setShowCreateTask(false)
      setError('')
    } catch (error) {
      throw error
    } finally {
      setCreateTaskLoading(false)
    }
  }

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      // For now, update mock task since backend doesn't have task endpoints yet
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, ...taskData } : task
      ))
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      // For now, delete mock task since backend doesn't have task endpoints yet
      setTasks(prev => prev.filter(task => task._id !== taskId))
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to delete task')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'planning': return 'bg-blue-100 text-blue-800'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'member': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isOwner = project?.owner?._id === user?.id
  const isAdmin = project?.members?.find(m => m.user._id === user?.id)?.role === 'admin' || isOwner

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600">Loading project...</span>
        </div>
      </div>
    )
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Project</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{project?.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project?.status)}`}>
                    {project?.status}
                  </span>
                  <span className="text-sm text-slate-500">
                    {project?.members?.length || 0} members
                  </span>
                </div>
              </div>
            </div>
            {isAdmin && (
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Description */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-600 leading-relaxed">
                {project?.description || 'No description provided.'}
              </p>
            </div>

            {/* Tasks Section */}
            <TaskBoard
              tasks={tasks}
              onCreateTask={() => setShowCreateTask(true)}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              projectMembers={project?.members || []}
              isAdmin={isAdmin}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Created</span>
                  <span className="text-sm font-medium text-slate-900">
                    {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Owner</span>
                  <span className="text-sm font-medium text-slate-900">
                    {project?.owner?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Tasks</span>
                  <span className="text-sm font-medium text-slate-900">
                    {project?.tasks?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {project?.members?.map((member) => (
                  <div key={member.user._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {member.user.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{member.user.name}</p>
                        <p className="text-xs text-slate-500">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                        {member.user._id === project?.owner?._id && <Crown className="w-3 h-3 inline ml-1" />}
                      </span>
                      {isAdmin && member.user._id !== user?.id && member.user._id !== project?.owner?._id && (
                        <button
                          onClick={() => handleRemoveMember(member.user._id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <UserMinus className="w-3 h-3 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Member Form */}
              {showAddMember && (
                <form onSubmit={handleAddMember} className="mt-4 pt-4 border-t border-slate-200">
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={addMemberLoading}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                      >
                        {addMemberLoading ? 'Adding...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMember(false)
                          setNewMemberEmail('')
                        }}
                        className="px-3 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onSubmit={handleCreateTask}
          loading={createTaskLoading}
          projectMembers={project?.members || []}
        />
      )}
    </div>
  )
}

export default ProjectDetail
