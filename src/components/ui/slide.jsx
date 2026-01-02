import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

// Slide-in Panel for Notes sidebar
const SlidePanel = React.forwardRef(
  ({ className, isOpen, onClose, title, children, ...props }, ref) => {
    return (
      <>
        {/* Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
          )}
        </AnimatePresence>

        {/* Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={ref}
              className={cn(
                'fixed top-0 right-0 z-50 h-full w-[380px] max-w-[90vw]',
                // Glass effect
                'bg-black/80 backdrop-blur-2xl border-l border-white/10',
                'flex flex-col shadow-2xl',
                className
              )}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              {...props}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">
                  {title}
                </h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }
)
SlidePanel.displayName = 'SlidePanel'

export { SlidePanel }
