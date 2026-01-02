// Checklist Module - Subtask handling with tickable UI
import { supabase } from '../lib/supabase.js'
import { findCard, getActiveBoard, updateState } from './state.js'
import { renderLists } from './list.js'
import { showToast } from '../main.js'

// DOM Elements
const checklistContainer = document.getElementById('checklist-container')
const checklistItemInput = document.getElementById('checklist-item-input')

// Add a checklist item
export async function addChecklistItem(cardId, text) {
  try {
    const result = findCard(cardId)
    if (!result) return null
    
    const position = result.card.checklist?.length || 0
    
    const { data, error } = await supabase
      .from('checklist_items')
      .insert([{ card_id: cardId, text, position, completed: false }])
      .select()
      .single()
    
    if (error) throw error
    
    // Add to local state
    if (!result.card.checklist) result.card.checklist = []
    result.card.checklist.push(data)
    
    updateState()
    renderChecklist(result.card)
    
    return data
  } catch (error) {
    console.error('Error adding checklist item:', error)
    showToast('Failed to add checklist item', 'error')
    return null
  }
}

// Toggle a checklist item
export async function toggleChecklistItem(cardId, itemId) {
  try {
    const result = findCard(cardId)
    if (!result) return false
    
    const item = result.card.checklist?.find(i => i.id === itemId)
    if (!item) return false
    
    const newCompleted = !item.completed
    
    const { error } = await supabase
      .from('checklist_items')
      .update({ completed: newCompleted })
      .eq('id', itemId)
    
    if (error) throw error
    
    // Update local state
    item.completed = newCompleted
    updateState()
    renderChecklist(result.card)
    renderLists(getActiveBoard())
    
    return true
  } catch (error) {
    console.error('Error toggling checklist item:', error)
    showToast('Failed to update checklist', 'error')
    return false
  }
}

// Delete a checklist item
export async function deleteChecklistItem(cardId, itemId) {
  try {
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId)
    
    if (error) throw error
    
    // Remove from local state
    const result = findCard(cardId)
    if (result?.card.checklist) {
      const index = result.card.checklist.findIndex(i => i.id === itemId)
      if (index > -1) {
        result.card.checklist.splice(index, 1)
        updateState()
        renderChecklist(result.card)
        renderLists(getActiveBoard())
      }
    }
    
    return true
  } catch (error) {
    console.error('Error deleting checklist item:', error)
    showToast('Failed to delete checklist item', 'error')
    return false
  }
}

// Load checklist for a card (in modal)
export function loadChecklistForCard(card) {
  renderChecklist(card)
}

// Render checklist in modal
export function renderChecklist(card) {
  checklistContainer.innerHTML = ''
  
  const items = card.checklist || []
  const completedCount = items.filter(i => i.completed).length
  const totalCount = items.length
  
  // Progress bar
  if (totalCount > 0) {
    const progressPercent = Math.round((completedCount / totalCount) * 100)
    const progressEl = document.createElement('div')
    progressEl.className = 'checklist-progress'
    progressEl.innerHTML = `<div class="checklist-progress-bar" style="width: ${progressPercent}%"></div>`
    checklistContainer.appendChild(progressEl)
  }
  
  // Items
  items.forEach(item => {
    const itemEl = document.createElement('div')
    itemEl.className = `checklist-item ${item.completed ? 'completed' : ''}`
    itemEl.innerHTML = `
      <input type="checkbox" class="checklist-checkbox" ${item.completed ? 'checked' : ''} data-item-id="${item.id}">
      <span class="checklist-text">${escapeHtml(item.text)}</span>
      <button class="checklist-delete" data-item-id="${item.id}">&times;</button>
    `
    
    // Toggle checkbox
    const checkbox = itemEl.querySelector('.checklist-checkbox')
    checkbox.addEventListener('change', () => {
      toggleChecklistItem(card.id, item.id)
    })
    
    // Delete button
    const deleteBtn = itemEl.querySelector('.checklist-delete')
    deleteBtn.addEventListener('click', () => {
      deleteChecklistItem(card.id, item.id)
    })
    
    checklistContainer.appendChild(itemEl)
  })
}

// Initialize checklist events
export function initChecklistEvents() {
  // Add checklist item button
  document.getElementById('add-checklist-item-btn').addEventListener('click', async () => {
    const text = checklistItemInput.value.trim()
    if (text && window.currentCardId) {
      await addChecklistItem(window.currentCardId, text)
      checklistItemInput.value = ''
    }
  })
  
  // Enter key in checklist input
  checklistItemInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.getElementById('add-checklist-item-btn').click()
    }
  })
}

// Helper: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
