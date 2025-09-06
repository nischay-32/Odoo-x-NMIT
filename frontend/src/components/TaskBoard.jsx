import { useState } from 'react'
import { Plus, Calendar, User, Flag, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import TaskDetailModal from './TaskDetailModal'

const TaskBoard = ({ tasks = [], onCreateTask, onUpdateTask, onDeleteTask, projectMembers = [], isAdmin = false, selectedTasks = [], onTaskSelect }) => {
  const [draggedTask, setDraggedTask] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)


  const taskColumns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-yellow-100' },
    { id: 'done', title: 'Done', color: 'bg-green-100' }
  ]

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'border-l-green-500'
      case 'medium': return 'border-l-yellow-500'
      case 'high': return 'border-l-orange-500'
      case 'urgent': return 'border-l-red-500'
      default: return 'border-l-slate-500'
    }
  }

  const getPriorityIcon = (priority) => {
    const colors = {
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    }
    return <Flag className={`w-3 h-3 ${colors[priority] || 'text-slate-500'}`} />
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e, columnId) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e, newStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (draggedTask && draggedTask.status !== newStatus) {
      onUpdateTask(draggedTask._id, { status: newStatus })
    }
    setDraggedTask(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return 'Unassigned'
    const member = projectMembers.find(m => m.user._id === assigneeId)
    return member ? member.user.name : 'Unknown'
  }

  const getAssigneeInitials = (assignee) => {
    if (!assignee) return '?'
    // Handle both populated assignee object and assignee ID
    const name = typeof assignee === 'object' ? assignee.name : 
                 projectMembers.find(m => m.user._id === assignee)?.user.name
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tasks</h2>
        {isAdmin && (
          <button
            onClick={onCreateTask}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tasks yet</h3>
          <p className="text-slate-500 dark:text-gray-400 mb-4">Create your first task to get started with project management.</p>
          {isAdmin && (
            <button
              onClick={onCreateTask}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {taskColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id)
            
            return (
              <div
                key={column.id}
                className={`${column.color} rounded-lg p-4 min-h-[200px] transition-all duration-200 ${
                  dragOverColumn === column.id ? 'ring-2 ring-blue-400 ring-opacity-50 bg-opacity-80' : ''
                } ${draggedTask && draggedTask.status !== column.id ? 'border-2 border-dashed border-blue-300' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-900 dark:text-white">{column.title}</h3>
                  <span className="text-sm text-slate-500 dark:text-gray-400 bg-white/60 dark:bg-gray-700/60 px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable={isAdmin}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          // Multi-select with Ctrl/Cmd
                          const isSelected = selectedTasks.includes(task._id)
                          onTaskSelect?.(task._id, !isSelected)
                        } else {
                          setSelectedTaskId(task._id)
                        }
                      }}
                      className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4 ${getPriorityColor(task.priority)} cursor-pointer hover:shadow-md transition-all duration-200 ${
                        isAdmin ? 'cursor-move hover:scale-105' : ''
                      } ${draggedTask && draggedTask._id === task._id ? 'opacity-50 transform rotate-2' : ''} ${
                        selectedTasks.includes(task._id) ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          {isAdmin && onTaskSelect && (
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task._id)}
                              onChange={(e) => {
                                e.stopPropagation()
                                onTaskSelect(task._id, e.target.checked)
                              }}
                              className="mt-1 w-3 h-3 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                          )}
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 flex-1">
                            {task.title}
                          </h4>
                        </div>
                        {isAdmin && (
                          <div className="relative group">
                            <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                              <MoreVertical className="w-3 h-3 text-slate-400" />
                            </button>
                            <div className="absolute right-0 top-6 bg-white border border-slate-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedTaskId(task._id)
                                }}
                                className="flex items-center gap-2 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteTask(task._id)
                                }}
                                className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">{task.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(task.priority)}
                          {task.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                        </div>

                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {getAssigneeInitials(task.assignee)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="text-xs text-slate-500 dark:text-gray-400">
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
          projectMembers={projectMembers}
          isAdmin={isAdmin}
        />
      )}
    </div>
  )
}

export default TaskBoard
