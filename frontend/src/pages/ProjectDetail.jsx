import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Plus, Settings, Calendar, CheckCircle, Clock, AlertTriangle, MoreVertical, UserPlus, UserMinus, Crown } from 'lucide-react'
import { projectService, teamService, taskService } from '../services'
import { useAuth } from '../context/AuthContext'
import TaskBoard from '../components/TaskBoard'
import CreateTaskModal from '../components/CreateTaskModal'
import ProjectSettingsModal from '../components/ProjectSettingsModal'

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
  const [selectedTasks, setSelectedTasks] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [taskFilter, setTaskFilter] = useState('all')
  const [taskSearch, setTaskSearch] = useState('')
  const [showProjectSettings, setShowProjectSettings] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [showBulkMemberActions, setShowBulkMemberActions] = useState(false)
  const [newMemberRole, setNewMemberRole] = useState('member')

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const [projectResponse, tasksResponse] = await Promise.all([
        projectService.getProjectById(id),
        taskService.getProjectTasks(id)
      ])
      setProject(projectResponse.project)
      setTasks(tasksResponse.tasks || [])
      setError('')
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
      await teamService.addTeamMember(id, { 
        email: newMemberEmail.trim(),
        role: newMemberRole 
      })
      setNewMemberEmail('')
      setShowAddMember(false)
      await fetchProject() // Refresh project data
      setError('') // Clear any previous errors
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to add team member')
    } finally {
      setAddMemberLoading(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      await teamService.removeTeamMember(id, memberId)
      await fetchProject() // Refresh project data
      setError('') // Clear any previous errors
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to remove team member')
    }
  }

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await teamService.updateMemberRole(id, memberId, { role: newRole })
      await fetchProject() // Refresh project data
      setEditingMember(null)
      setError('') // Clear any previous errors
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to update member role')
    }
  }

  const handleBulkDeleteTasks = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) return
    
    try {
      await Promise.all(selectedTasks.map(taskId => taskService.deleteTask(taskId)))
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task._id)))
      setSelectedTasks([])
      setShowBulkActions(false)
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to delete tasks')
    }
  }

  const handleBulkAssignTasks = async (assigneeId) => {
    try {
      await Promise.all(selectedTasks.map(taskId => 
        taskService.updateTask(taskId, { assignee: assigneeId })
      ))
      setTasks(prev => prev.map(task => 
        selectedTasks.includes(task._id) ? { ...task, assignee: assigneeId } : task
      ))
      setSelectedTasks([])
      setShowBulkActions(false)
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to assign tasks')
    }
  }

  const handleBulkUpdateStatus = async (status) => {
    try {
      await Promise.all(selectedTasks.map(taskId => 
        taskService.updateTask(taskId, { status })
      ))
      setTasks(prev => prev.map(task => 
        selectedTasks.includes(task._id) ? { ...task, status } : task
      ))
      setSelectedTasks([])
      setShowBulkActions(false)
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to update task status')
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = taskFilter === 'all' || task.status === taskFilter
    const matchesSearch = !taskSearch || 
      task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      task.description?.toLowerCase().includes(taskSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleProjectUpdate = async (projectData) => {
    try {
      await projectService.updateProject(id, projectData)
      await fetchProject()
      setShowProjectSettings(false)
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to update project')
    }
  }

  const handleProjectDelete = async (projectId) => {
    try {
      await projectService.deleteProject(projectId)
      navigate('/dashboard')
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to delete project')
      throw error
    }
  }

  const handleCreateTask = async (taskData) => {
    setCreateTaskLoading(true)
    try {
      const response = await taskService.createTask(id, taskData)
      setTasks(prev => [...prev, response.task])
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
      const response = await taskService.updateTask(taskId, taskData)
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.task : task
      ))
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await taskService.deleteTask(taskId)
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

  const isOwner = project?.owner?._id === user?.userId
  const isAdmin = project?.members?.find(m => m.user._id === user?.userId)?.role === 'admin' || isOwner

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
              <button 
                onClick={() => setShowProjectSettings(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
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

            {/* Task Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Tasks</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  {selectedTasks.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Bulk Actions ({selectedTasks.length})
                      </button>
                      <button
                        onClick={() => setSelectedTasks([])}
                        className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setShowCreateTask(true)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add Task
                    </button>
                  )}
                </div>
              </div>
              
              {/* Bulk Actions Panel */}
              {showBulkActions && selectedTasks.length > 0 && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-medium text-slate-900 mb-3">Bulk Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleBulkDeleteTasks}
                      className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Delete Selected
                    </button>
                    <select
                      onChange={(e) => e.target.value && handleBulkUpdateStatus(e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
                      defaultValue=""
                    >
                      <option value="">Change Status...</option>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                    <select
                      onChange={(e) => e.target.value && handleBulkAssignTasks(e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded-lg text-sm"
                      defaultValue=""
                    >
                      <option value="">Assign to...</option>
                      <option value="">Unassigned</option>
                      {project?.members?.map((member) => (
                        <option key={member.user._id} value={member.user._id}>
                          {member.user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <TaskBoard
              tasks={filteredTasks}
              onCreateTask={() => setShowCreateTask(true)}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              projectMembers={project?.members || []}
              isAdmin={isAdmin}
              selectedTasks={selectedTasks}
              onTaskSelect={(taskId, selected) => {
                if (selected) {
                  setSelectedTasks(prev => [...prev, taskId])
                } else {
                  setSelectedTasks(prev => prev.filter(id => id !== taskId))
                }
              }}
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
                {project?.members?.filter(member => 
                  !memberSearch || 
                  member.user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                  member.user.email.toLowerCase().includes(memberSearch.toLowerCase())
                ).map((member) => (
                  <div key={member.user._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isAdmin && project?.members?.length > 1 && (
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers(prev => [...prev, member.user._id])
                            } else {
                              setSelectedMembers(prev => prev.filter(id => id !== member.user._id))
                            }
                          }}
                          className="w-3 h-3 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                      )}
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
                      {editingMember === member.user._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.user._id, e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => setEditingMember(null)}
                            className="text-xs text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => isAdmin && member.user._id !== project?.owner?._id && setEditingMember(member.user._id)}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)} ${
                              isAdmin && member.user._id !== project?.owner?._id ? 'hover:opacity-80 cursor-pointer' : ''
                            }`}
                          >
                            {member.role}
                            {member.user._id === project?.owner?._id && <Crown className="w-3 h-3 inline ml-1" />}
                          </button>
                          {isAdmin && member.user._id !== user?.userId && member.user._id !== project?.owner?._id && (
                            <button
                              onClick={() => handleRemoveMember(member.user._id)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                              title="Remove member"
                            >
                              <UserMinus className="w-3 h-3 text-red-500" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Member Search and Bulk Actions */}
              {project?.members?.length > 3 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                  />
                  {selectedMembers.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setShowBulkMemberActions(!showBulkMemberActions)}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Bulk Actions ({selectedMembers.length})
                      </button>
                      <button
                        onClick={() => setSelectedMembers([])}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  {showBulkMemberActions && selectedMembers.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-3">
                      <h5 className="text-xs font-medium text-slate-900 mb-2">Bulk Member Actions</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${selectedMembers.length} members?`)) {
                              selectedMembers.forEach(memberId => handleRemoveMember(memberId))
                              setSelectedMembers([])
                              setShowBulkMemberActions(false)
                            }
                          }}
                          className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                        >
                          Remove Selected
                        </button>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              selectedMembers.forEach(memberId => handleUpdateRole(memberId, e.target.value))
                              setSelectedMembers([])
                              setShowBulkMemberActions(false)
                            }
                          }}
                          className="px-2 py-1 border border-slate-300 rounded text-xs"
                          defaultValue=""
                        >
                          <option value="">Change Role...</option>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={addMemberLoading}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                      >
                        {addMemberLoading ? 'Adding...' : 'Add Member'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMember(false)
                          setNewMemberEmail('')
                          setNewMemberRole('member')
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

      {/* Project Settings Modal */}
      {showProjectSettings && (
        <ProjectSettingsModal
          project={project}
          onClose={() => setShowProjectSettings(false)}
          onUpdate={handleProjectUpdate}
          onDelete={isOwner ? handleProjectDelete : null}
        />
      )}
    </div>
  )
}

export default ProjectDetail
