import React, { useState, useEffect, useRef } from 'react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import CalendarWidget from './widgets/CalendarWidget'
import ProgressWidget from './widgets/ProgressWidget'
import KanbanWidget from './widgets/KanbanWidget'
import NotesWidget from './widgets/NotesWidget'

export default function Dashboard({ store }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(1200)

  // Default layout configuration
  const defaultLayout = [
    { i: 'calendar', x: 0, y: 0, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'progress', x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'kanban', x: 6, y: 4, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'notes', x: 0, y: 8, w: 6, h: 6, minW: 3, minH: 4 },
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

  return (
    <div ref={containerRef} className="h-full overflow-auto p-4">
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={60}
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
