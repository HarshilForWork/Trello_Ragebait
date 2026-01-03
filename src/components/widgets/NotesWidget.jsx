import React, { useState } from 'react'
import { GripVertical, Plus, X, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input, Textarea } from '../ui/input'

export default function NotesWidget({ store }) {
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [expandedNoteId, setExpandedNoteId] = useState(null)

  const handleAddNote = async () => {
    if (!newNoteTitle.trim()) return
    await store.createNote(newNoteTitle, newNoteContent)
    setNewNoteTitle('')
    setNewNoteContent('')
    setIsAdding(false)
  }

  const toggleNote = (noteId) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId)
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900/50 rounded-xl border border-white/10 overflow-hidden">
      {/* Widget Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <button className="widget-drag-handle p-1 cursor-move touch-manipulation hidden xl:block" aria-label="Drag widget">
            <GripVertical className="w-4 h-4 text-white/40" />
          </button>
          <h3 className="font-semibold text-white text-sm">Quick Notes</h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          onTouchStart={(e) => e.stopPropagation()}
          className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-2 no-drag">
        {/* Add Note Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mb-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <Input
                  placeholder="Note title..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="text-sm font-medium"
                  autoFocus
                />
                <Textarea
                  placeholder="Note description (optional)..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddNote}
                    className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-xs font-medium transition-colors"
                  >
                    Save Note
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false)
                      setNewNoteTitle('')
                      setNewNoteContent('')
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes List */}
        {store.notes.length > 0 ? (
          <div className="space-y-2">
            {store.notes.map(note => {
              const isExpanded = expandedNoteId === note.id
              const hasContent = note.content && note.content.trim().length > 0
              const contentPreview = hasContent ? note.content.slice(0, 80) : ''
              const needsTruncation = hasContent && note.content.length > 80

              return (
                <motion.div
                  key={note.id}
                  className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors overflow-hidden group"
                  whileHover={{ x: 2 }}
                >
                  <div className="p-2.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white/90 flex-1">
                        {note.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          store.deleteNote(note.id)
                        }}
                        className="p-1 rounded text-white/40 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {hasContent && (
                      <div>
                        <p className={`text-xs text-white/70 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {isExpanded ? note.content : contentPreview}
                          {!isExpanded && needsTruncation && '...'}
                        </p>
                        {needsTruncation && (
                          <button
                            onClick={() => toggleNote(note.id)}
                            className="mt-1 text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                Show more
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-white/30 mt-2">
                      {new Date(note.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-8 h-8 text-white/20 mb-2" />
            <p className="text-xs text-white/40">No quick notes yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
