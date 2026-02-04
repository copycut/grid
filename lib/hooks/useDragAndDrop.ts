import { useState, useRef } from 'react'
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { Card as CardType, ColumnWithCards } from '@/lib/supabase/models'
import { useNotification } from '@/lib/utils/notifications'

export function useDragAndDrop(
  columns: ColumnWithCards[],
  setColumns: React.Dispatch<React.SetStateAction<ColumnWithCards[]>>,
  moveCard: (cardId: number, newColumnId: number, newPosition: number) => Promise<void>,
  moveColumn: (columnId: number, newPosition: number) => Promise<void>
) {
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [activeColumn, setActiveColumn] = useState<ColumnWithCards | null>(null)
  // Store the original column ID and position when drag starts
  const [dragStartInfo, setDragStartInfo] = useState<{ columnId: number; position: number } | null>(null)
  // Store the target position after drag over updates
  const dragEndInfoRef = useRef<{ columnId: number; position: number } | null>(null)
  // Track the last processed drag over to prevent duplicate updates
  const lastDragOverRef = useRef<{ activeId: number; overId: number } | null>(null)
  const { notifyError } = useNotification()

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id

    // Reset the last drag over tracking
    lastDragOverRef.current = null

    // Check if dragging a column
    const column = columns.find((col) => col.id === id)
    if (column) {
      setActiveColumn(column)
      setDragStartInfo(null)
      return
    }

    // Otherwise it's a card
    const card = columns.flatMap((column) => column.cards).find((card) => card.id === id)
    if (card) {
      setActiveCard(card)
      // Store the original column and position
      const sourceColumn = columns.find((col) => col.cards.some((c) => c.id === id))
      if (sourceColumn) {
        const position = sourceColumn.cards.findIndex((c) => c.id === id)
        setDragStartInfo({ columnId: sourceColumn.id, position })
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Check if we've already processed this exact drag over (prevent duplicate calls)
    if (lastDragOverRef.current?.activeId === activeId && lastDragOverRef.current?.overId === overId) {
      return
    }

    // Mark this drag over as processed
    lastDragOverRef.current = { activeId: activeId as number, overId: overId as number }

    if (activeId === overId) return

    // Handle column reordering
    if (activeColumn) {
      const activeIndex = columns.findIndex((col) => col.id === activeId)
      const overIndex = columns.findIndex((col) => col.id === overId)

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        // Store the final position BEFORE updating state
        const simulatedColumns = [...columns]
        const [movedColumn] = simulatedColumns.splice(activeIndex, 1)
        simulatedColumns.splice(overIndex, 0, movedColumn)
        const finalPosition = simulatedColumns.findIndex((col) => col.id === activeId)

        dragEndInfoRef.current = { columnId: activeId as number, position: finalPosition }

        setColumns((prev) => {
          const newColumns = [...prev]
          const [movedColumn] = newColumns.splice(activeIndex, 1)
          newColumns.splice(overIndex, 0, movedColumn)

          // Update positions
          newColumns.forEach((col, index) => {
            col.position = index
          })

          return newColumns
        })
      }
      return
    }

    // Handle card drag
    const sourceColumn = columns.find((col) => col.cards.some((card) => card.id === activeId))
    if (!sourceColumn) return

    // Check if overId is a column (use explicit check, not falsy)
    const overColumn = columns.find((col) => col.id === overId)

    if (overColumn !== undefined) {
      // Dragging over a column - move to end of that column
      if (sourceColumn.id !== overColumn.id) {
        // Store the target position (end of the target column)
        const targetPosition = overColumn.cards.length
        dragEndInfoRef.current = { columnId: overColumn.id, position: targetPosition }

        setColumns((prev) => {
          const newColumns = [...prev]
          const source = newColumns.find((col) => col.id === sourceColumn.id)
          const target = newColumns.find((col) => col.id === overColumn.id)

          if (source && target) {
            const cardIndex = source.cards.findIndex((card) => card.id === activeId)
            if (cardIndex !== -1) {
              const [card] = source.cards.splice(cardIndex, 1)
              card.column_id = target.id
              target.cards.push(card)

              // Update position properties to match array order
              target.cards.forEach((card, index) => {
                card.position = index
              })

              // Update positions in source column too
              source.cards.forEach((card, index) => {
                card.position = index
              })
            }
          }
          return newColumns
        })
      }
      return
    }

    // overId is a card
    const targetColumn = columns.find((col) => col.cards.some((card) => card.id === overId))
    if (!targetColumn) return

    if (sourceColumn.id === targetColumn.id) {
      // Same column - reorder
      // Calculate the target position BEFORE the state update
      const activeIndex = sourceColumn.cards.findIndex((card) => card.id === activeId)
      const overIndex = sourceColumn.cards.findIndex((card) => card.id === overId)

      // Store the target position for handleDragEnd BEFORE updating state
      // Simulate the exact splice operations to get the final position
      const simulatedCards = [...sourceColumn.cards]
      const [removedCard] = simulatedCards.splice(activeIndex, 1)
      simulatedCards.splice(overIndex, 0, removedCard)

      // Find where the active card ended up
      const finalPosition = simulatedCards.findIndex((card) => card.id === activeId)

      dragEndInfoRef.current = { columnId: sourceColumn.id, position: finalPosition }

      if (activeIndex !== overIndex) {
        setColumns((prev) => {
          const newColumns = [...prev]
          const column = newColumns.find((col) => col.id === sourceColumn.id)

          if (column) {
            // Recalculate indices from the CURRENT state to handle multiple callback executions
            const currentActiveIndex = column.cards.findIndex((card) => card.id === activeId)
            const currentOverIndex = column.cards.findIndex((card) => card.id === overId)

            // Only update if:
            // 1. Both cards are found
            // 2. They're not at the same position
            // 3. The active card is moving in the same direction as the original intent
            //    (prevent reversing the move on subsequent callback executions)
            const shouldUpdate =
              currentActiveIndex !== -1 &&
              currentOverIndex !== -1 &&
              currentActiveIndex !== currentOverIndex &&
              // Check if we're moving in the same direction as originally intended
              ((activeIndex < overIndex && currentActiveIndex < currentOverIndex) ||
                (activeIndex > overIndex && currentActiveIndex > currentOverIndex))

            if (shouldUpdate) {
              const cards = [...column.cards]
              const [removedCard] = cards.splice(currentActiveIndex, 1)
              cards.splice(currentOverIndex, 0, removedCard)

              // Update position properties to match array order
              cards.forEach((card, index) => {
                card.position = index
              })

              column.cards = cards
            }
          }
          return newColumns
        })
      }
    } else {
      // Different column - move card
      // Calculate the target position BEFORE the state update
      const overIndex = targetColumn.cards.findIndex((card) => card.id === overId)

      // When inserting into a different column, the card will be at position overIndex
      dragEndInfoRef.current = { columnId: targetColumn.id, position: overIndex }

      setColumns((prev) => {
        const newColumns = [...prev]
        const source = newColumns.find((col) => col.id === sourceColumn.id)
        const target = newColumns.find((col) => col.id === targetColumn.id)

        if (source && target) {
          const cardIndex = source.cards.findIndex((card) => card.id === activeId)
          const currentOverIndex = target.cards.findIndex((card) => card.id === overId)

          if (cardIndex !== -1 && currentOverIndex !== -1) {
            const [card] = source.cards.splice(cardIndex, 1)
            card.column_id = target.id
            target.cards.splice(currentOverIndex, 0, card)

            // Update position properties to match array order
            target.cards.forEach((card, index) => {
              card.position = index
            })

            // Update positions in source column too
            source.cards.forEach((card, index) => {
              card.position = index
            })
          }
        }
        return newColumns
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)
    setActiveColumn(null)

    if (!over) {
      setDragStartInfo(null)
      return
    }

    // Handle column drag
    if (activeColumn) {
      // Use the stored position from handleDragOver
      if (!dragEndInfoRef.current) {
        setDragStartInfo(null)
        return
      }

      const columnId = dragEndInfoRef.current.columnId
      const finalPosition = dragEndInfoRef.current.position

      try {
        await moveColumn(columnId, finalPosition)
      } catch (error) {
        notifyError('Failed to move column', 'Please try again.', error)
      }

      setDragStartInfo(null)
      dragEndInfoRef.current = null
      return
    }

    // Handle card drag
    const cardId = active.id as number

    // Use the stored drag start info for the source column
    if (!dragStartInfo) {
      setDragStartInfo(null)
      return
    }

    const sourceColumnId = dragStartInfo.columnId
    const oldPosition = dragStartInfo.position

    // Use the ref to get the target position set by handleDragOver
    if (!dragEndInfoRef.current) {
      setDragStartInfo(null)
      return
    }

    const targetColumnId = dragEndInfoRef.current.columnId
    const newPosition = dragEndInfoRef.current.position

    // Don't save if nothing changed
    if (sourceColumnId === targetColumnId && oldPosition === newPosition) {
      setDragStartInfo(null)
      dragEndInfoRef.current = null
      return
    }

    try {
      await moveCard(cardId, targetColumnId, newPosition)
    } catch (error) {
      notifyError('Failed to move card', 'Please try again.', error)
    }

    setDragStartInfo(null)
    dragEndInfoRef.current = null
  }

  return { activeCard, activeColumn, handleDragStart, handleDragOver, handleDragEnd }
}
