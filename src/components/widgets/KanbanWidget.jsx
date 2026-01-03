import React, { useState } from 'react'
import { GripVertical, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { Input } from '../ui/input'
import { motion, AnimatePresence } from 'framer-motion'

const formatDate = (date) => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export default function KanbanWidget({ store }) {
  const [selectedBoardId, setSelectedBoardId] = useState(store.activeBoard)
  const [expandedLists, setExpandedLists] = useState(new Set())
  const [isAddingTask, setIsAddingTask] = useState(null) // listId when adding
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const selectedBoard = store.boards.find(b => b.id === selectedBoardId) || store.boards.find(b => b.id === store.activeBoard)

  const toggleList = (listId) => {
    setExpandedLists(prev => {
      const next = new Set(prev)
      if (next.has(listId)) {
        next.delete(listId)
      } else {
        next.add(listId)
      }
      return next
    })
  }

  const handleAddTask = async (listId) => {
    if (!newTaskTitle.trim()) return
    await store.createCard(listId, newTaskTitle)
    setNewTaskTitle('')
    setIsAddingTask(null)
    // Auto-expand the list
    setExpandedLists(prev => new Set([...prev, listId]))
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900/50 rounded-xl border border-white/10 overflow-hidden">
      {/* Widget Header */}
      <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-zinc-800/50">
        <button className="widget-drag-handle p-1 cursor-move touch-manipulation hidden xl:block" aria-label="Drag widget">
          <GripVertical className="w-4 h-4 text-white/40" />
        </button>
        <h3 className="font-semibold text-white text-sm">Quick View</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 no-drag">
        {/* Board Selector */}
        <select
          value={selectedBoardId || ''}
          onChange={(e) => setSelectedBoardId(e.target.value)}
          className="w-full mb-3 px-2 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-white text-xs appearance-none cursor-pointer"
          style={{ backgroundColor: '#27272a' }}
        >
          {store.boards.map(board => (
            <option key={board.id} value={board.id} style={{ backgroundColor: '#27272a', color: 'white' }}>
              {board.name}
            </option>
          ))}
        </select>

        {selectedBoard ? (
          <div className="space-y-2">
            {selectedBoard.lists?.map(list => {
              const isExpanded = expandedLists.has(list.id)
              const cardCount = list.cards?.length || 0

              return (
                <div key={list.id} className="border border-white/10 rounded-lg overflow-hidden">
                  {/* List Header */}
                  <div 
                    onClick={() => toggleList(list.id)}
                    className="flex items-center justify-between p-2 bg-white/5 cursor-pointer hover:bg-white/10 active:bg-white/15 transition-colors touch-manipulation"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-white/60" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                      )}
                      <h4 className="text-xs font-medium text-white/90">{list.name}</h4>
                      <span className="text-xs text-white/40">({cardCount})</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsAddingTask(list.id)
                        setExpandedLists(prev => new Set([...prev, list.id]))
                      }}
                      className="p-1.5 rounded hover:bg-white/10 active:bg-white/20 text-white/60 hover:text-white transition-colors touch-manipulation"
                      title="Add task"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* List Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-2 space-y-1.5">
                          {/* Add Task Input */}
                          {isAddingTask === list.id && (
                            <div className="flex gap-1 mb-2">
                              <Input
                                placeholder="Task title..."
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask(list.id)}
                                className="flex-1 h-7 text-xs"
                                autoFocus
                              />
                              <button
                                onClick={() => handleAddTask(list.id)}
                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs transition-colors"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => {
                                  setIsAddingTask(null)
                                  setNewTaskTitle('')
                                }}
                                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          )}

                          {/* Cards */}
                          {list.cards?.map(card => (
                            <div
                              key={card.id}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              <p className="text-xs text-white truncate">{card.title}</p>
                              {card.checklist?.length > 0 && (
                                <p className="text-xs text-white/40 mt-0.5">
                                  {card.checklist.filter(i => i.completed).length}/{card.checklist.length} subtasks
                                </p>
                              )}
                              {card.due_date && (
                                <p className="text-xs text-blue-400 mt-0.5">
                                  Due: {formatDate(card.due_date)}
                                </p>
                              )}
                            </div>
                          ))}
                          
                          {cardCount === 0 && !isAddingTask && (
                            <p className="text-xs text-white/30 text-center py-2">No tasks</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-xs text-white/40">No board selected</p>
          </div>
        )}
      </div>
    </div>
  )
}
