// List Module - CRUD operations for lists
import { supabase } from '../lib/supabase.js'
import { state, getActiveBoard, updateState } from './state.js'
import { renderCards, initCardDragDrop } from './card.js'
import { showToast, openModal, closeModal } from '../main.js'

// DOM Elements
const listsContainer = document.getElementById('lists-container')

// Create a new list
export async function createList(boardId, name) {
  try {
    const board = state.boards.find(b => b.id === boardId)
    const position = board?.lists?.length || 0
    
    const { data, error } = await supabase
      .from('lists')
      .insert([{ board_id: boardId, name, position }])
      .select()
      .single()
    
    if (error) throw error
    
    // Add to local state with empty cards array
    data.cards = []
    if (!board.lists) board.lists = []
    board.lists.push(data)
    
    renderLists(board)
    showToast(`List "${name}" created!`, 'success')
    
    return data
  } catch (error) {
    console.error('Error creating list:', error)
    showToast('Failed to create list', 'error')
    return null
  }
}

// Delete a list
export async function deleteList(listId) {
  try {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
    
    if (error) throw error
    
    // Remove from local state
    const board = getActiveBoard()
    if (board?.lists) {
      const index = board.lists.findIndex(l => l.id === listId)
      if (index > -1) {
        const listName = board.lists[index].name
        board.lists.splice(index, 1)
        renderLists(board)
        showToast(`List "${listName}" deleted`, 'info')
      }
    }
    
    return true
  } catch (error) {
    console.error('Error deleting list:', error)
    showToast('Failed to delete list', 'error')
    return false
  }
}

// Rename a list
export async function renameList(listId, newName) {
  try {
    const { error } = await supabase
      .from('lists')
      .update({ name: newName })
      .eq('id', listId)
    
    if (error) throw error
    
    // Update local state
    const board = getActiveBoard()
    const list = board?.lists?.find(l => l.id === listId)
    if (list) {
      list.name = newName
    }
    
    return true
  } catch (error) {
    console.error('Error renaming list:', error)
    showToast('Failed to rename list', 'error')
    return false
  }
}

// Render all lists for a board
export function renderLists(board) {
  listsContainer.innerHTML = ''
  
  if (!board?.lists) return
  
  board.lists.forEach(list => {
    const listEl = createListElement(list)
    listsContainer.appendChild(listEl)
  })
}

// Create a list DOM element
function createListElement(list) {
  const listEl = document.createElement('div')
  listEl.className = 'list'
  listEl.dataset.listId = list.id
  
  listEl.innerHTML = `
    <div class="list-header">
      <input type="text" class="list-title-input" value="${escapeHtml(list.name)}" data-list-id="${list.id}">
      <button class="list-menu-btn" data-list-id="${list.id}" title="Delete list">🗑️</button>
    </div>
    <div class="list-cards" data-list-id="${list.id}">
      <!-- Cards will be rendered here -->
    </div>
    <div class="list-footer">
      <button class="add-card-btn" data-list-id="${list.id}">
        <span>+</span> Add a card
      </button>
    </div>
  `
  
  // Render cards
  const cardsContainer = listEl.querySelector('.list-cards')
  renderCards(cardsContainer, list.cards || [])
  
  // Initialize drag-drop for this list's cards container
  initCardDragDrop(cardsContainer)
  
  // Add event listeners
  const titleInput = listEl.querySelector('.list-title-input')
  titleInput.addEventListener('blur', async () => {
    const newName = titleInput.value.trim()
    if (newName && newName !== list.name) {
      await renameList(list.id, newName)
    } else {
      titleInput.value = list.name
    }
  })
  
  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      titleInput.blur()
    }
  })
  
  // Delete button
  const deleteBtn = listEl.querySelector('.list-menu-btn')
  deleteBtn.addEventListener('click', async () => {
    if (confirm(`Delete list "${list.name}" and all its cards?`)) {
      await deleteList(list.id)
    }
  })
  
  // Add card button
  const addCardBtn = listEl.querySelector('.add-card-btn')
  addCardBtn.addEventListener('click', () => {
    window.currentListId = list.id
    window.currentCardId = null
    document.getElementById('card-modal-title').textContent = 'New Card'
    document.getElementById('card-title-input').value = ''
    document.getElementById('card-description-input').value = ''
    document.getElementById('checklist-container').innerHTML = ''
    document.getElementById('delete-card-btn').style.display = 'none'
    openModal('card-modal')
  })
  
  return listEl
}

// Helper: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Initialize list event listeners
export function initListEvents() {
  // Add list button
  const addListBtn = document.getElementById('add-list-btn')
  addListBtn.addEventListener('click', () => {
    document.getElementById('list-name-input').value = ''
    openModal('list-modal')
  })
  
  // List modal submit
  document.getElementById('list-modal-submit').addEventListener('click', async () => {
    const name = document.getElementById('list-name-input').value.trim()
    if (name) {
      await createList(state.activeBoard, name)
      closeModal('list-modal')
    }
  })
  
  // Enter key in list name input
  document.getElementById('list-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('list-modal-submit').click()
    }
  })
}
