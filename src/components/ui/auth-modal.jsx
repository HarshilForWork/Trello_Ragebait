import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/store/auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react'

export function AuthModal({ open, onOpenChange }) {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  const switchMode = (newMode) => {
    resetForm()
    setMode(newMode)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        onOpenChange(false)
      } else {
        await signUp(email, password)
        setSuccess('Account created! Check your email to verify.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {/* Mode tabs */}
          <div className="flex rounded-lg bg-white/5 p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/50 uppercase flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/50 uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Confirm password for signup */}
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <label className="text-xs font-medium text-white/50 uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
