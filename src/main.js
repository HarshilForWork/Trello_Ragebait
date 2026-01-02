// Mini-Trello - Main Application Entry Point
import './style.css'
import { loadState, state } from './modules/state.js'
import { createBoard, renderBoardSelector, renderActiveBoard, initBoardEvents } from './modules/board.js'
import { initListEvents } from './modules/list.js'
import { initCardEvents } from './modules/card.js'
import { initChecklistEvents } from './modules/checklist.js'
import { initNotesEvents, renderNotes } from './modules/notes.js'
import { initImportExportEvents } from './modules/importexport.js'

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay')
const toastContainer = document.getElementById('toast-container')

// Modal management
export function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.add('active')
    // Focus first input
    const input = modal.querySelector('input, textarea')
    if (input) setTimeout(() => input.focus(), 100)
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove('active')
  }
}

// Close modal when clicking backdrop or close button
function initModalEvents() {
  document.querySelectorAll('.modal').forEach(modal => {
    // Click on backdrop
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id)
      }
    })
    
    // Close buttons
    modal.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => closeModal(modal.id))
    })
  })
  
  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        closeModal(modal.id)
      })
    }
  })
}

// Toast notifications
export function showToast(message, type = 'info') {
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  toast.textContent = message
  
  toastContainer.appendChild(toast)
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100px)'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Hide loading overlay
function hideLoading() {
  loadingOverlay.classList.add('hidden')
}

// Show loading overlay
function showLoading() {
  loadingOverlay.classList.remove('hidden')
}

// Initialize the application
async function init() {
  try {
    // Initialize all event listeners
    initModalEvents()
    initBoardEvents()
    initListEvents()
    initCardEvents()
    initChecklistEvents()
    initNotesEvents()
    initImportExportEvents()
    
    // Board creation buttons
    document.getElementById('add-board-btn').addEventListener('click', () => {
      document.getElementById('board-modal-title').textContent = 'Create Board'
      document.getElementById('board-name-input').value = ''
      openModal('board-modal')
    })
    
    document.getElementById('create-first-board-btn').addEventListener('click', () => {
      document.getElementById('board-modal-title').textContent = 'Create Board'
      document.getElementById('board-name-input').value = ''
      openModal('board-modal')
    })
    
    // Board modal submit
    document.getElementById('board-modal-submit').addEventListener('click', async () => {
      const name = document.getElementById('board-name-input').value.trim()
      if (name) {
        await createBoard(name)
        closeModal('board-modal')
      }
    })
    
    // Enter key in board name input
    document.getElementById('board-name-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('board-modal-submit').click()
      }
    })
    
    // Load data from Supabase
    const success = await loadState()
    
    if (success) {
      renderBoardSelector()
      renderActiveBoard()
      renderNotes()
      hideLoading()
    } else {
      hideLoading()
      showToast('Failed to connect to database. Check your .env configuration.', 'error')
    }
  } catch (error) {
    console.error('Initialization error:', error)
    hideLoading()
    showToast('Application failed to initialize', 'error')
  }
}

// Start the application
init()
