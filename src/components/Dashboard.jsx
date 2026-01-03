import React, { useState, useEffect, useRef } from 'react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import CalendarWidget from './widgets/CalendarWidget'
import ProgressWidget from './widgets/ProgressWidget'
import KanbanWidget from './widgets/KanbanWidget'
import NotesWidget from './widgets/NotesWidget'
import { RotateCcw } from 'lucide-react'

export default function Dashboard({ store }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(1200)

  // Default layout configuration
  const defaultLayout = [
    { i: 'calendar', x: 0, y: 0, w: 6, h: 8, minW: 2, minH: 1 },
    { i: 'progress', x: 6, y: 0, w: 6, h: 5, minW: 2, minH: 1 },
    { i: 'kanban', x: 6, y: 5, w: 6, h: 8, minW: 2, minH: 1 },
    { i: 'notes', x: 0, y: 8, w: 6, h: 6, minW: 2, minH: 1 },
  ]

  // Load saved layout from localStorage or use default
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('dashboard-layout')
    return saved ? JSON.parse(saved) : defaultLayout
  })

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 32) // subtract padding
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout)
    localStorage.setItem('dashboard-layout', JSON.stringify(newLayout))
  }

  const resetLayout = () => {
    localStorage.removeItem('dashboard-layout')
    setLayout(defaultLayout)
  }

  return (
    <div ref={containerRef} className="h-full overflow-auto p-4">
      {/* Reset Layout Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={resetLayout}
          className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Reset layout"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Layout
        </button>
      </div>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={40}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-drag-handle"
        isDraggable
        isResizable
        compactType="vertical"
        preventCollision={false}
      >
        <div key="calendar" className="widget-panel">
          <CalendarWidget store={store} />
        </div>
        
        <div key="progress" className="widget-panel">
          <ProgressWidget store={store} />
        </div>
        
        <div key="kanban" className="widget-panel">
          <KanbanWidget store={store} />
        </div>
        
        <div key="notes" className="widget-panel">
          <NotesWidget store={store} />
        </div>
      </GridLayout>
    </div>
  )
}
