// Card Module - CRUD operations for cards
import { supabase } from '../lib/supabase.js'
import { state, getActiveBoard, findCard, findList, updateState } from './state.js'
import { renderLists } from './list.js'
import { showToast, openModal, closeModal } from '../main.js'
import { renderChecklist, loadChecklistForCard } from './checklist.js'

// Create a new card
export async function createCard(listId, title, description = '') {
  try {
    const { list } = findList(listId) || {}
    const position = list?.cards?.length || 0
    
    const { data, error } = await supabase
      .from('cards')
      .insert([{ list_id: listId, title, description, position }])
      .select()
      .single()
    
    if (error) throw error
    
    // Add to local state with empty checklist
    data.checklist = []
    if (!list.cards) list.cards = []
    list.cards.push(data)
    
    updateState()
    renderLists(getActiveBoard())
    showToast('Card created!', 'success')
    
    return data
  } catch (error) {
    console.error('Error creating card:', error)
    showToast('Failed to create card', 'error')
    return null
  }
}

// Update a card
export async function updateCard(cardId, updates) {
  try {
    const { error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', cardId)
    
    if (error) throw error
    
    // Update local state
    const result = findCard(cardId)
    if (result) {
      Object.assign(result.card, updates)
      updateState()
      renderLists(getActiveBoard())
    }
    
    return true
  } catch (error) {
    console.error('Error updating card:', error)
    showToast('Failed to update card', 'error')
    return false
  }
}

// Delete a card
export async function deleteCard(cardId) {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)
    
    if (error) throw error
    
    // Remove from local state
    const result = findCard(cardId)
    if (result) {
      const index = result.list.cards.findIndex(c => c.id === cardId)
      if (index > -1) {
        result.list.cards.splice(index, 1)
        updateState()
        renderLists(getActiveBoard())
        showToast('Card deleted', 'info')
      }
    }
    
    return true
  } catch (error) {
    console.error('Error deleting card:', error)
    showToast('Failed to delete card', 'error')
    return false
  }
}

// Move a card to a different list
export async function moveCard(cardId, targetListId, newPosition) {
  try {
    const result = findCard(cardId)
    if (!result) return false
    
    const { card, list: sourceList } = result
    const { list: targetList } = findList(targetListId) || {}
    
    if (!targetList) return false
    
    // Update in database
    const { error } = await supabase
      .from('cards')
      .update({ list_id: targetListId, position: newPosition })
      .eq('id', cardId)
    
    if (error) throw error
    
    // Update local state
    // Remove from source list
    const sourceIndex = sourceList.cards.findIndex(c => c.id === cardId)
    if (sourceIndex > -1) {
      sourceList.cards.splice(sourceIndex, 1)
    }
    
    // Add to target list
    if (!targetList.cards) targetList.cards = []
    card.list_id = targetListId
    card.position = newPosition
    targetList.cards.splice(newPosition, 0, card)
    
    // Update positions
    await updateCardPositions(targetListId, targetList.cards)
    
    updateState()
    renderLists(getActiveBoard())
    
    return true
  } catch (error) {
    console.error('Error moving card:', error)
    showToast('Failed to move card', 'error')
    return false
  }
}

// Update card positions in a list
async function updateCardPositions(listId, cards) {
  const updates = cards.map((card, index) => ({
    id: card.id,
    list_id: listId,
    position: index
  }))
  
  for (const update of updates) {
    await supabase
      .from('cards')
      .update({ position: update.position })
      .eq('id', update.id)
  }
}

// Render cards in a container
export function renderCards(container, cards) {
  container.innerHTML = ''
  
  cards.forEach(card => {
    const cardEl = createCardElement(card)
    container.appendChild(cardEl)
  })
}

// Create a card DOM element
function createCardElement(card) {
  const cardEl = document.createElement('div')
  cardEl.className = 'card'
  cardEl.dataset.cardId = card.id
  cardEl.draggable = true
  
  // Calculate checklist progress
  const checklistItems = card.checklist || []
  const completedItems = checklistItems.filter(item => item.completed).length
  const totalItems = checklistItems.length
  const hasChecklist = totalItems > 0
  const isComplete = hasChecklist && completedItems === totalItems
  
  let footerHtml = ''
  if (hasChecklist) {
    footerHtml = `
      <div class="card-footer">
        <span class="card-badge ${isComplete ? 'complete' : ''}">
          ✓ ${completedItems}/${totalItems}
        </span>
      </div>
    `
  }
  
  cardEl.innerHTML = `
    <div class="card-title">${escapeHtml(card.title)}</div>
    ${card.description ? `<div class="card-description">${escapeHtml(card.description)}</div>` : ''}
    ${footerHtml}
  `
  
  // Click to open modal
  cardEl.addEventListener('click', () => {
    openCardModal(card)
  })
  
  return cardEl
}

// Open card modal for editing
function openCardModal(card) {
  window.currentCardId = card.id
  window.currentListId = card.list_id
  
  document.getElementById('card-modal-title').textContent = 'Edit Card'
  document.getElementById('card-title-input').value = card.title
  document.getElementById('card-description-input').value = card.description || ''
  document.getElementById('delete-card-btn').style.display = 'inline-flex'
  
  // Load checklist
  loadChecklistForCard(card)
  
  openModal('card-modal')
}

// Initialize drag and drop for cards
export function initCardDragDrop(container) {
  container.addEventListener('dragover', (e) => {
    e.preventDefault()
    container.classList.add('drag-over')
  })
  
  container.addEventListener('dragleave', () => {
    container.classList.remove('drag-over')
  })
  
  container.addEventListener('drop', async (e) => {
    e.preventDefault()
    container.classList.remove('drag-over')
    
    const cardId = e.dataTransfer.getData('text/plain')
    const targetListId = container.dataset.listId
    
    if (cardId && targetListId) {
      // Calculate drop position
      const cards = Array.from(container.querySelectorAll('.card'))
      let newPosition = cards.length
      
      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect()
        if (e.clientY < rect.top + rect.height / 2) {
          newPosition = i
          break
        }
      }
      
      await moveCard(cardId, targetListId, newPosition)
    }
  })
}

// Initialize card drag events
export function initCardEvents() {
  // Delegate drag events
  document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('card')) {
      e.target.classList.add('dragging')
      e.dataTransfer.setData('text/plain', e.target.dataset.cardId)
      e.dataTransfer.effectAllowed = 'move'
    }
  })
  
  document.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('card')) {
      e.target.classList.remove('dragging')
    }
  })
  
  // Card modal submit
  document.getElementById('card-modal-submit').addEventListener('click', async () => {
    const title = document.getElementById('card-title-input').value.trim()
    const description = document.getElementById('card-description-input').value.trim()
    
    if (!title) {
      showToast('Please enter a card title', 'error')
      return
    }
    
    if (window.currentCardId) {
      // Update existing card
      await updateCard(window.currentCardId, { title, description })
    } else {
      // Create new card
      await createCard(window.currentListId, title, description)
    }
    
    closeModal('card-modal')
  })
  
  // Delete card button
  document.getElementById('delete-card-btn').addEventListener('click', async () => {
    if (window.currentCardId && confirm('Delete this card?')) {
      await deleteCard(window.currentCardId)
      closeModal('card-modal')
    }
  })
  
  // Enter key in card title
  document.getElementById('card-title-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      document.getElementById('card-modal-submit').click()
    }
  })
}

// Helper: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
