import React, { useState } from 'react'
import { HelpCircle, X, Keyboard, MousePointer, Layout, Calendar, BarChart3, Kanban, StickyNote, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const features = [
  {
    icon: Layout,
    title: 'Dashboard View',
    description: 'Switch between Kanban and Dashboard views using the toggle button in the header.',
    tips: [
      'Drag widgets by their header to rearrange',
      'Resize widgets from the bottom-right corner',
      'Click "Reset Layout" to restore default positions'
    ]
  },
  {
    icon: Calendar,
    title: 'Calendar Widget',
    description: 'View and manage tasks by their due dates.',
    tips: [
      'Click ➕ to add new tasks with due date',
      'Switch between Day, Week, and Month views',
      'Blue dots indicate days with tasks',
      'Add subtasks when creating a task'
    ]
  },
  {
    icon: BarChart3,
    title: 'Progress Widget',
    description: 'Track your daily, weekly, and monthly task completion.',
    tips: [
      'Use arrows to switch between Daily/Weekly/Monthly',
      'Click "Show Tasks" to see all tasks for the period',
      'Click on a task to see its subtasks and description',
      'Check off subtasks directly from the expanded view'
    ]
  },
  {
    icon: Kanban,
    title: 'Quick View Widget',
    description: 'Browse all boards and lists in a compact view.',
    tips: [
      'Use dropdown to switch between boards',
      'Click list header to expand/collapse',
      'Click ➕ on any list to add tasks quickly',
      'See subtask progress on each task'
    ]
  },
  {
    icon: StickyNote,
    title: 'Notes Widget',
    description: 'Create quick notes with title and description.',
    tips: [
      'Click ➕ to add a new note',
      'Click "Show more" to expand long notes',
      'Hover over a note to see delete button'
    ]
  }
]

const shortcuts = [
  { key: 'Drag Header', action: 'Move widget' },
  { key: 'Drag Corner', action: 'Resize widget' },
  { key: 'Enter', action: 'Submit form' },
  { key: 'Click Date', action: 'Select date in calendar' },
  { key: 'Click Task', action: 'Expand/collapse details' }
]

export default function HelpWidget({ onClose }) {
  const [expandedFeature, setExpandedFeature] = useState(null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <HelpCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Welcome to Vaishu Organizer!</h2>
              <p className="text-xs text-white/60">Learn how to use all the features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
          {/* Features */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              Features & Tips
            </h3>
            {features.map((feature, index) => {
              const isExpanded = expandedFeature === index
              const Icon = feature.icon
              
              return (
                <div
                  key={index}
                  className="rounded-lg bg-white/5 border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFeature(isExpanded ? null : index)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">{feature.title}</h4>
                      <p className="text-xs text-white/60">{feature.description}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 ml-12 space-y-1">
                          {feature.tips.map((tip, tipIndex) => (
                            <div
                              key={tipIndex}
                              className="flex items-start gap-2 text-xs text-white/70"
                            >
                              <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Shortcuts */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <span className="text-xs text-white/70">{shortcut.action}</span>
                  <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-white font-mono">
                    {shortcut.key}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Getting Started */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <h3 className="text-sm font-semibold text-white mb-2">🚀 Getting Started</h3>
            <ol className="text-xs text-white/70 space-y-1 list-decimal list-inside">
              <li>Create a board using the ➕ button in the header</li>
              <li>Add lists to your board (e.g., To Do, In Progress, Done)</li>
              <li>Create cards/tasks in your lists</li>
              <li>Add subtasks and due dates to your cards</li>
              <li>Switch to Dashboard view for a widget-based overview</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-800/50">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Got it, let's go!
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
