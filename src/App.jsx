import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AuthProvider, useAuth } from '@/store/auth'
import { StoreProvider, useStore } from '@/store'
import { AuthModal } from '@/components/ui/auth-modal'
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
  X,
  User,
  LogOut,
  GripVertical,
  ChevronRight
} from 'lucide-react'

// Preset wallpapers - beautiful high-quality images
const WALLPAPERS = [
  { id: 'none', url: null, label: 'None' },
  { id: 'custom-gradient', url: '/wallpapers/custom-gradient.jpg', label: 'Gradient' },
  { id: 'mountain', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', label: 'Mountains' },
  { id: 'ocean', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80', label: 'Ocean' },
  { id: 'forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80', label: 'Forest' },
  { id: 'desert', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80', label: 'Desert' },
  { id: 'aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80', label: 'Aurora' },
  { id: 'city', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80', label: 'City' },
  { id: 'space', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80', label: 'Space' },
  { id: 'abstract', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80', label: 'Abstract' },
]

// Sortable Card Component
function SortableCard({ card, openCardModal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow group flex items-start gap-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 -ml-1 -mt-0.5 rounded text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1" onClick={() => openCardModal(card)}>
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
      </div>
    </div>
  )
}

// Sortable List Component
function SortableList({ list, store, openCardModal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const cards = list.cards || []
  const cardIds = cards.map(c => c.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-72 max-h-full flex flex-col bg-gray-100 rounded-xl shadow-lg"
    >
      {/* List header with drag handle */}
      <div className="px-3 py-2.5 flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 rounded text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <h3 className="font-semibold text-gray-800 text-sm flex-1">{list.name}</h3>
        <button
          onClick={() => store.deleteList(list.id)}
          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Cards with sortable context */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <SortableCard key={card.id} card={card} openCardModal={openCardModal} />
          ))}
        </SortableContext>
      </div>

      {/* Add card button */}
      <button 
        onClick={() => openCardModal({ list_id: list.id })}
        className="mx-2 mb-2 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        Add a card
      </button>
    </div>
  )
}

// Board with Drag and Drop
function BoardWithDnd({ board, store, openCardModal, setListModalOpen }) {
  const [activeId, setActiveId] = useState(null)
  const [activeType, setActiveType] = useState(null) // 'list' or 'card'

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const lists = board.lists || []
  const listIds = lists.map(l => l.id)

  // Find which list a card belongs to
  const findListContainingCard = (cardId) => {
    for (const list of lists) {
      if (list.cards?.some(c => c.id === cardId)) {
        return list
      }
    }
    return null
  }

  const handleDragStart = (event) => {
    const { active } = event
    const isCard = lists.some(l => l.cards?.some(c => c.id === active.id))
    setActiveId(active.id)
    setActiveType(isCard ? 'card' : 'list')
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    setActiveType(null)

    if (!over) return

    if (activeType === 'list') {
      // Reorder lists
      const oldIndex = listIds.indexOf(active.id)
      const newIndex = listIds.indexOf(over.id)
      if (oldIndex !== newIndex) {
        store.reorderLists(board.id, oldIndex, newIndex)
      }
    } else if (activeType === 'card') {
      // Reorder cards
      const sourceList = findListContainingCard(active.id)
      const destList = findListContainingCard(over.id) || lists.find(l => l.id === over.id)
      
      if (sourceList && destList) {
        const sourceCards = sourceList.cards || []
        const destCards = destList.cards || []
        
        const oldIndex = sourceCards.findIndex(c => c.id === active.id)
        let newIndex = destCards.findIndex(c => c.id === over.id)
        
        if (newIndex === -1) newIndex = destCards.length

        store.reorderCards(sourceList.id, destList.id, oldIndex, newIndex)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 h-full pb-2">
        <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
          {lists.map(list => (
            <SortableList 
              key={list.id} 
              list={list} 
              store={store}
              openCardModal={openCardModal} 
            />
          ))}
        </SortableContext>

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
    </DndContext>
  )
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </AuthProvider>
  )
}

function AppContent() {
  const store = useStore()
  const auth = useAuth()
  const [notesOpen, setNotesOpen] = useState(false)
  const [boardModalOpen, setBoardModalOpen] = useState(false)
  const [listModalOpen, setListModalOpen] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [wallpaperModalOpen, setWallpaperModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
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
        
        if (!data.boards && !data.notes) {
          alert('Invalid file format - no boards or notes found')
          return
        }

        // Check if user is authenticated
        if (!auth.isAuthenticated) {
          alert('Please sign in to import data')
          return
        }

        let importedBoards = 0
        let importedNotes = 0

        // Import boards with their lists, cards, and checklist items
        if (data.boards && Array.isArray(data.boards)) {
          for (const board of data.boards) {
            try {
              // Create board
              const newBoard = await store.createBoard(board.name)
              if (!newBoard) continue
              importedBoards++

              // Create lists
              if (board.lists && Array.isArray(board.lists)) {
                for (const list of board.lists) {
                  const newList = await store.createList(newBoard.id, list.name)
                  if (!newList) continue

                  // Create cards
                  if (list.cards && Array.isArray(list.cards)) {
                    for (const card of list.cards) {
                      const newCard = await store.createCard(newList.id, card.title, card.description || '')
                      if (!newCard) continue

                      // Create checklist items
                      if (card.checklist && Array.isArray(card.checklist)) {
                        for (const item of card.checklist) {
                          await store.addChecklistItem(newCard.id, item.text)
                        }
                      }
                    }
                  }
                }
              }
            } catch (err) {
              console.error('Error importing board:', err)
            }
          }
        }

        // Import notes
        if (data.notes && Array.isArray(data.notes)) {
          for (const note of data.notes) {
            try {
              await store.createNote(note.title, note.content || '')
              importedNotes++
            } catch (err) {
              console.error('Error importing note:', err)
            }
          }
        }

        alert(`Import complete!\n${importedBoards} boards imported\n${importedNotes} notes imported`)
        
        // Reset file input
        e.target.value = ''
      } catch (err) {
        console.error('Import error:', err)
        alert('Error parsing file: ' + err.message)
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

          {/* User Auth */}
          <div className="ml-2 pl-2 border-l border-white/20">
            {auth.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="max-w-[120px] truncate">{auth.user?.email?.split('@')[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs text-white/50 font-normal">
                    {auth.user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => auth.signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
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
            /* Board view with drag-and-drop */
            <BoardWithDnd 
              board={currentBoard} 
              store={store} 
              openCardModal={openCardModal}
              setListModalOpen={setListModalOpen}
            />
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

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}

// Recursive Checklist Tree for nested subtasks
function ChecklistTree({ items, parentId, cardId, store, isNew, removePendingItem, level }) {
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [addingSubItemFor, setAddingSubItemFor] = useState(null)
  const [newSubItemText, setNewSubItemText] = useState('')

  // Filter items by parent (treat null and undefined the same for root level)
  const filteredItems = items.filter(item => {
    if (parentId === null) {
      return item.parent_id === null || item.parent_id === undefined
    }
    return item.parent_id === parentId
  })

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const getChildren = (itemId) => items.filter(item => item.parent_id === itemId)

  const handleAddSubItem = async (parentItemId) => {
    if (!newSubItemText.trim()) return
    await store.addChecklistItem(cardId, newSubItemText, parentItemId)
    setNewSubItemText('')
    setAddingSubItemFor(null)
    // Auto-expand the parent
    setExpandedItems(prev => new Set([...prev, parentItemId]))
  }

  if (filteredItems.length === 0) return null

  return (
    <div className="space-y-1">
      {filteredItems.map(item => {
        const children = getChildren(item.id)
        const hasChildren = children.length > 0
        const isExpanded = expandedItems.has(item.id)

        return (
          <div key={item.id}>
            <motion.div
              className="flex items-center gap-1 p-2 rounded-lg bg-white/5 group"
              style={{ marginLeft: level * 16 }}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Expand/collapse button */}
              <button
                onClick={() => toggleExpand(item.id)}
                className={`p-0.5 rounded transition-transform ${hasChildren ? 'text-white/40 hover:text-white' : 'invisible'}`}
              >
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {/* Checkbox */}
              {!isNew ? (
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => store.toggleChecklistItem(cardId, item.id)}
                />
              ) : (
                <div className="w-4 h-4 rounded border border-white/30" />
              )}

              {/* Text */}
              <span className={`flex-1 text-sm ${item.completed ? 'line-through text-white/40' : 'text-white'}`}>
                {item.text}
              </span>

              {/* Add sub-item button (only for existing cards) */}
              {!isNew && (
                <button
                  onClick={() => setAddingSubItemFor(addingSubItemFor === item.id ? null : item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/40 hover:text-white transition-all"
                  title="Add sub-item"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Delete button */}
              <button
                onClick={() => isNew ? removePendingItem(item.id) : store.deleteChecklistItem(cardId, item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/40 hover:text-red-400 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>

            {/* Add sub-item input */}
            {addingSubItemFor === item.id && (
              <motion.div 
                className="flex gap-2 mt-1"
                style={{ marginLeft: (level + 1) * 16 + 8 }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Input
                  placeholder="Add sub-item..."
                  value={newSubItemText}
                  onChange={e => setNewSubItemText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSubItem(item.id)}
                  className="flex-1 h-8 text-sm"
                  autoFocus
                />
                <button
                  onClick={() => handleAddSubItem(item.id)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors"
                >
                  Add
                </button>
              </motion.div>
            )}

            {/* Render children recursively */}
            {hasChildren && isExpanded && (
              <ChecklistTree
                items={items}
                parentId={item.id}
                cardId={cardId}
                store={store}
                isNew={isNew}
                removePendingItem={removePendingItem}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
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

          {/* Checklist section with nested subtasks */}
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

            <div className="space-y-1 mb-3 max-h-60 overflow-y-auto">
              <ChecklistTree 
                items={checklist}
                parentId={null}
                cardId={card?.id}
                store={store}
                isNew={isNew}
                removePendingItem={removePendingItem}
                level={0}
              />
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
