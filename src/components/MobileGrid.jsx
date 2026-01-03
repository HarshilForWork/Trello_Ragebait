import React, { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableWidget({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Clone children and pass drag props
  const childWithProps = React.cloneElement(children, { 
    dragHandleProps: { ...attributes, ...listeners } 
  })

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <div className="widget-panel h-[400px]">
        {childWithProps}
      </div>
    </div>
  )
}

export default function MobileGrid({ children }) {
  const [items, setItems] = useState(['calendar', 'progress', 'kanban', 'notes'])
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)
        
        const newItems = [...items]
        newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, active.id)
        
        return newItems
      })
    }
  }

  const childrenArray = React.Children.toArray(children)
  const childrenMap = {}
  childrenArray.forEach(child => {
    if (child.key) {
      childrenMap[child.key] = child
    }
  })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map(id => {
            const child = childrenMap[id]
            return child ? (
              <SortableWidget key={id} id={id}>
                {child}
              </SortableWidget>
            ) : null
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
