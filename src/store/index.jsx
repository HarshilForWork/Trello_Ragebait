import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isConfigured } from '@/lib/supabase'

const StoreContext = createContext(null)

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}

export function StoreProvider({ children }) {
  const [boards, setBoards] = useState([])
  const [notes, setNotes] = useState([])
  const [activeBoard, setActiveBoard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load all data from Supabase
  const loadData = useCallback(async () => {
    if (!isConfigured) {
      setIsLoading(false)
      setError('Supabase not configured')
      return
    }

    setIsLoading(true)
    try {
      // Load boards with nested data
      const { data: boardsData, error: boardsError } = await supabase
        .from('boards')
        .select(`
          *,
          lists:lists(
            *,
            cards:cards(
              *,
              checklist:checklist_items(*)
            )
          )
        `)
        .order('position')

      if (boardsError) throw boardsError

      // Sort nested data
      const sortedBoards = (boardsData || []).map(board => ({
        ...board,
        lists: (board.lists || [])
          .sort((a, b) => a.position - b.position)
          .map(list => ({
            ...list,
            cards: (list.cards || [])
              .sort((a, b) => a.position - b.position)
              .map(card => ({
                ...card,
                checklist: (card.checklist || []).sort((a, b) => a.position - b.position)
              }))
          }))
      }))

      setBoards(sortedBoards)
      if (sortedBoards.length > 0 && !activeBoard) {
        setActiveBoard(sortedBoards[0].id)
      }

      // Load notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (notesError) throw notesError
      setNotes(notesData || [])

      setError(null)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [activeBoard])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Board operations
  const createBoard = async (name) => {
    if (!isConfigured) return null
    const { data, error } = await supabase
      .from('boards')
      .insert([{ name, position: boards.length }])
      .select()
      .single()

    if (error) throw error
    const newBoard = { ...data, lists: [] }
    setBoards(prev => [...prev, newBoard])
    setActiveBoard(data.id)
    return data
  }

  const deleteBoard = async (id) => {
    if (!isConfigured) return
    await supabase.from('boards').delete().eq('id', id)
    setBoards(prev => prev.filter(b => b.id !== id))
    if (activeBoard === id) {
      setActiveBoard(boards[0]?.id || null)
    }
  }

  // List operations
  const createList = async (boardId, name) => {
    if (!isConfigured) return null
    const board = boards.find(b => b.id === boardId)
    const position = board?.lists?.length || 0

    const { data, error } = await supabase
      .from('lists')
      .insert([{ board_id: boardId, name, position }])
      .select()
      .single()

    if (error) throw error
    const newList = { ...data, cards: [] }
    setBoards(prev => prev.map(b =>
      b.id === boardId ? { ...b, lists: [...(b.lists || []), newList] } : b
    ))
    return data
  }

  const deleteList = async (listId) => {
    if (!isConfigured) return
    await supabase.from('lists').delete().eq('id', listId)
    setBoards(prev => prev.map(b => ({
      ...b,
      lists: (b.lists || []).filter(l => l.id !== listId)
    })))
  }

  // Card operations
  const createCard = async (listId, title, description = '') => {
    if (!isConfigured) return null
    const board = boards.find(b => b.lists?.some(l => l.id === listId))
    const list = board?.lists?.find(l => l.id === listId)
    const position = list?.cards?.length || 0

    const { data, error } = await supabase
      .from('cards')
      .insert([{ list_id: listId, title, description, position }])
      .select()
      .single()

    if (error) throw error
    const newCard = { ...data, checklist: [] }
    setBoards(prev => prev.map(b => ({
      ...b,
      lists: (b.lists || []).map(l =>
        l.id === listId ? { ...l, cards: [...(l.cards || []), newCard] } : l
      )
    })))
    return data
  }

  const updateCard = async (cardId, updates) => {
    if (!isConfigured) return
    await supabase.from('cards').update(updates).eq('id', cardId)
    setBoards(prev => prev.map(b => ({
      ...b,
      lists: (b.lists || []).map(l => ({
        ...l,
        cards: (l.cards || []).map(c =>
          c.id === cardId ? { ...c, ...updates } : c
        )
      }))
    })))
  }

  const deleteCard = async (cardId) => {
    if (!isConfigured) return
    await supabase.from('cards').delete().eq('id', cardId)
    setBoards(prev => prev.map(b => ({
      ...b,
      lists: (b.lists || []).map(l => ({
        ...l,
        cards: (l.cards || []).filter(c => c.id !== cardId)
      }))
    })))
  }

  const moveCard = async (cardId, targetListId, newPosition) => {
    if (!isConfigured) return
    
    // Find source list and card
    let sourceList = null
    let card = null
    for (const board of boards) {
      for (const list of board.lists || []) {
        const foundCard = list.cards?.find(c => c.id === cardId)
        if (foundCard) {
          sourceList = list
          card = foundCard
          break
        }
      }
    }
    
    if (!card) return

    await supabase
      .from('cards')
      .update({ list_id: targetListId, position: newPosition })
      .eq('id', cardId)

    // Update local state
    setBoards(prev => prev.map(b => ({
      ...b,
      lists: (b.lists || []).map(l => {
        if (l.id === sourceList.id) {
          return { ...l, cards: (l.cards || []).filter(c => c.id !== cardId) }
        }
        if (l.id === targetListId) {
          const newCards = [...(l.cards || [])]
          newCards.splice(newPosition, 0, { ...card, list_id: targetListId })
          return { ...l, cards: newCards }
        }
        return l
      })
    })))
  }

  // Checklist operations
  const addChecklistItem = async (cardId, text) => {
    if (!isConfigured) return null
    const card = boards.flatMap(b => b.lists?.flatMap(l => l.cards || []) || []).find(c => c.id === cardId)
    const position = card?.checklist?.length || 0

    const { data, error } = await supabase
      .from('checklist_items')
      .insert([{ card_id: cardId, text, position, completed: false }])
      .select()
      .single()

    if (error) throw error
    setBoards(prev => prev.map(b => ({
      ...b,
      lists: (b.lists || []).map(l => ({
        ...l,
        cards: (l.cards || []).map(c =>
          c.id === cardId ? { ...c, checklist: [...(c.checklist || []), data] } : c
        )
      }))
    })))
    return data
  }

  const toggleChecklistItem = async (cardId, itemId) => {
    if (!isConfigured) return
    const card = boards.flatMap(b => b.lists?.flatMap(l => l.cards || []) || []).find(c => c.id === cardId)
    const item = card?.checklist?.find(i => i.id === itemId)
    if (!item) return

    const newCompleted = !item.completed
    await supabase.from('checklist_items').update({ completed: newCompleted }).eq('id', itemId)
    
    setBoards(prev => prev.map(b => ({
      ...b,
      lists: (b.lists || []).map(l => ({
        ...l,
        cards: (l.cards || []).map(c => c.id === cardId ? {
          ...c,
          checklist: (c.checklist || []).map(i =>
            i.id === itemId ? { ...i, completed: newCompleted } : i
          )
        } : c)
      }))
    })))
  }

  const deleteChecklistItem = async (cardId, itemId) => {
    if (!isConfigured) return
    await supabase.from('checklist_items').delete().eq('id', itemId)
    setBoards(prev => prev.map(b => ({
      ...b,
      lists: (b.lists || []).map(l => ({
        ...l,
        cards: (l.cards || []).map(c => c.id === cardId ? {
          ...c,
          checklist: (c.checklist || []).filter(i => i.id !== itemId)
        } : c)
      }))
    })))
  }

  // Notes operations
  const createNote = async (title, content) => {
    if (!isConfigured) return null
    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, content }])
      .select()
      .single()

    if (error) throw error
    setNotes(prev => [data, ...prev])
    return data
  }

  const updateNote = async (noteId, updates) => {
    if (!isConfigured) return
    await supabase.from('notes').update(updates).eq('id', noteId)
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates } : n))
  }

  const deleteNote = async (noteId) => {
    if (!isConfigured) return
    await supabase.from('notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  const value = {
    boards,
    notes,
    activeBoard,
    setActiveBoard,
    isLoading,
    error,
    isConfigured,
    loadData,
    createBoard,
    deleteBoard,
    createList,
    deleteList,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    createNote,
    updateNote,
    deleteNote,
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}
