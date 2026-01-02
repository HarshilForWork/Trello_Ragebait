import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Animated card that can be dragged
const Card = React.forwardRef(
  ({ className, children, isDragging, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 p-4',
        'backdrop-blur-sm transition-colors',
        'hover:border-primary/50 hover:bg-white/8',
        'cursor-pointer group',
        isDragging && 'opacity-50 rotate-3 scale-105',
        className
      )}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 10px 40px rgba(139, 92, 246, 0.15)'
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      {...props}
    >
      {children}
    </motion.div>
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-sm font-semibold leading-tight text-foreground',
      'group-hover:text-white transition-colors',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-muted-foreground line-clamp-2', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-2', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-3 border-t border-white/10 mt-3', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Badge for showing checklist progress
const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
      variant === 'default' && 'bg-white/10 text-muted-foreground',
      variant === 'success' && 'bg-emerald-500/20 text-emerald-400',
      variant === 'warning' && 'bg-amber-500/20 text-amber-400',
      variant === 'primary' && 'bg-primary/20 text-primary',
      className
    )}
    {...props}
  />
))
Badge.displayName = 'Badge'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge }
