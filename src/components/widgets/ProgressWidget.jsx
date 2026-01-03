import React, { useState } from 'react'
import { GripVertical, TrendingUp, ChevronLeft, ChevronRight, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export default function ProgressWidget({ store }) {
  const [period, setPeriod] = useState('daily') // 'daily', 'weekly', 'monthly'
  const [showTasks, setShowTasks] = useState(false)
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cyclePeriod = (direction) => {
    const periods = ['daily', 'weekly', 'monthly']
    const currentIndex = periods.indexOf(period)
    let newIndex
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % periods.length
    } else {
      newIndex = (currentIndex - 1 + periods.length) % periods.length
    }
    
    setPeriod(periods[newIndex])
  }

  // Get stats and tasks for selected period
  const getStatsAndTasks = () => {
    let total = 0
    let completed = 0
    const tasks = []
    let startDate = new Date(today)
    let endDate = new Date(today)
    let label = ''

    if (period === 'daily') {
      label = 'Today'
    } else if (period === 'weekly') {
      label = 'This Week'
      // Start of week (Monday)
      const dayOfWeek = today.getDay()
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      startDate = new Date(today)
      startDate.setDate(today.getDate() + daysToMonday)
      // End of week (Sunday)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
    } else if (period === 'monthly') {
      label = 'This Month'
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    }

    for (const board of store.boards) {
      for (const list of board.lists || []) {
        for (const card of list.cards || []) {
          if (card.due_date) {
            const dueDate = new Date(card.due_date)
            dueDate.setHours(0, 0, 0, 0)
            
            if (dueDate >= startDate && dueDate <= endDate) {
              total++
              const isCompleted = card.checklist?.length > 0 && card.checklist.every(i => i.completed)
              if (isCompleted) {
                completed++
              }
              tasks.push({
                ...card,
                listName: list.name,
                boardName: board.name,
                listId: list.id,
                isCompleted,
                dueDate
              })
            }
          }
        }
      }
    }

    // Sort by due date
    tasks.sort((a, b) => a.dueDate - b.dueDate)

    return { 
      total, 
      completed, 
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      label,
      startDate,
      endDate,
      tasks
    }
  }

  const stats = getStatsAndTasks()

  const getGradientColor = () => {
    if (period === 'daily') return 'from-blue-500 to-cyan-500'
    if (period === 'weekly') return 'from-purple-500 to-pink-500'
    return 'from-green-500 to-emerald-500'
  }

  const getMotivationalMessage = () => {
    if (stats.percentage === 100 && stats.total > 0) {
      return `🎉 Perfect! All ${period} tasks completed!`
    } else if (stats.percentage >= 75) {
      return "Great progress! Almost there!"
    } else if (stats.percentage >= 50) {
      return "Keep it up! You're halfway done!"
    } else if (stats.percentage >= 25) {
      return "Good start! Keep pushing forward!"
    } else if (stats.total > 0) {
      return "Let's get those tasks done!"
    } else {
      return `No tasks scheduled for ${stats.label.toLowerCase()}`
    }
  }

  const handleToggleComplete = async (task, e) => {
    e.stopPropagation()
    // Toggle all checklist items for this card
    if (task.checklist && task.checklist.length > 0) {
      const newCompletedState = !task.isCompleted
      for (const item of task.checklist) {
        await store.toggleChecklistItem(item.id, newCompletedState)
      }
    }
  }

  const toggleTaskExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  const handleToggleSubtask = async (subtaskId, currentState, e) => {
    e.stopPropagation()
    await store.toggleChecklistItem(subtaskId, !currentState)
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900/50 rounded-xl border border-white/10 overflow-hidden">
      {/* Widget Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <button className="widget-drag-handle p-1 cursor-move touch-manipulation hidden lg:block" aria-label="Drag widget">
            <GripVertical className="w-4 h-4 text-white/40" />
          </button>
          <h3 className="font-semibold text-white text-sm">Progress</h3>
        </div>

        {/* Period Switcher */}
        <div className="flex items-center gap-2" onTouchStart={(e) => e.stopPropagation()}>
          <button
            onClick={() => cyclePeriod('prev')}
            onTouchStart={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-white/80 min-w-[60px] text-center capitalize">
            {period}
          </span>
          <button
            onClick={() => cyclePeriod('next')}
            onTouchStart={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4 no-drag">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-white/50 uppercase">{stats.label}</h4>
            <span className="text-xl font-bold text-white">{stats.percentage}%</span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${getGradientColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2">
            <span className="text-white font-medium">{stats.completed}</span> of{' '}
            <span className="text-white font-medium">{stats.total}</span> tasks completed
          </p>
        </div>

        {/* Date Range */}
        {period !== 'daily' && (
          <div className="p-2 rounded-lg bg-white/5">
            <p className="text-xs text-white/40">
              {formatDate(stats.startDate)} - {formatDate(stats.endDate)}
            </p>
          </div>
        )}

        {/* View Tasks Toggle */}
        {stats.total > 0 && (
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs font-medium transition-colors"
          >
            {showTasks ? 'Hide Tasks' : 'Show Tasks'}
          </button>
        )}

        {/* Task List */}
        {showTasks && stats.tasks.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {stats.tasks.map(task => {
              const isExpanded = expandedTaskId === task.id
              const hasSubtasks = task.checklist && task.checklist.length > 0
              const hasDescription = task.description && task.description.trim().length > 0

              return (
                <div
                  key={task.id}
                  className="rounded-lg bg-white/5 border border-white/10 overflow-hidden"
                >
                  {/* Task Header */}
                  <div
                    onClick={() => (hasSubtasks || hasDescription) && toggleTaskExpand(task.id)}
                    className={`p-2 ${hasSubtasks || hasDescription ? 'cursor-pointer hover:bg-white/10' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={(e) => handleToggleComplete(task, e)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {task.isCompleted ? (
                          <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded border-2 border-white/30 hover:border-white/60 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className={`text-xs text-white flex-1 ${task.isCompleted ? 'line-through opacity-60' : ''}`}>
                            {task.title}
                          </p>
                          {(hasSubtasks || hasDescription) && (
                            isExpanded ? (
                              <ChevronUp className="w-3 h-3 text-white/40" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-white/40" />
                            )
                          )}
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">
                          {task.boardName} / {task.listName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-blue-400">
                            Due: {formatDate(task.dueDate)}
                          </p>
                          {hasSubtasks && (
                            <p className="text-xs text-white/40">
                              {task.checklist.filter(i => i.completed).length}/{task.checklist.length} subtasks
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-2 border-t border-white/10 pt-2">
                          {/* Description */}
                          {hasDescription && (
                            <div>
                              <p className="text-xs font-semibold text-white/50 mb-1">Description</p>
                              <p className="text-xs text-white/70">{task.description}</p>
                            </div>
                          )}

                          {/* Subtasks */}
                          {hasSubtasks && (
                            <div>
                              <p className="text-xs font-semibold text-white/50 mb-1">Subtasks</p>
                              <div className="space-y-1">
                                {task.checklist.map(subtask => (
                                  <div
                                    key={subtask.id}
                                    onClick={(e) => handleToggleSubtask(subtask.id, subtask.completed, e)}
                                    className="flex items-center gap-2 p-1.5 rounded bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                                  >
                                    {subtask.completed ? (
                                      <div className="w-3.5 h-3.5 rounded bg-green-500 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    ) : (
                                      <div className="w-3.5 h-3.5 rounded border border-white/30 flex-shrink-0" />
                                    )}
                                    <span className={`text-xs text-white/80 ${subtask.completed ? 'line-through opacity-60' : ''}`}>
                                      {subtask.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}

        {/* Motivational Message */}
        {!showTasks && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/70">
                {getMotivationalMessage()}
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {!showTasks && (
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-white/5 text-center">
              <p className="text-xs text-white/40">Total</p>
              <p className="text-lg font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5 text-center">
              <p className="text-xs text-white/40">Done</p>
              <p className="text-lg font-bold text-green-400">{stats.completed}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5 text-center">
              <p className="text-xs text-white/40">Left</p>
              <p className="text-lg font-bold text-orange-400">{stats.total - stats.completed}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
