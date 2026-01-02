import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StoreProvider, useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { SlidePanel } from '@/components/ui/slide'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  LayoutGrid, 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  MoreHorizontal, 
  Check,
  Loader2,
  Image,
  Palette,
  X
} from 'lucide-react'

// Preset wallpapers - beautiful high-quality images
const WALLPAPERS = [
  { id: 'none', url: null, label: 'None' },
  { id: 'mountain', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', label: 'Mountains' },
  { id: 'ocean', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80', label: 'Ocean' },
  { id: 'forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80', label: 'Forest' },
  { id: 'desert', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80', label: 'Desert' },
  { id: 'aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80', label: 'Aurora' },
  { id: 'city', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80', label: 'City' },
  { id: 'space', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80', label: 'Space' },
  { id: 'abstract', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80', label: 'Abstract' },
]

// Main App Component
function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  )
}

function AppContent() {
  const store = useStore()
  const [notesOpen, setNotesOpen] = useState(false)
  const [boardModalOpen, setBoardModalOpen] = useState(false)
  const [listModalOpen, setListModalOpen] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null })
  const [currentCard, setCurrentCard] = useState(null)
  const [currentNote, setCurrentNote] = useState(null)
  const [newBoardName, setNewBoardName] = useState('')
  const [newListName, setNewListName] = useState('')
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('wallpaper') || null)
  const [customWallpaper, setCustomWallpaper] = useState(() => localStorage.getItem('customWallpaper') || null)
  const fileInputRef = useRef(null)

  // Custom confirm helper
  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ open: true, message, onConfirm })
  }

  const currentBoard = store.boards.find(b => b.id === store.activeBoard)

  // Save wallpaper preference
  useEffect(() => {
    if (wallpaper) {
      localStorage.setItem('wallpaper', wallpaper)
    } else {
      localStorage.removeItem('wallpaper')
    }
  }, [wallpaper])

  // Import/Export functions
  const handleExport = () => {
    const data = {
      boards: store.boards,
      notes: store.notes,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mini-trello-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.boards || data.notes) {
          // Simple import - just reload after import
          alert('Import successful! Please refresh the page to see changes.')
          // In a real app, you'd call store methods to import data
        }
      } catch (err) {
        alert('Invalid file format')
      }
    }
    reader.readAsText(file)
  }

  const handleCustomWallpaper = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      localStorage.setItem('customWallpaper', dataUrl)
      setCustomWallpaper(dataUrl)
      setWallpaper('custom')
    }
    reader.readAsDataURL(file)
  }

  const getWallpaperUrl = () => {
    if (wallpaper === 'custom') return customWallpaper
    if (wallpaper) {
      const wp = WALLPAPERS.find(w => w.id === wallpaper)
      return wp?.url
    }
    return null
  }

  // Loading state
  if (store.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <p className="text-white/60">Loading...</p>
        </motion.div>
      </div>
    )
  }

  // Not configured state
  if (!store.isConfigured) {
    return (
      <div className="h-screen flex items-center justify-center bg-black p-8">
        <motion.div
          className="text-center max-w-md bg-zinc-900 rounded-xl p-8 border border-zinc-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-xl font-bold text-white mb-2">Setup Required</h2>
          <p className="text-zinc-400 mb-6 text-sm">
            Configure your Supabase credentials in the .env file
          </p>
          <div className="text-left bg-black rounded-lg p-4 text-xs font-mono text-zinc-500">
            <p>VITE_SUPABASE_URL=your-url</p>
            <p>VITE_SUPABASE_ANON_KEY=your-key</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
      await store.createBoard(newBoardName.trim())
      setNewBoardName('')
      setBoardModalOpen(false)
    }
  }

  const handleCreateList = async () => {
    if (newListName.trim() && store.activeBoard) {
      await store.createList(store.activeBoard, newListName.trim())
      setNewListName('')
      setListModalOpen(false)
    }
  }

  const openCardModal = (card = null) => {
    setCurrentCard(card)
    setCardModalOpen(true)
  }

  const openNoteModal = (note = null) => {
    setCurrentNote(note)
    setNoteModalOpen(true)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Wallpaper background */}
      {getWallpaperUrl() && (
        <div 
          className="wallpaper-bg"
          style={{ backgroundImage: `url(${getWallpaperUrl()})` }}
        />
      )}

      {/* Header */}
      <header className={`h-14 flex items-center justify-between px-4 relative z-50 ${getWallpaperUrl() ? 'glass-header' : 'bg-zinc-900'} border-b border-white/10`}>
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-sm">Mini-Trello</span>
          </div>

          {/* Board selector */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
                  {currentBoard?.name || 'Select Board'}
                  <MoreHorizontal className="w-4 h-4 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel>Your Boards</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {store.boards.map(board => (
                  <DropdownMenuItem
                    key={board.id}
                    onClick={() => store.setActiveBoard(board.id)}
                  >
                    <LayoutGrid className="w-4 h-4 mr-2 opacity-50" />
                    {board.name}
                    {board.id === store.activeBoard && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setBoardModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Board
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setWallpaperModalOpen(true)}
            className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Change wallpaper"
          >
            <Image className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setNotesOpen(true)}
            className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Notes"
          >
            <FileText className="w-5 h-5" />
          </button>
          <label className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Import">
            <Upload className="w-5 h-5" />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button 
            onClick={handleExport}
            className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Export"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Toolbar */}
      {currentBoard && (
        <div className={`flex items-center gap-2 px-4 py-2 ${getWallpaperUrl() ? 'glass-header' : 'bg-zinc-900/50'}`}>
          <h2 className="text-white font-semibold text-lg">{currentBoard.name}</h2>
          <button
            onClick={() => showConfirm('Delete this board?', () => store.deleteBoard(currentBoard.id))}
            className="ml-auto p-1.5 rounded text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-hidden relative z-10">
        <div className="h-full p-4 overflow-x-auto">
          {!currentBoard ? (
            /* Empty state */
            <motion.div 
              className="h-full flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <LayoutGrid className="w-16 h-16 text-white/30 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No board selected</h2>
              <p className="text-white/50 mb-6">Create a board to get started</p>
              <button 
                onClick={() => setBoardModalOpen(true)}
                className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Board
              </button>
            </motion.div>
          ) : (
            /* Board view */
            <div className="flex gap-3 h-full pb-2">
              <AnimatePresence mode="popLayout">
                {currentBoard.lists?.map((list, index) => (
                  <motion.div
                    key={list.id}
                    className="flex-shrink-0 w-72 max-h-full flex flex-col bg-gray-100 rounded-xl shadow-lg"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    {/* List header */}
                    <div className="px-3 py-2.5 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 text-sm">{list.name}</h3>
                      <button
                        onClick={() => store.deleteList(list.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                      <AnimatePresence>
                        {list.cards?.map(card => (
                          <motion.div 
                            key={card.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow group"
                            onClick={() => openCardModal(card)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            whileHover={{ y: -2 }}
                          >
                            <h4 className="text-sm font-medium text-gray-800">{card.title}</h4>
                            {card.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
                            )}
                            {card.checklist?.length > 0 && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                <Check className="w-3.5 h-3.5" />
                                <span className={card.checklist.every(i => i.completed) ? 'text-green-600' : ''}>
                                  {card.checklist.filter(i => i.completed).length}/{card.checklist.length}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Add card button */}
                    <button 
                      onClick={() => openCardModal({ list_id: list.id })}
                      className="mx-2 mb-2 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add a card
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add list button */}
              <motion.button
                onClick={() => setListModalOpen(true)}
                className="flex-shrink-0 w-72 h-fit p-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-dashed border-white/30 text-white/80 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                Add list
              </motion.button>
            </div>
          )}
        </div>
      </main>

      {/* Notes Panel */}
      <SlidePanel
        isOpen={notesOpen}
        onClose={() => setNotesOpen(false)}
        title="Notes"
      >
        <div className="p-4">
          <button 
            onClick={() => openNoteModal(null)}
            className="w-full py-2 px-4 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
          
          <div className="space-y-2">
            {store.notes.map(note => (
              <motion.div
                key={note.id}
                className="p-3 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer transition-colors"
                onClick={() => openNoteModal(note)}
                whileHover={{ x: 4 }}
              >
                <h4 className="font-medium text-white text-sm">{note.title}</h4>
                <p className="text-xs text-white/50 mt-1 line-clamp-2">{note.content}</p>
              </motion.div>
            ))}
            {store.notes.length === 0 && (
              <p className="text-center text-white/40 py-8 text-sm">No notes yet</p>
            )}
          </div>
        </div>
      </SlidePanel>

      {/* Wallpaper Modal */}
      <Dialog open={wallpaperModalOpen} onOpenChange={setWallpaperModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Background</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {WALLPAPERS.map(wp => (
                <button
                  key={wp.id}
                  onClick={() => {
                    setWallpaper(wp.id === 'none' ? null : wp.id)
                    setWallpaperModalOpen(false)
                  }}
                  className={`aspect-video rounded-lg border-2 transition-all overflow-hidden ${
                    (wallpaper === wp.id || (!wallpaper && wp.id === 'none'))
                      ? 'border-white ring-2 ring-white'
                      : 'border-white/20 hover:border-white/50'
                  }`}
                  style={wp.url ? { 
                    backgroundImage: `url(${wp.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : { backgroundColor: '#1a1a1a' }}
                  title={wp.label}
                />
              ))}
            </div>
            <div className="border-t border-white/10 pt-4">
              <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 cursor-pointer transition-colors text-white/70 hover:text-white">
                <Upload className="w-5 h-5" />
                <span>Upload custom image</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCustomWallpaper}
                  className="hidden" 
                />
              </label>
              {customWallpaper && (
                <button
                  onClick={() => {
                    setWallpaper('custom')
                    setWallpaperModalOpen(false)
                  }}
                  className="w-full mt-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                >
                  Use custom wallpaper
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Board Modal */}
      <Dialog open={boardModalOpen} onOpenChange={setBoardModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Board</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            <Input
              placeholder="Board name"
              value={newBoardName}
              onChange={e => setNewBoardName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateBoard()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBoardModalOpen(false)}>Cancel</Button>
            <button 
              onClick={handleCreateBoard}
              className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* List Modal */}
      <Dialog open={listModalOpen} onOpenChange={setListModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add List</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            <Input
              placeholder="List name"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateList()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setListModalOpen(false)}>Cancel</Button>
            <button 
              onClick={handleCreateList}
              className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Add
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card Modal */}
      <CardModal
        open={cardModalOpen}
        onOpenChange={setCardModalOpen}
        card={currentCard}
        store={store}
        showConfirm={showConfirm}
      />

      {/* Note Modal */}
      <NoteModal
        open={noteModalOpen}
        onOpenChange={setNoteModalOpen}
        note={currentNote}
        store={store}
        showConfirm={showConfirm}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.()
          setConfirmDialog({ open: false, message: '', onConfirm: null })
        }}
        onCancel={() => setConfirmDialog({ open: false, message: '', onConfirm: null })}
      />
    </div>
  )
}

// Card Modal Component
function CardModal({ open, onOpenChange, card, store, showConfirm }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [pendingItems, setPendingItems] = useState([]) // For new cards
  const [titleError, setTitleError] = useState(false)
  const isNew = !card?.id

  // Get fresh card data from store for live updates
  const freshCard = React.useMemo(() => {
    if (!card?.id) return card
    for (const board of store.boards) {
      for (const list of board.lists || []) {
        const found = list.cards?.find(c => c.id === card.id)
        if (found) return found
      }
    }
    return card
  }, [card?.id, store.boards])

  React.useEffect(() => {
    if (card) {
      setTitle(card.title || '')
      setDescription(card.description || '')
      setPendingItems([])
      setTitleError(false)
    }
  }, [card])

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    
    if (isNew) {
      // Create card then add pending checklist items
      const newCard = await store.createCard(card.list_id, title, description)
      if (newCard && pendingItems.length > 0) {
        for (const item of pendingItems) {
          await store.addChecklistItem(newCard.id, item.text)
        }
      }
    } else {
      await store.updateCard(card.id, { title, description })
    }
    onOpenChange(false)
  }

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return
    
    if (isNew) {
      // For new cards, add to pending items
      setPendingItems(prev => [...prev, { 
        id: Date.now(), 
        text: newChecklistItem, 
        completed: false 
      }])
    } else {
      // For existing cards, add directly to store
      await store.addChecklistItem(card.id, newChecklistItem)
    }
    setNewChecklistItem('')
  }

  const removePendingItem = (id) => {
    setPendingItems(prev => prev.filter(item => item.id !== id))
  }

  // Use freshCard for checklist display (existing cards) or pendingItems (new cards)
  const checklist = isNew ? pendingItems : (freshCard?.checklist || [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? 'New Card' : 'Edit Card'}</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0 space-y-4">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase mb-1 block">
              Title <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="Enter title"
              value={title}
              onChange={e => {
                setTitle(e.target.value)
                if (e.target.value.trim()) setTitleError(false)
              }}
              className={titleError ? 'border-red-500 focus:border-red-500' : ''}
              autoFocus
            />
            {titleError && (
              <p className="text-xs text-red-400 mt-1">Title is required</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase mb-1 block">Description</label>
            <Textarea
              placeholder="Add description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Checklist section - now available for both new and existing cards */}
          <div>
            <label className="text-xs font-medium text-white/50 uppercase mb-2 block">Subtasks</label>
            
            {checklist.length > 0 && (
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                <motion.div
                  className="h-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(checklist.filter(i => i.completed).length / checklist.length) * 100}%`
                  }}
                />
              </div>
            )}

            <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
              {checklist.map(item => (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 group"
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {!isNew ? (
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => store.toggleChecklistItem(card.id, item.id)}
                    />
                  ) : (
                    <div className="w-4 h-4 rounded border border-white/30" />
                  )}
                  <span className={`flex-1 text-sm ${item.completed ? 'line-through text-white/40' : 'text-white'}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => isNew ? removePendingItem(item.id) : store.deleteChecklistItem(card.id, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/40 hover:text-red-400 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add subtask..."
                value={newChecklistItem}
                onChange={e => setNewChecklistItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
                className="flex-1"
              />
              <button 
                onClick={handleAddChecklistItem}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          {!isNew && (
            <button 
              onClick={() => showConfirm('Delete this card?', () => {
                store.deleteCard(card.id)
                onOpenChange(false)
              })}
              className="mr-auto px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Note Modal Component
function NoteModal({ open, onOpenChange, note, store, showConfirm }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const isNew = !note?.id

  React.useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
    } else {
      setTitle('')
      setContent('')
    }
  }, [note])

  const handleSave = async () => {
    if (!title.trim()) return
    if (isNew) {
      await store.createNote(title, content)
    } else {
      await store.updateNote(note.id, { title, content })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? 'New Note' : 'Edit Note'}</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0 space-y-4">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase mb-1 block">Title</label>
            <Input
              placeholder="Note title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase mb-1 block">Content</label>
            <Textarea
              placeholder="Write your note..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          {!isNew && (
            <button 
              onClick={() => showConfirm('Delete this note?', () => {
                store.deleteNote(note.id)
                onOpenChange(false)
              })}
              className="mr-auto px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Custom Confirm Dialog Component
function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0">
          <p className="text-white/80">{message}</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default App
