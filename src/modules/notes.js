// Notes Module - Mini notes with auto-linkify
import { supabase } from '../lib/supabase.js'
import { state, updateState } from './state.js'
import { showToast, openModal, closeModal } from '../main.js'
import { linkify } from '../utils/linkify.js'

// DOM Elements
const notesSidebar = document.getElementById('notes-sidebar')
const notesOverlay = document.getElementById('notes-overlay')
const notesList = document.getElementById('notes-list')

// Open notes sidebar
export function openNotesSidebar() {
  notesSidebar.classList.add('open')
  notesOverlay.classList.add('active')
  renderNotes()
}

// Close notes sidebar
export function closeNotesSidebar() {
  notesSidebar.classList.remove('open')
  notesOverlay.classList.remove('active')
}

// Toggle notes sidebar
export function toggleNotesSidebar() {
  if (notesSidebar.classList.contains('open')) {
    closeNotesSidebar()
  } else {
    openNotesSidebar()
  }
}

// Create a new note
export async function createNote(title, content) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, content }])
      .select()
      .single()
    
    if (error) throw error
    
    // Add to local state (at the beginning)
    state.notes.unshift(data)
    updateState()
    renderNotes()
    showToast('Note created!', 'success')
    
    return data
  } catch (error) {
    console.error('Error creating note:', error)
    showToast('Failed to create note', 'error')
    return null
  }
}

// Update a note
export async function updateNote(noteId, updates) {
  try {
    const { error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
    
    if (error) throw error
    
    // Update local state
    const note = state.notes.find(n => n.id === noteId)
    if (note) {
      Object.assign(note, updates)
      updateState()
      renderNotes()
    }
    
    showToast('Note updated!', 'success')
    return true
  } catch (error) {
    console.error('Error updating note:', error)
    showToast('Failed to update note', 'error')
    return false
  }
}

// Delete a note
export async function deleteNote(noteId) {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
    
    if (error) throw error
    
    // Remove from local state
    const index = state.notes.findIndex(n => n.id === noteId)
    if (index > -1) {
      state.notes.splice(index, 1)
      updateState()
      renderNotes()
      showToast('Note deleted', 'info')
    }
    
    return true
  } catch (error) {
    console.error('Error deleting note:', error)
    showToast('Failed to delete note', 'error')
    return false
  }
}

// Render all notes
export function renderNotes() {
  notesList.innerHTML = ''
  
  if (state.notes.length === 0) {
    notesList.innerHTML = `
      <div class="empty-notes" style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <p>No notes yet</p>
        <p style="font-size: 12px;">Create a note to get started!</p>
      </div>
    `
    return
  }
  
  state.notes.forEach(note => {
    const noteEl = document.createElement('div')
    noteEl.className = 'note-item'
    noteEl.dataset.noteId = note.id
    
    // Format date
    const date = new Date(note.created_at)
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    
    // Linkify content for preview
    const linkedContent = linkify(note.content || '')
    
    noteEl.innerHTML = `
      <div class="note-title">${escapeHtml(note.title)}</div>
      <div class="note-preview">${linkedContent}</div>
      <div class="note-date">${formattedDate}</div>
    `
    
    // Click to edit
    noteEl.addEventListener('click', (e) => {
      // Don't open modal if clicking a link
      if (e.target.tagName === 'A') return
      openNoteModal(note)
    })
    
    notesList.appendChild(noteEl)
  })
}

// Open note modal for editing
function openNoteModal(note) {
  window.currentNoteId = note ? note.id : null
  
  document.getElementById('note-modal-title').textContent = note ? 'Edit Note' : 'New Note'
  document.getElementById('note-title-input').value = note ? note.title : ''
  document.getElementById('note-content-input').value = note ? note.content : ''
  document.getElementById('delete-note-btn').style.display = note ? 'inline-flex' : 'none'
  
  openModal('note-modal')
}

// Initialize notes events
export function initNotesEvents() {
  // Toggle button
  document.getElementById('notes-toggle-btn').addEventListener('click', toggleNotesSidebar)
  
  // Close button
  document.getElementById('close-notes-btn').addEventListener('click', closeNotesSidebar)
  
  // Overlay click
  notesOverlay.addEventListener('click', closeNotesSidebar)
  
  // Add note button
  document.getElementById('add-note-btn').addEventListener('click', () => {
    openNoteModal(null)
  })
  
  // Note modal submit
  document.getElementById('note-modal-submit').addEventListener('click', async () => {
    const title = document.getElementById('note-title-input').value.trim()
    const content = document.getElementById('note-content-input').value.trim()
    
    if (!title) {
      showToast('Please enter a note title', 'error')
      return
    }
    
    if (window.currentNoteId) {
      await updateNote(window.currentNoteId, { title, content })
    } else {
      await createNote(title, content)
    }
    
    closeModal('note-modal')
  })
  
  // Delete note button
  document.getElementById('delete-note-btn').addEventListener('click', async () => {
    if (window.currentNoteId && confirm('Delete this note?')) {
      await deleteNote(window.currentNoteId)
      closeModal('note-modal')
    }
  })
  
  // Keyboard shortcut to close sidebar (Escape)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notesSidebar.classList.contains('open')) {
      closeNotesSidebar()
    }
  })
}

// Helper: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
