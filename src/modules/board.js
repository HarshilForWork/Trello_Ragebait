// Board Module - CRUD operations for boards
import { supabase } from '../lib/supabase.js'
import { state, loadState, setActiveBoard, updateState } from './state.js'
import { renderLists } from './list.js'
import { showToast } from '../main.js'

// DOM Elements
const boardSelect = document.getElementById('board-select')
const emptyState = document.getElementById('empty-state')
const listsContainer = document.getElementById('lists-container')
const addListWrapper = document.getElementById('add-list-wrapper')

// Create a new board
export async function createBoard(name) {
  try {
    const position = state.boards.length
    
    const { data, error } = await supabase
      .from('boards')
      .insert([{ name, position }])
      .select()
      .single()
    
    if (error) throw error
    
    // Add to local state with empty lists array
    data.lists = []
    state.boards.push(data)
    setActiveBoard(data.id)
    
    renderBoardSelector()
    renderActiveBoard()
    showToast(`Board "${name}" created!`, 'success')
    
    return data
  } catch (error) {
    console.error('Error creating board:', error)
    showToast('Failed to create board', 'error')
    return null
  }
}

// Delete a board
export async function deleteBoard(boardId) {
  try {
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId)
    
    if (error) throw error
    
    // Remove from local state
    const index = state.boards.findIndex(b => b.id === boardId)
    const boardName = state.boards[index]?.name
    
    if (index > -1) {
      state.boards.splice(index, 1)
    }
    
    // Set new active board
    if (state.activeBoard === boardId) {
      state.activeBoard = state.boards[0]?.id || null
    }
    
    renderBoardSelector()
    renderActiveBoard()
    showToast(`Board "${boardName}" deleted`, 'info')
    
    return true
  } catch (error) {
    console.error('Error deleting board:', error)
    showToast('Failed to delete board', 'error')
    return false
  }
}

// Rename a board
export async function renameBoard(boardId, newName) {
  try {
    const { error } = await supabase
      .from('boards')
      .update({ name: newName })
      .eq('id', boardId)
    
    if (error) throw error
    
    // Update local state
    const board = state.boards.find(b => b.id === boardId)
    if (board) {
      board.name = newName
    }
    
    renderBoardSelector()
    return true
  } catch (error) {
    console.error('Error renaming board:', error)
    showToast('Failed to rename board', 'error')
    return false
  }
}

// Render board selector dropdown
export function renderBoardSelector() {
  boardSelect.innerHTML = '<option value="">Select Board</option>'
  
  state.boards.forEach(board => {
    const option = document.createElement('option')
    option.value = board.id
    option.textContent = board.name
    if (board.id === state.activeBoard) {
      option.selected = true
    }
    boardSelect.appendChild(option)
  })
}

// Render the active board
export function renderActiveBoard() {
  const board = state.boards.find(b => b.id === state.activeBoard)
  
  if (!board) {
    // Show empty state
    emptyState.style.display = 'flex'
    listsContainer.style.display = 'none'
    addListWrapper.style.display = 'none'
  } else {
    // Show board content
    emptyState.style.display = 'none'
    listsContainer.style.display = 'flex'
    addListWrapper.style.display = 'block'
    
    renderLists(board)
  }
}

// Initialize board event listeners
export function initBoardEvents() {
  // Board select change
  boardSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      setActiveBoard(e.target.value)
      renderActiveBoard()
    }
  })
}
