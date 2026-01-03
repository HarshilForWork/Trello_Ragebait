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
        { i: 'calendar', x: 0, y: 0, w: 4, h: 8, minW: 2, minH: 1, static: true },
        { i: 'progress', x: 0, y: 8, w: 4, h: 6, minW: 2, minH: 1, static: true },
        { i: 'kanban', x: 0, y: 14, w: 4, h: 8, minW: 2, minH: 1, static: true },
        { i: 'notes', x: 0, y: 22, w: 4, h: 6, minW: 2, minH: 1, static: true },
      ]
    }
    if (isTablet) {
      return [
        { i: 'calendar', x: 0, y: 0, w: 3, h: 8, minW: 2, minH: 1, static: true },
        { i: 'progress', x: 3, y: 0, w: 3, h: 5, minW: 2, minH: 1, static: true },
        { i: 'kanban', x: 3, y: 5, w: 3, h: 8, minW: 2, minH: 1, static: true },
        { i: 'notes', x: 0, y: 8, w: 3, h: 6, minW: 2, minH: 1, static: true },
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

  // Apply static property based on device type
  const getLayoutWithStatic = (layoutData) => {
    if (isMobile || isTablet) {
      return layoutData.map(item => ({ ...item, static: true }))
    }
    return layoutData.map(item => ({ ...item, static: false }))
  }

  // Update container width and responsive state on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth - 32
        setContainerWidth(width)
        const screenWidth = window.innerWidth
        setIsMobile(screenWidth < 480)
        setIsTablet(screenWidth >= 480 && screenWidth < 1024)
        console.log('Dashboard size update:', { screenWidth, isMobile: screenWidth < 480, isTablet: screenWidth >= 480 && screenWidth < 1024 })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Update layout when screen size changes - force static on mobile/tablet
  useEffect(() => {
    setLayout(prevLayout => getLayoutWithStatic(prevLayout))
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
    <div ref={containerRef} className="h-full overflow-auto p-2 sm:p-4 touch-manipulation">
      {/* Reset Layout Button - Desktop Only */}
      {!isMobile && !isTablet && (
        <div className="flex justify-end mb-2">
          <button
            onClick={resetLayout}
            className="flex items-center gap-1 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors touch-manipulation"
            title="Reset layout"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Layout</span>
          </button>
        </div>
      )}

      {/* Mobile/Tablet: 2x2 Grid Layout */}
      {(isMobile || isTablet) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
          <div className="widget-panel h-[400px] sm:h-[450px]">
            <CalendarWidget store={store} />
          </div>
          
          <div className="widget-panel h-[400px] sm:h-[450px]">
            <ProgressWidget store={store} />
          </div>
          
          <div className="widget-panel h-[400px] sm:h-[450px]">
            <KanbanWidget store={store} />
          </div>
          
          <div className="widget-panel h-[400px] sm:h-[450px]">
            <NotesWidget store={store} />
          </div>
        </div>
      ) : (
        /* Desktop: GridLayout with Drag & Drop */
        <GridLayout
          key={`grid-${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}
          className="layout"
          layout={getLayoutWithStatic(layout)}
          cols={getColumns()}
          rowHeight={getRowHeight()}
          width={containerWidth}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".widget-drag-handle"
          draggableCancel=".no-drag"
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
          margin={[12, 12]}
          useCSSTransforms={true}
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
      )}
    </div>
  )
}
