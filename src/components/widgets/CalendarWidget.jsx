import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, GripVertical, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '../ui/input'

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Custom Calendar Component
function CustomCalendar({ value, onChange, tileContent }) {
  const [viewDate, setViewDate] = useState(value || new Date())

  // Monday first
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December']

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    // Get day of week (0=Sunday, 1=Monday, etc)
    // Convert to Monday-first (0=Monday, 6=Sunday)
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  const generateCalendarDays = () => {
    const days = []
    const daysInMonth = getDaysInMonth(viewDate)
    const firstDay = getFirstDayOfMonth(viewDate)
    
    // Previous month days
    const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
    const daysInPrevMonth = getDaysInMonth(prevMonth)
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      days.push({
        day,
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day),
        isCurrentMonth: false
      })
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        date: new Date(viewDate.getFullYear(), viewDate.getMonth(), day),
        isCurrentMonth: true
      })
    }
    
    // Next month days
    const remainingDays = 42 - days.length // 6 rows * 7 days
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day),
        isCurrentMonth: false
      })
    }
    
    return days
  }

  const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date) => {
    return date.getDate() === value.getDate() &&
           date.getMonth() === value.getMonth() &&
           date.getFullYear() === value.getFullYear()
  }

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const days = generateCalendarDays()

  return (
    <div className="w-full">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white transition-colors touch-manipulation"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-white font-semibold text-sm">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white transition-colors touch-manipulation"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs text-white/50 font-medium py-0.5">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((item, index) => (
          <button
            key={index}
            onClick={() => onChange(item.date)}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onChange(item.date)
            }}
            className={`
              aspect-square p-0.5 rounded text-xs flex flex-col items-center justify-center
              transition-colors relative touch-manipulation cursor-pointer
              ${item.isCurrentMonth ? 'text-white' : 'text-white/30'}
              ${isSelected(item.date) ? 'bg-blue-500 text-white' : 'hover:bg-white/10 active:bg-white/20'}
              ${isToday(item.date) && !isSelected(item.date) ? 'bg-white/10' : ''}
            `}
          >
            <span>{item.day}</span>
            {tileContent && tileContent({ date: item.date, view: 'month' })}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function CalendarWidget({ store }) {
  const [view, setView] = useState('month') // 'month', 'week', 'day'
  const [date, setDate] = useState(new Date())
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedBoardId, setSelectedBoardId] = useState('')
  const [selectedListId, setSelectedListId] = useState('')
  const [pendingSubtasks, setPendingSubtasks] = useState([])
  const [newSubtaskText, setNewSubtaskText] = useState('')

  // Get all cards with due dates
  const getCardsForDate = (checkDate) => {
    const cards = []
    for (const board of store.boards) {
      for (const list of board.lists || []) {
        for (const card of list.cards || []) {
          if (card.due_date) {
            const dueDate = new Date(card.due_date)
            if (
              dueDate.getDate() === checkDate.getDate() &&
              dueDate.getMonth() === checkDate.getMonth() &&
              dueDate.getFullYear() === checkDate.getFullYear()
            ) {
              cards.push({ ...card, listName: list.name, boardName: board.name, listId: list.id })
            }
          }
        }
      }
    }
    return cards
  }

  // Get cards for a date range (for weekly view)
  const getCardsForWeek = (startDate) => {
    const cards = []
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)

    for (const board of store.boards) {
      for (const list of board.lists || []) {
        for (const card of list.cards || []) {
          if (card.due_date) {
            const dueDate = new Date(card.due_date)
            if (dueDate >= startDate && dueDate <= endDate) {
              cards.push({ 
                ...card, 
                listName: list.name, 
                boardName: board.name, 
                listId: list.id,
                dueDate: dueDate 
              })
            }
          }
        }
      }
    }
    return cards.sort((a, b) => a.dueDate - b.dueDate)
  }

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const cards = getCardsForDate(date)
      if (cards.length > 0) {
        return (
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-0.5"></div>
        )
      }
    }
    return null
  }

  const cycleView = (direction) => {
    const views = ['day', 'week', 'month']
    const currentIndex = views.indexOf(view)
    let newIndex
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % views.length
    } else {
      newIndex = (currentIndex - 1 + views.length) % views.length
    }
    
    setView(views[newIndex])
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedListId) return
    
    // Format date as YYYY-MM-DD for SQL DATE type
    const formattedDate = date.toISOString().split('T')[0]
    const newCard = await store.createCard(selectedListId, newTaskTitle, '', formattedDate)
    
    // Add subtasks if any
    if (newCard && pendingSubtasks.length > 0) {
      for (const subtask of pendingSubtasks) {
        await store.addChecklistItem(newCard.id, subtask.text)
      }
    }
    
    setNewTaskTitle('')
    setPendingSubtasks([])
    setNewSubtaskText('')
    setIsAddingTask(false)
  }

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return
    setPendingSubtasks([...pendingSubtasks, { id: Date.now(), text: newSubtaskText, completed: false }])
    setNewSubtaskText('')
  }

  const removeSubtask = (id) => {
    setPendingSubtasks(pendingSubtasks.filter(s => s.id !== id))
  }

  // Initialize board/list selection when opening add form
  const openAddTask = () => {
    setIsAddingTask(true)
    if (store.boards.length > 0) {
      const firstBoard = store.boards[0]
      setSelectedBoardId(firstBoard.id)
      if (firstBoard.lists?.length > 0) {
        setSelectedListId(firstBoard.lists[0].id)
      }
    }
  }

  const selectedBoard = store.boards.find(b => b.id === selectedBoardId)

  const renderDailyView = () => {
    const todayCards = getCardsForDate(date)
    return (
      <div className="space-y-3">
        <div className="text-center py-4 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">
            {date.toLocaleDateString('en-US', { weekday: 'long' })}
          </h3>
          <p className="text-sm text-white/40">
            {formatDate(date)}
          </p>
        </div>
        
        {todayCards.length > 0 ? (
          <div className="space-y-2">
            {todayCards.map(card => (
              <div key={card.id} className="p-2 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-white font-medium">{card.title}</p>
                <p className="text-xs text-white/40 mt-1">
                  {card.boardName} / {card.listName}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-white/40 text-sm">No tasks for today</p>
          </div>
        )}
      </div>
    )
  }

  const renderWeeklyView = () => {
    // Start of week (Monday)
    const startOfWeek = new Date(date)
    const dayOfWeek = date.getDay()
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startOfWeek.setDate(date.getDate() + daysToMonday)
    const weekCards = getCardsForWeek(startOfWeek)
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })

    return (
      <div className="space-y-2">
        {days.map(day => {
          const dayCards = weekCards.filter(c => 
            c.dueDate.getDate() === day.getDate() &&
            c.dueDate.getMonth() === day.getMonth()
          )
          
          return (
            <div key={day.toISOString()} className="border-b border-white/10 pb-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-white/70">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })} {formatDate(day)}
                </h4>
                {dayCards.length > 0 && (
                  <span className="text-xs text-blue-400">{dayCards.length}</span>
                )}
              </div>
              {dayCards.map(card => (
                <div key={card.id} className="p-1.5 rounded bg-white/5 mb-1">
                  <p className="text-xs text-white truncate">{card.title}</p>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900/50 rounded-xl border border-white/10 overflow-hidden">
      {/* Widget Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <button className="widget-drag-handle p-1 cursor-move touch-manipulation hidden xl:block" aria-label="Drag widget">
            <GripVertical className="w-4 h-4 text-white/40" />
          </button>
          <h3 className="font-semibold text-white text-sm">Calendar</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add Task Button */}
          <button
            onClick={openAddTask}
            className="p-2 rounded hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white transition-colors touch-manipulation"
            title="Add task"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* View Switcher */}
          <button
            onClick={() => cycleView('prev')}
            className="p-2 rounded hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white transition-colors touch-manipulation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-white/80 min-w-[60px] text-center capitalize">
            {view}
          </span>
          <button
            onClick={() => cycleView('next')}
            className="p-2 rounded hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white transition-colors touch-manipulation"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto p-3 no-drag">
        {/* Add Task Form */}
        <AnimatePresence>
          {isAddingTask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white/70">Add Task</h4>
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <Input
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  className="h-8 text-xs"
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedBoardId}
                    onChange={(e) => {
                      setSelectedBoardId(e.target.value)
                      const board = store.boards.find(b => b.id === e.target.value)
                      if (board?.lists?.length > 0) {
                        setSelectedListId(board.lists[0].id)
                      }
                    }}
                    className="px-2 py-1 bg-zinc-800 border border-white/10 rounded text-white text-xs"
                    style={{ backgroundColor: '#27272a' }}
                  >
                    {store.boards.map(board => (
                      <option key={board.id} value={board.id} style={{ backgroundColor: '#27272a', color: 'white' }}>{board.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="px-2 py-1 bg-zinc-800 border border-white/10 rounded text-white text-xs"
                    style={{ backgroundColor: '#27272a' }}
                  >
                    {selectedBoard?.lists?.map(list => (
                      <option key={list.id} value={list.id} style={{ backgroundColor: '#27272a', color: 'white' }}>{list.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subtasks Section */}
                {pendingSubtasks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white/70">Subtasks:</p>
                    {pendingSubtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2 p-1.5 bg-white/5 rounded">
                        <span className="text-xs text-white flex-1">{subtask.text}</span>
                        <button
                          onClick={() => removeSubtask(subtask.id)}
                          className="p-0.5 rounded text-white/40 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Subtask Input */}
                <div className="flex gap-1">
                  <Input
                    placeholder="Add subtask..."
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                    className="flex-1 h-7 text-xs"
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors"
                  >
                    +
                  </button>
                </div>

                <p className="text-xs text-white/40">
                  Due: {formatDate(date)}
                </p>

                <button
                  onClick={handleAddTask}
                  className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs font-medium transition-colors"
                >
                  Add Task
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {view === 'day' ? (
          renderDailyView()
        ) : view === 'week' ? (
          renderWeeklyView()
        ) : (
          <CustomCalendar
            value={date}
            onChange={setDate}
            tileContent={tileContent}
          />
        )}
      </div>
    </div>
  )
}
