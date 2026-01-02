import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl px-4 py-2',
        'bg-white/10 border border-white/20',
        'text-sm text-white placeholder:text-white/40',
        'transition-all duration-200',
        'focus:outline-none focus:bg-white/15 focus:border-white/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-xl px-4 py-3',
        'bg-white/10 border border-white/20',
        'text-sm text-white placeholder:text-white/40',
        'transition-all duration-200 resize-none',
        'focus:outline-none focus:bg-white/15 focus:border-white/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Input, Textarea }
