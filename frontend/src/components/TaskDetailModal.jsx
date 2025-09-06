import { useState, useEffect } from 'react'
import { X, Calendar, User, Flag, MessageCircle, Send, Edit, Trash2, Clock } from 'lucide-react'
import { taskService, commentService } from '../services'

const TaskDetailModal = ({ taskId, onClose, onUpdate, onDelete, projectMembers = [], isAdmin = false }) => {
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignee: '',
    dueDate: ''
  })

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails()
    }
  }, [taskId])

  const fetchTaskDetails = async () => {
    try {
      setLoading(true)
      const response = await taskService.getTaskById(taskId)
      setTask(response.task)
      setEditForm({
        title: response.task.title,
        description: response.task.description || '',
        priority: response.task.priority,
        status: response.task.status,
        assignee: response.task.assignee?._id || '',
        dueDate: response.task.dueDate ? response.task.dueDate.split('T')[0] : ''
      })
      setError('')
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to load task details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTask = async (e) => {
    e.preventDefault()
    try {
      const response = await taskService.updateTask(taskId, editForm)
      setTask(response.task)
      setIsEditing(false)
      onUpdate(taskId, response.task)
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to update task')
    }
  }

  const handleDeleteTask = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await taskService.deleteTask(taskId)
      onDelete(taskId)
      onClose()
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to delete task')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSendingComment(true)
    try {
      const response = await commentService.createComment(task.project._id, {
        body: newComment.trim()
      })
      setComments(prev => [...prev, response.comment])
      setNewComment('')
    } catch (error) {
      setError(error.response?.data?.msg || 'Failed to add comment')
    } finally {
      setSendingComment(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'urgent': return 'text-red-600 bg-red-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'text-slate-600 bg-slate-100'
      case 'in-progress': return 'text-blue-600 bg-blue-100'
      case 'review': return 'text-yellow-600 bg-yellow-100'
      case 'done': return 'text-green-600 bg-green-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAssigneeName = (assignee) => {
    return assignee ? assignee.name : 'Unassigned'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-600">Loading task details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <p className="text-red-600">Failed to load task details</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Task' : task.title}
            </h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Assignee</label>
                    <select
                      value={editForm.assignee}
                      onChange={(e) => setEditForm({ ...editForm, assignee: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {projectMembers.map((member) => (
                        <option key={member.user._id} value={member.user._id}>
                          {member.user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Task Details */
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                  <p className="text-slate-900 leading-relaxed">
                    {task.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            )}

            {/* Comments Section */}
            {!isEditing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingComment || !newComment.trim()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sendingComment ? 'Sending...' : 'Add Comment'}
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{comment.author.name}</span>
                          <span className="text-sm text-slate-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700">{comment.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Task Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Priority
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Assignee
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {getAssigneeName(task.assignee)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Due Date
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatDate(task.dueDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Created
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Created by</span>
                  <span className="text-sm font-medium text-slate-900">
                    {task.createdBy?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskDetailModal
