// Import/Export Module - JSON import and export functionality
import { supabase } from '../lib/supabase.js'
import { state, loadState } from './state.js'
import { renderBoardSelector, renderActiveBoard } from './board.js'
import { renderNotes } from './notes.js'
import { showToast } from '../main.js'

// Export all data to JSON
export async function exportToJSON() {
  try {
    showToast('Preparing export...', 'info')
    
    // Reload fresh data from Supabase
    await loadState()
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      boards: state.boards,
      notes: state.notes
    }
    
    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `mini-trello-export-${formatDate(new Date())}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showToast('Data exported successfully!', 'success')
  } catch (error) {
    console.error('Error exporting data:', error)
    showToast('Failed to export data', 'error')
  }
}

// Import data from JSON file
export async function importFromJSON(file) {
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    // Validate structure
    if (!data.boards || !Array.isArray(data.boards)) {
      throw new Error('Invalid file format: missing boards array')
    }
    
    showToast('Importing data...', 'info')
    
    // Ask user whether to merge or replace
    const shouldReplace = confirm(
      'Import options:\n\n' +
      'OK = Replace all existing data\n' +
      'Cancel = Merge with existing data\n\n' +
      'Choose your import method:'
    )
    
    if (shouldReplace) {
      // Delete all existing data
      await clearAllData()
    }
    
    // Import boards with lists, cards, and checklists
    for (const board of data.boards) {
      await importBoard(board)
    }
    
    // Import notes if present
    if (data.notes && Array.isArray(data.notes)) {
      for (const note of data.notes) {
        await importNote(note)
      }
    }
    
    // Reload state
    await loadState()
    renderBoardSelector()
    renderActiveBoard()
    renderNotes()
    
    showToast('Data imported successfully!', 'success')
  } catch (error) {
    console.error('Error importing data:', error)
    showToast(`Import failed: ${error.message}`, 'error')
  }
}

// Import a single board with all nested data
async function importBoard(boardData) {
  // Create board
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .insert([{
      name: boardData.name,
      position: boardData.position || 0
    }])
    .select()
    .single()
  
  if (boardError) throw boardError
  
  // Import lists
  if (boardData.lists && Array.isArray(boardData.lists)) {
    for (const listData of boardData.lists) {
      await importList(board.id, listData)
    }
  }
  
  return board
}

// Import a single list with cards
async function importList(boardId, listData) {
  const { data: list, error: listError } = await supabase
    .from('lists')
    .insert([{
      board_id: boardId,
      name: listData.name,
      position: listData.position || 0
    }])
    .select()
    .single()
  
  if (listError) throw listError
  
  // Import cards
  if (listData.cards && Array.isArray(listData.cards)) {
    for (const cardData of listData.cards) {
      await importCard(list.id, cardData)
    }
  }
  
  return list
}

// Import a single card with checklist
async function importCard(listId, cardData) {
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .insert([{
      list_id: listId,
      title: cardData.title,
      description: cardData.description || '',
      position: cardData.position || 0
    }])
    .select()
    .single()
  
  if (cardError) throw cardError
  
  // Import checklist items
  if (cardData.checklist && Array.isArray(cardData.checklist)) {
    for (const item of cardData.checklist) {
      await supabase
        .from('checklist_items')
        .insert([{
          card_id: card.id,
          text: item.text,
          completed: item.completed || false,
          position: item.position || 0
        }])
    }
  }
  
  return card
}

// Import a single note
async function importNote(noteData) {
  const { error } = await supabase
    .from('notes')
    .insert([{
      title: noteData.title,
      content: noteData.content || ''
    }])
  
  if (error) throw error
}

// Clear all existing data
async function clearAllData() {
  // Delete in order due to foreign keys
  await supabase.from('checklist_items').delete().neq('id', '')
  await supabase.from('cards').delete().neq('id', '')
  await supabase.from('lists').delete().neq('id', '')
  await supabase.from('boards').delete().neq('id', '')
  await supabase.from('notes').delete().neq('id', '')
}

// Initialize import/export events
export function initImportExportEvents() {
  const importBtn = document.getElementById('import-btn')
  const importFile = document.getElementById('import-file')
  const exportBtn = document.getElementById('export-btn')
  
  // Import button click
  importBtn.addEventListener('click', () => {
    importFile.click()
  })
  
  // File selected
  importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (file) {
      await importFromJSON(file)
      importFile.value = '' // Reset file input
    }
  })
  
  // Export button click
  exportBtn.addEventListener('click', exportToJSON)
}

// Helper: Format date for filename
function formatDate(date) {
  return date.toISOString().split('T')[0]
}
