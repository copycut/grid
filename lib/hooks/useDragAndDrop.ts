import { useState } from 'react'
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
  const { notifyError } = useNotification()

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id

    // Check if dragging a column
    const column = columns.find((col) => col.id === id)
    if (column) {
      setActiveColumn(column)
      return
    }

    // Otherwise it's a card
    const card = columns.flatMap((column) => column.cards).find((card) => card.id === id)
    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    // Handle column reordering
    if (activeColumn) {
      const activeIndex = columns.findIndex((col) => col.id === activeId)
      const overIndex = columns.findIndex((col) => col.id === overId)

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
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
      const activeIndex = sourceColumn.cards.findIndex((card) => card.id === activeId)
      const overIndex = sourceColumn.cards.findIndex((card) => card.id === overId)

      if (activeIndex !== overIndex) {
        setColumns((prev) => {
          const newColumns = [...prev]
          const column = newColumns.find((col) => col.id === sourceColumn.id)

          if (column) {
            const cards = [...column.cards]
            const [removedCard] = cards.splice(activeIndex, 1)
            cards.splice(overIndex, 0, removedCard)
            column.cards = cards
          }
          return newColumns
        })
      }
    } else {
      // Different column - move card
      setColumns((prev) => {
        const newColumns = [...prev]
        const source = newColumns.find((col) => col.id === sourceColumn.id)
        const target = newColumns.find((col) => col.id === targetColumn.id)

        if (source && target) {
          const cardIndex = source.cards.findIndex((card) => card.id === activeId)
          const overIndex = target.cards.findIndex((card) => card.id === overId)

          if (cardIndex !== -1) {
            const [card] = source.cards.splice(cardIndex, 1)
            card.column_id = target.id
            target.cards.splice(overIndex, 0, card)
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

    if (!over) return

    // Handle column drag
    if (activeColumn) {
      const activeIndex = columns.findIndex((col) => col.id === active.id)
      const overIndex = columns.findIndex((col) => col.id === over.id)

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        setColumns((prev) => {
          const newColumns = [...prev]
          const [movedColumn] = newColumns.splice(activeIndex, 1)
          newColumns.splice(overIndex, 0, movedColumn)

          // Update positions for all columns
          newColumns.forEach((col, index) => {
            col.position = index
          })

          return newColumns
        })

        try {
          await moveColumn(active.id as number, overIndex)
        } catch (error) {
          notifyError('Failed to move column', 'Please try again.', error)
        }
      }
      return
    }

    // Handle card drag
    const cardId = active.id as number
    const overId = over.id as number

    const sourceColumn = columns.find((col) => col.cards.some((card) => card.id === cardId))
    if (!sourceColumn) return

    // Check if dropped directly on a column
    let targetColumn = columns.find((col) => col.id === overId)
    let newPosition: number

    if (targetColumn !== undefined) {
      // Dropped on a column - add to end
      newPosition = targetColumn.cards.length
    } else {
      // Dropped on a card
      targetColumn = columns.find((col) => col.cards.some((card) => card.id === overId))
      if (!targetColumn) return
      newPosition = targetColumn.cards.findIndex((card) => card.id === overId)
    }

    const oldPosition = sourceColumn.cards.findIndex((card) => card.id === cardId)

    // Don't save if nothing changed
    if (sourceColumn.id === targetColumn.id && oldPosition === newPosition) {
      return
    }

    try {
      await moveCard(cardId, targetColumn.id, newPosition)
    } catch (error) {
      notifyError('Failed to move card', 'Please try again.', error)
    }
  }

  return { activeCard, activeColumn, handleDragStart, handleDragOver, handleDragEnd }
}
