// State Management Module
import { supabase, isConfigured } from '../lib/supabase.js'

// Application State
export const state = {
  boards: [],
  notes: [],
  activeBoard: null,
  isLoading: true
}

// Event listeners for state changes
const listeners = new Set()

export function subscribe(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function notify() {
  listeners.forEach(cb => cb(state))
}

// Load all data from Supabase
export async function loadState() {
  state.isLoading = true
  notify()
  
  try {
    // Load boards with their lists, cards, and checklist items
    const { data: boards, error: boardsError } = await supabase
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
    
    // Sort lists and cards by position
    if (boards) {
      boards.forEach(board => {
        if (board.lists) {
          board.lists.sort((a, b) => a.position - b.position)
          board.lists.forEach(list => {
            if (list.cards) {
              list.cards.sort((a, b) => a.position - b.position)
              list.cards.forEach(card => {
                if (card.checklist) {
                  card.checklist.sort((a, b) => a.position - b.position)
                }
              })
            }
          })
        }
      })
    }
    
    state.boards = boards || []
    
    // Load notes
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (notesError) throw notesError
    state.notes = notes || []
    
    // Set active board
    if (state.boards.length > 0 && !state.activeBoard) {
      state.activeBoard = state.boards[0].id
    }
    
    state.isLoading = false
    notify()
    return true
  } catch (error) {
    console.error('Error loading state:', error)
    state.isLoading = false
    notify()
    return false
  }
}

// Get current board
export function getActiveBoard() {
  return state.boards.find(b => b.id === state.activeBoard)
}

// Set active board
export function setActiveBoard(boardId) {
  state.activeBoard = boardId
  notify()
}

// Find card by ID
export function findCard(cardId) {
  for (const board of state.boards) {
    for (const list of board.lists || []) {
      const card = list.cards?.find(c => c.id === cardId)
      if (card) return { card, list, board }
    }
  }
  return null
}

// Find list by ID
export function findList(listId) {
  for (const board of state.boards) {
    const list = board.lists?.find(l => l.id === listId)
    if (list) return { list, board }
  }
  return null
}

// Update state and notify
export function updateState() {
  notify()
}
