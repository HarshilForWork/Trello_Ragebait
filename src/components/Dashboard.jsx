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
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Responsive column count
  const getColumns = () => {
    if (isMobile) return 4
    if (isTablet) return 6
    return 12
  }

  // Responsive row height
  const getRowHeight = () => {
    if (isMobile) return 50
    if (isTablet) return 45
    return 40
  }

  // Default layouts for different screen sizes
  const getDefaultLayout = () => {
    if (isMobile) {
      return [
        { i: 'calendar', x: 0, y: 0, w: 4, h: 8, minW: 2, minH: 1 },
        { i: 'progress', x: 0, y: 8, w: 4, h: 6, minW: 2, minH: 1 },
        { i: 'kanban', x: 0, y: 14, w: 4, h: 8, minW: 2, minH: 1 },
        { i: 'notes', x: 0, y: 22, w: 4, h: 6, minW: 2, minH: 1 },
      ]
    }
    if (isTablet) {
      return [
        { i: 'calendar', x: 0, y: 0, w: 3, h: 8, minW: 2, minH: 1 },
        { i: 'progress', x: 3, y: 0, w: 3, h: 5, minW: 2, minH: 1 },
        { i: 'kanban', x: 3, y: 5, w: 3, h: 8, minW: 2, minH: 1 },
        { i: 'notes', x: 0, y: 8, w: 3, h: 6, minW: 2, minH: 1 },
      ]
    }
    return [
      { i: 'calendar', x: 0, y: 0, w: 6, h: 8, minW: 2, minH: 1 },
      { i: 'progress', x: 6, y: 0, w: 6, h: 5, minW: 2, minH: 1 },
      { i: 'kanban', x: 6, y: 5, w: 6, h: 8, minW: 2, minH: 1 },
      { i: 'notes', x: 0, y: 8, w: 6, h: 6, minW: 2, minH: 1 },
    ]
  }

  // Load saved layout or use default
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('dashboard-layout')
    return saved ? JSON.parse(saved) : getDefaultLayout()
  })

  // Update container width and responsive state on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth - 32
        setContainerWidth(width)
        setIsMobile(window.innerWidth < 480)
        setIsTablet(window.innerWidth >= 480 && window.innerWidth < 768)
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Update layout when screen size changes
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-layout')
    if (!saved) {
      setLayout(getDefaultLayout())
    }
  }, [isMobile, isTablet])

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout)
    localStorage.setItem('dashboard-layout', JSON.stringify(newLayout))
  }

  const resetLayout = () => {
    localStorage.removeItem('dashboard-layout')
    setLayout(getDefaultLayout())
  }

  return (
    <div ref={containerRef} className="h-full overflow-auto p-2 sm:p-4">
      {/* Reset Layout Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={resetLayout}
          onTouchStart={(e) => e.stopPropagation()}
          className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Reset layout"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset Layout</span>
        </button>
      </div>

      <GridLayout
        className="layout"
        layout={layout}
        cols={getColumns()}
        rowHeight={getRowHeight()}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-drag-handle"
        isDraggable={!isMobile}
        isResizable={!isMobile}
        compactType="vertical"
        preventCollision={false}
        margin={isMobile ? [8, 8] : [12, 12]}
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
